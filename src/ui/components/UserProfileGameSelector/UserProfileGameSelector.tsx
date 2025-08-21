import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { fetchGamesCatalogAction } from '@application/state/actions/catalogs.actions';
import {
  addUserGameAction,
  removeUserGameAction,
  getUserProfileAction,
} from '@application/state/actions/profile.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';
// no direct API calls here; we rely on Redux actions and parent to load initial selection
import {
  applyGameToggleToProfile,
  setSelectedGameIds,
} from '@application/state/slices/profileSlice';
import { useAuth } from '@ui/hooks/useAuth';

type LegacyGamesPayload = { games: Array<{ code: string }> };
type TogglePayload = { gameId?: number; selected?: boolean };

const isLegacyGamesPayload = (value: unknown): value is LegacyGamesPayload => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { games?: unknown }).games)
  );
};

const isTogglePayload = (value: unknown): value is TogglePayload => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    ('gameId' in v && typeof v.gameId === 'number') ||
    ('selected' in v && typeof v.selected === 'boolean')
  );
};

export const UserProfileGameSelector = () => {
  const { t } = useTranslation();
  const assetsPath = '/assets/images/games/icons/';
  const assetsSize = 32;
  const { user } = useAuth();
  const userId = useMemo(() => String(user?.id ?? ''), [user?.id]);
  const [loading, setLoading] = useState<boolean>(false);
  const [codeToId, setCodeToId] = useState<Record<string, number>>({});
  const dispatch = useAppDispatch();
  const { games } = useAppSelector(state => state.catalogs);
  const { games: selectedIds, loading: profileLoading } = useAppSelector(state => state.profile);

  const catalogLoadedRef = useRef(false);
  const profileLoadedRef = useRef(false);

  // Fetch games catalog
  useEffect(() => {
    if (catalogLoadedRef.current) return;
    if (games.length > 0) {
      // Already in store, just build id map from store
      const map: Record<string, number> = {};
      for (const g of games as Array<{ id: string; code: string }>) {
        const numericId = Number(g.id);
        if (Number.isFinite(numericId)) {
          map[g.code] = numericId;
        }
      }
      setCodeToId(map);
      catalogLoadedRef.current = true;
      return;
    }
    catalogLoadedRef.current = true;
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const res = await dispatch(fetchGamesCatalogAction());
        if (fetchGamesCatalogAction.fulfilled.match(res)) {
          const payloadCatalog = (res.payload.data?.games || []) as Array<{
            id?: string;
            code: string;
          }>;
          const finalCatalog = (
            Array.isArray(payloadCatalog) && payloadCatalog.every(g => typeof g.id === 'string')
              ? payloadCatalog
              : (games as Array<{ id: string; code: string }>)
          ) as Array<{ id?: string; code: string }>;
          const map: Record<string, number> = {};
          for (const g of finalCatalog) {
            const numericId = Number(g.id);
            if (Number.isFinite(numericId)) {
              map[g.code] = numericId;
            }
          }
          setCodeToId(map);
        }
      } finally {
        setLoading(false);
      }
    };
    void loadCatalog();
  }, [userId, games.length]);

  // Get user's games via public profile (canonical)
  useEffect(() => {
    if (!userId || profileLoadedRef.current) return;
    profileLoadedRef.current = true;
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const res = await dispatch(getUserProfileAction({ userId }));
        const payloadUserGames = getUserProfileAction.fulfilled.match(res)
          ? (((res.payload as unknown as { data?: { games?: Array<{ id: number }> } }).data
              ?.games as Array<{ id: number }>) ?? [])
          : [];
        const ids = payloadUserGames.map(g => Number(g.id)).filter(n => Number.isFinite(n));
        if (ids.length) {
          dispatch(setSelectedGameIds(ids));
        }
      } finally {
        setLoading(false);
      }
    };
    void loadUserProfile();
  }, [userId, profileLoading]);

  // Render games
  return games.map(game => {
    const isSelected = selectedIds.includes(Number(game.id));
    const variant = isSelected ? 'theme active' : 'outline-theme';

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!userId) return;
      const fallbackId = Number(games.find(g => g.code === game.code)?.id);
      const gameId = codeToId[game.code] ?? (Number.isFinite(fallbackId) ? fallbackId : undefined);
      if (!gameId) return;
      try {
        setLoading(true);
        if (isSelected) {
          const res = await dispatch(
            removeUserGameAction({
              userId: Number.isNaN(Number(userId)) ? userId : Number(userId),
              gameId,
            })
          );
          const legacyGames = removeUserGameAction.fulfilled.match(res)
            ? isLegacyGamesPayload(res.payload.data)
              ? res.payload.data.games
              : undefined
            : undefined;
          if (Array.isArray(legacyGames)) {
            const ids = legacyGames
              .map(g => Number(codeToId[g.code] ?? games.find(x => x.code === g.code)?.id))
              .filter(n => Number.isFinite(n));
            dispatch(setSelectedGameIds(ids));
            return;
          }
          const selected =
            removeUserGameAction.fulfilled.match(res) && isTogglePayload(res.payload.data)
              ? Boolean(res.payload.data.selected === true)
              : false;
          const toggledGameId =
            removeUserGameAction.fulfilled.match(res) && isTogglePayload(res.payload.data)
              ? res.payload.data.gameId
              : undefined;
          if (toggledGameId) {
            const toggledCode =
              Object.entries(codeToId).find(([, id]) => id === toggledGameId)?.[0] ||
              (games.find(g => Number(g.id) === toggledGameId)?.code as string | undefined);
            if (toggledCode) {
              dispatch(applyGameToggleToProfile({ gameId: toggledGameId, selected }));
            }
          }
        } else {
          const res = await dispatch(
            addUserGameAction({
              userId: Number.isNaN(Number(userId)) ? userId : Number(userId),
              gameId,
            })
          );
          const legacyGames = addUserGameAction.fulfilled.match(res)
            ? isLegacyGamesPayload(res.payload.data)
              ? res.payload.data.games
              : undefined
            : undefined;
          if (Array.isArray(legacyGames)) {
            const ids = legacyGames
              .map(g => Number(codeToId[g.code] ?? games.find(x => x.code === g.code)?.id))
              .filter(n => Number.isFinite(n));
            dispatch(setSelectedGameIds(ids));
            return;
          }
          const selected =
            addUserGameAction.fulfilled.match(res) && isTogglePayload(res.payload.data)
              ? Boolean(res.payload.data.selected)
              : false;
          const toggledGameId =
            addUserGameAction.fulfilled.match(res) && isTogglePayload(res.payload.data)
              ? res.payload.data.gameId
              : undefined;
          if (toggledGameId) {
            const toggledCode =
              Object.entries(codeToId).find(([, id]) => id === toggledGameId)?.[0] ||
              (games.find(g => Number(g.id) === toggledGameId)?.code as string | undefined);
            if (toggledCode) {
              dispatch(applyGameToggleToProfile({ gameId: toggledGameId, selected }));
            }
          }
        }
      } catch {
        // Do not optimistically toggle; keep current state on error
      } finally {
        setLoading(false);
      }
    };

    return (
      <Button
        key={game.code}
        variant={variant}
        className="mb-2 me-2 d-inline-flex align-items-center w-auto"
        onClick={handleClick}
        disabled={loading}
        data-testid={`game-${game.code}`}>
        <img
          src={`${assetsPath}${game.imageFilename}`}
          alt={t(game.nameCode)}
          width={assetsSize}
          height={assetsSize}
          aria-hidden="true"
          role="presentation"
        />
        <span className="ms-2">{t(game.nameCode)}</span>
      </Button>
    );
  });
  // Render warning below list when needed
  // The parent maps this return, so we append fragment with warning
  // Consumers should place this component inside a container capable of showing the alert below
};

export const UserProfileGameSelectorWithWarning = () => {
  const { t } = useTranslation();
  const selectedIds = useAppSelector(state => state.profile.games);
  const showWarning = selectedIds.length === 0;

  return (
    <div>
      <div className="d-flex flex-wrap">
        <UserProfileGameSelector />
      </div>
      {showWarning && (
        <Alert variant="warning" className="mt-2" data-testid="games-warning">
          {t('user-profile.games.warning_missing', {
            defaultValue:
              'Your profile will not appear in search results until you select at least one game.',
          })}
        </Alert>
      )}
    </div>
  );
};

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import {
  addUserGameAction,
  fetchGamesCatalogAction,
  removeUserGameAction,
} from '@application/state/actions/preferences.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';
// no direct API calls here; we rely on Redux actions and parent to load initial selection
import { GAMES } from '@shared/constants/games';
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

export const UserProfileGameSelector = ({
  userSelectedGames,
  setUserSelectedGames,
}: {
  userSelectedGames: string[];
  setUserSelectedGames: (games: string[]) => void;
}) => {
  const { t } = useTranslation();
  const assetsPath = '/assets/images/games/icons/';
  const assetsSize = 32;
  const { user } = useAuth();
  const userId = useMemo(() => String(user?.id ?? ''), [user?.id]);
  const [loading, setLoading] = useState<boolean>(false);
  const [codeToId, setCodeToId] = useState<Record<string, number>>({});
  const dispatch = useAppDispatch();
  const { gamesCatalog } = useAppSelector(state => state.preferences);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!userId || initializedRef.current) return;
    initializedRef.current = true;
    const loadCatalog = async () => {
      setLoading(true);
      try {
        // Evitar llamada si ya está en el store
        const needsFetch = gamesCatalog.length === 0;
        const res = needsFetch ? await dispatch(fetchGamesCatalogAction()) : null;
        const payloadCatalog = (
          res && fetchGamesCatalogAction.fulfilled.match(res) ? res.payload.data?.games : []
        ) as Array<{
          id?: number;
          code: string;
        }>;
        const finalCatalog =
          Array.isArray(payloadCatalog) && payloadCatalog.every(g => typeof g.id === 'number')
            ? (payloadCatalog as Array<{ id: number; code: string }>)
            : (gamesCatalog as Array<{ id: number; code: string }>);
        const map: Record<string, number> = {};
        for (const g of finalCatalog) map[g.code] = g.id;
        setCodeToId(map);
      } finally {
        setLoading(false);
      }
    };
    void loadCatalog();
  }, [userId, gamesCatalog.length]);

  return GAMES.map(game => {
    const isSelected = userSelectedGames.includes(game.value);
    const variant = isSelected ? 'theme active' : 'outline-theme';

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!userId) return;
      const gameId =
        codeToId[game.value] ??
        (gamesCatalog.find(g => g.code === game.value)?.id as number | undefined);
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
            setUserSelectedGames(legacyGames.map(g => g.code));
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
            const toggledCode = Object.entries(codeToId).find(
              ([, id]) => id === toggledGameId
            )?.[0];
            if (toggledCode) {
              const set = new Set(userSelectedGames);
              if (selected) set.add(toggledCode);
              else set.delete(toggledCode);
              setUserSelectedGames(Array.from(set.values()));
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
            setUserSelectedGames(legacyGames.map(g => g.code));
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
            const toggledCode = Object.entries(codeToId).find(
              ([, id]) => id === toggledGameId
            )?.[0];
            if (toggledCode) {
              const set = new Set(userSelectedGames);
              if (selected) set.add(toggledCode);
              else set.delete(toggledCode);
              setUserSelectedGames(Array.from(set.values()));
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
        key={game.value}
        variant={variant}
        className="mb-2 me-2 d-inline-flex align-items-center w-auto"
        onClick={handleClick}
        disabled={loading}
        data-testid={`game-${game.value}`}>
        <img
          src={`${assetsPath}${game.asset}`}
          alt={t(game.titleKey)}
          width={assetsSize}
          height={assetsSize}
          aria-hidden="true"
          role="presentation"
        />
        <span className="ms-2">{t(game.titleKey)}</span>
      </Button>
    );
  });
  // Render warning below list when needed
  // The parent maps this return, so we append fragment with warning
  // Consumers should place this component inside a container capable of showing the alert below
};

export const UserProfileGameSelectorWithWarning = (props: {
  userSelectedGames: string[];
  setUserSelectedGames: (games: string[]) => void;
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>(props.userSelectedGames);
  const [showWarning, setShowWarning] = useState<boolean>(props.userSelectedGames.length === 0);

  useEffect(() => {
    setSelected(props.userSelectedGames);
    setShowWarning(props.userSelectedGames.length === 0);
  }, [props.userSelectedGames]);

  return (
    <div>
      <div className="d-flex flex-wrap">
        <UserProfileGameSelector
          userSelectedGames={selected}
          setUserSelectedGames={props.setUserSelectedGames}
        />
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

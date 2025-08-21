import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FormSelect, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { fetchTimezonesCatalogAction } from '@application/state/actions/catalogs.actions';
import {
  putUserTimezoneProfileAction,
  getUserProfileAction,
} from '@application/state/actions/profile.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import { useAuth } from '@ui/hooks/useAuth';

export const TimeZoneSelector = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = useMemo(() => String(user?.id || ''), [user?.id]);

  const dispatch = useAppDispatch();
  const { timezone, loading: profileLoading } = useAppSelector(state => state.profile);
  const { timezones } = useAppSelector(state => state.catalogs);

  const [userTimezone, setUserTimezone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(profileLoading);
  const [saving, setSaving] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const initializedRef = useRef(false);

  // Load timezones catalog
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const load = async () => {
      setLoading(true);
      try {
        if (timezones.length === 0) {
          await dispatch(fetchTimezonesCatalogAction());
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [dispatch, userId, timezones.length]);

  // Get user timezone via public profile
  useEffect(() => {
    if (!userId || loading || timezone) return;
    (async () => {
      try {
        await dispatch(getUserProfileAction({ userId }));
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, userId, loading, timezone]);

  // Set user timezone
  useEffect(() => {
    const tz = userTimezone || timezone || '';
    setUserTimezone(tz);
    setShowWarning(!tz);
  }, [timezone]);

  // Handle timezone change
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!userId) return;
    setUserTimezone(value);
    void persistTimezone(value);
  };

  // Persist timezone
  const persistTimezone = async (timezone: string) => {
    if (!userId) return;
    setSaving(true);
    try {
      const resp = await dispatch(
        putUserTimezoneProfileAction({
          userId: Number.isNaN(Number(userId)) ? userId : Number(userId),
          timezone,
        })
      ).unwrap();
      const nextTimezone = resp?.data?.timezone ?? '';
      setUserTimezone(nextTimezone || '');
      setShowWarning(!nextTimezone);
    } catch {
      // Si el backend devuelve VALIDATION_ERROR (p. ej., timezone vacío),
      // mantener la opción vacía seleccionada y mostrar el aviso.
      setUserTimezone('');
      setShowWarning(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FormSelect
        id="timezone-select"
        name="timezone-select"
        value={userTimezone}
        onChange={handleChange}
        disabled={loading || saving}
        title={t('user-profile.location.timezone.select_placeholder', {
          defaultValue: 'Select a timezone',
        })}>
        <option value="">
          {t('user-profile.location.timezone.select_placeholder', {
            defaultValue: 'Select a timezone',
          })}
        </option>
        {timezones.map(tz => (
          <option key={tz.id} value={tz.id}>
            {tz.id}
            {tz.utcOffset ? ` (${tz.utcOffset})` : ''}
          </option>
        ))}
      </FormSelect>
      {(loading || saving) && <Spinner animation="border" size="sm" className="ms-2" />}
      {showWarning && (
        <Alert variant="warning" className="mt-2" data-testid="timezone-warning">
          {t('user-profile.location.timezone.warning_missing', {
            defaultValue:
              'Your profile will not appear in search results until you select your timezone.',
          })}
        </Alert>
      )}
    </>
  );
};

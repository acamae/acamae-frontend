import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FormSelect, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import {
  fetchAvailabilityAction,
  fetchTimezonesAction,
  putAvailabilityAction,
} from '@application/state/actions/preferences.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import { useAuth } from '@ui/hooks/useAuth';

// No local type needed; using data shape from Redux slice

export const TimeZoneSelector = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = useMemo(() => String(user?.id ?? ''), [user?.id]);

  const dispatch = useAppDispatch();
  const { timezones, timezone, availability } = useAppSelector(state => state.preferences);
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const load = async () => {
      setLoading(true);
      try {
        if (timezones.length === 0) {
          await dispatch(fetchTimezonesAction());
        }
        if (userId && availability.length === 0) {
          await dispatch(fetchAvailabilityAction(userId));
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [dispatch, userId, timezones.length, availability.length]);

  useEffect(() => {
    const tz = userTimezone || timezone || '';
    setUserTimezone(tz);
    setShowWarning(!tz);
  }, [timezone]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!userId) return;
    setUserTimezone(value);
    void persistTimezone(value);
  };

  const persistTimezone = async (timezone: string) => {
    if (!userId) return;
    setSaving(true);
    try {
      await dispatch(
        putAvailabilityAction({
          userId: Number.isNaN(Number(userId)) ? userId : Number(userId),
          timezone,
          windows: [],
        })
      );
      setShowWarning(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <FormSelect value={userTimezone} onChange={handleChange} disabled={loading || saving}>
        <option value="">
          {t('user-profile.timezone.select_placeholder', { defaultValue: 'Select a timezone' })}
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
          {t('user-profile.timezone.warning_missing', {
            defaultValue:
              'Your profile will not appear in search results until you select your timezone.',
          })}
        </Alert>
      )}
    </div>
  );
};

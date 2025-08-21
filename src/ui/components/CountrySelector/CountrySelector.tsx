import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FormSelect, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { fetchCountriesCatalogAction } from '@application/state/actions/catalogs.actions';
import { putUserCountryAction } from '@application/state/actions/profile.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';

export const CountrySelector = () => {
  const { t } = useTranslation();
  const profileId = useAppSelector(state => {
    // Safely read either logged in user id or existing profile id
    const authUserId = (state as { auth?: { user?: { id?: string | number } } }).auth?.user?.id;
    const existingProfileId = (state as { profile?: { profileId?: string | number } }).profile
      ?.profileId;
    return (authUserId ?? existingProfileId ?? '') as string | number | '';
  });
  const userProfileId = useMemo(() => String(profileId || ''), [profileId]);

  const dispatch = useAppDispatch();
  const { countries } = useAppSelector(state => state.catalogs);
  const { country } = useAppSelector(state => state.profile);
  const [userCountry, setUserCountry] = useState<string>('');
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
        if (!countries.length) {
          await dispatch(fetchCountriesCatalogAction());
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [dispatch, countries.length]);

  useEffect(() => {
    if (userCountry) return; // keep user selection once set
    const initial = country || '';
    setUserCountry(initial);
    setShowWarning(!initial);
  }, [countries, country, userCountry]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!userProfileId) {
      // Fail fast: profileId is required to update country
      setShowWarning(true);
      return;
    }
    setUserCountry(value);
    setShowWarning(!value);
    void persistCountry(value);
  };

  const persistCountry = async (country: string) => {
    if (!userProfileId) return; // do not attempt without a profileId
    setSaving(true);
    try {
      const resp = await dispatch(
        putUserCountryAction({
          userId: Number.isNaN(Number(userProfileId)) ? userProfileId : Number(userProfileId),
          countryCode: country ?? '',
        })
      ).unwrap();
      const countryField = resp?.data?.country as unknown;
      const nextCountry =
        (countryField &&
        typeof countryField === 'object' &&
        'code' in (countryField as Record<string, unknown>)
          ? (countryField as { code?: string }).code
          : typeof countryField === 'string'
            ? (countryField as string)
            : '') || '';
      setUserCountry(nextCountry);
      setShowWarning(!nextCountry);
    } catch {
      setUserCountry('');
      setShowWarning(true);
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <FormSelect
        id="country-select"
        name="country-select"
        value={userCountry}
        onChange={handleChange}
        title={t('user-profile.location.country.select_placeholder', {
          defaultValue: t('user-profile.location.country.select_placeholder'),
        })}>
        <option key="__empty__" value="">
          {t('user-profile.location.country.select_placeholder', {
            defaultValue: t('user-profile.location.country.select_placeholder'),
          })}
        </option>
        {countries.map(country => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </FormSelect>
      {(loading || saving) && <Spinner animation="border" size="sm" className="ms-2" />}
      {showWarning && (
        <Alert variant="warning" className="mt-2" data-testid="country-warning">
          {t('user-profile.location.country.warning_missing', {
            defaultValue: t('user-profile.location.country.warning_missing'),
          })}
        </Alert>
      )}
    </>
  );
};

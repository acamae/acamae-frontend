import React, { useEffect, useMemo, useRef } from 'react';
import { Breadcrumb, Button, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getUserProfileAction } from '@application/state/actions/profile.actions';
import { useAppDispatch } from '@application/state/hooks';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import { TIMETABLE } from '@shared/constants/timeTable';
import { Card, CardBody } from '@ui/components/Card/Card';
import { CountrySelector } from '@ui/components/CountrySelector/CountrySelector';
import { TimeZoneSelector } from '@ui/components/TimeZoneSelector/TimeZoneSelector';
import { UserProfileGameSelectorWithWarning } from '@ui/components/UserProfileGameSelector/UserProfileGameSelector';
import { useAuth } from '@ui/hooks/useAuth';

const UserProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const daysCount = TIMETABLE.length;
  const slotsPerDay = TIMETABLE[0]?.times.length ?? 0;

  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const userId = useMemo(() => String(user?.id ?? ''), [user?.id]);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const loadInitialProfile = async () => {
      if (!userId) return;
      try {
        const res = await dispatch(getUserProfileAction({ userId }));
        if (getUserProfileAction.fulfilled.match(res)) {
          // Profile slice will be hydrated by reducer; no local state needed
        }
      } catch {
        // Ignore initial profile errors to avoid blocking the UI
      }
    };
    void loadInitialProfile();
  }, [userId]);

  const focusSlot = (dayIndex: number, timeIndex: number) => {
    const selector = `button[data-day-index="${dayIndex}"][data-time-index="${timeIndex}"]`;
    const target = document.querySelector<HTMLButtonElement>(selector);
    if (target) {
      target.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    dayIndex: number,
    timeIndex: number
  ) => {
    let nextDay = dayIndex;
    let nextTime = timeIndex;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (timeIndex < slotsPerDay - 1) {
          nextTime = timeIndex + 1;
          focusSlot(nextDay, nextTime);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (timeIndex > 0) {
          nextTime = timeIndex - 1;
          focusSlot(nextDay, nextTime);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (dayIndex < daysCount - 1) {
          nextDay = dayIndex + 1;
          focusSlot(nextDay, nextTime);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (dayIndex > 0) {
          nextDay = dayIndex - 1;
          focusSlot(nextDay, nextTime);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="user-profile" data-testid="user-profile-page">
      <Row className="justify-content-center">
        <Col>
          <Row>
            <Col>
              <Breadcrumb className="text-uppercase">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: APP_ROUTES.DASHBOARD }}>
                  {t('dashboard.title')}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{t('user-profile.title')}</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <main className="user-profile-content">
            <Row>
              <h1 className="h4" data-testid="user-profile-page-title">
                <i className="bi bi-person text-theme"></i> {t('user-profile.account')}
              </h1>
              <p
                className="text-inverse text-opacity-50 mb-4"
                data-testid="user-profile-page-description">
                {t('user-profile.account-description')}
              </p>
            </Row>
            <Row>
              <Card>
                <CardBody>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex align-items-center pb-3">
                      <div className="flex-1 text-break">
                        <div>Username</div>
                        <div className="text-inverse text-opacity-50">{user?.username ?? '-'}</div>
                      </div>
                      <div className="w-100px">
                        <Button variant="outline-default" className="w-100px">
                          {t('global.edit')}
                        </Button>
                      </div>
                    </div>
                    <div className="list-group-item d-flex align-items-center py-3">
                      <div className="flex-1 text-break">
                        <div>Email address</div>
                        <div className="text-inverse text-opacity-50">{user?.email ?? '-'}</div>
                      </div>
                      <div>
                        <Button variant="outline-default" className="w-100px">
                          {t('global.edit')}
                        </Button>
                      </div>
                    </div>
                    <div className="list-group-item d-flex align-items-center pt-3">
                      <div className="flex-1 text-break">
                        <div>Password</div>
                      </div>
                      <div>
                        <Button variant="outline-default" className="w-100px">
                          {t('global.edit')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Row>
            <Row className="mt-5">
              <h2 className="h4" data-testid="user-profile-location">
                <i className="fa-solid fa-globe text-theme"></i> {t('user-profile.location.title')}
              </h2>
              <p
                className="text-inverse text-opacity-50 mb-4"
                data-testid="user-profile-location-description">
                {t('user-profile.location.description')}
              </p>
            </Row>
            <Row>
              <Card>
                <CardBody>
                  <Row>
                    <div className="mb-2">
                      <label htmlFor="country-select">
                        {t('user-profile.location.country.title')}
                      </label>
                    </div>
                    <div className="text-inverse text-opacity-50">
                      <CountrySelector />
                    </div>
                    <div className="mt-3 mb-2">
                      <label htmlFor="timezone-select">
                        {t('user-profile.location.timezone.title')}
                      </label>
                    </div>
                    <div className="text-inverse text-opacity-50">
                      <TimeZoneSelector />
                    </div>
                  </Row>
                </CardBody>
              </Card>
            </Row>
            <Row className="mt-5">
              <h2 className="h4" data-testid="user-profile-games">
                <i className="fa-solid fa-gamepad text-theme"></i> {t('user-profile.games.title')}
              </h2>
              <p
                className="text-inverse text-opacity-50 mb-4"
                data-testid="user-profile-games-description">
                {t('user-profile.games.description')}
              </p>
            </Row>
            <Row>
              <Card>
                <CardBody>
                  <Row>
                    <UserProfileGameSelectorWithWarning />
                  </Row>
                </CardBody>
              </Card>
            </Row>
            <Row className="mt-5">
              <h2 className="h4" data-testid="user-profile-timetable">
                <i className="fa-solid fa-calendar-days text-theme"></i>{' '}
                {t('user-profile.timetable.title')}
              </h2>
              <p
                className="text-inverse text-opacity-50 mb-4"
                data-testid="user-profile-timetable-description">
                {t('user-profile.timetable.description')}
              </p>
            </Row>
            <Row>
              <Card>
                <CardBody>
                  <Row>
                    <div className="timetable-grid" aria-label={t('user-profile.timetable.title')}>
                      {TIMETABLE.map((day, dayIndex) => (
                        <fieldset key={day.id} className="timetable-day">
                          <legend className="timetable-day-header h6">{t(day.dayKey)}</legend>
                          <div className="timetable-day-times">
                            {day.times.map((time, timeIndex) => (
                              <Button
                                key={time.id}
                                data-day-index={dayIndex}
                                data-time-index={timeIndex}
                                onKeyDown={e => handleKeyDown(e, dayIndex, timeIndex)}
                                variant={time.active ? 'theme active' : 'outline-theme'}
                                className="btn-sm w-100"
                                aria-pressed={time.active}
                                aria-label={`${t(day.dayKey)} ${time.start} - ${time.end}`}>
                                {time.start} - {time.end}
                              </Button>
                            ))}
                          </div>
                        </fieldset>
                      ))}
                    </div>
                  </Row>
                </CardBody>
              </Card>
            </Row>
          </main>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfilePage;

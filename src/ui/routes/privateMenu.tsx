import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { APP_ROUTES } from '@shared/constants/appRoutes';

export type PrivateMenuItem = {
  title?: string;
  path?: string;
  is_header?: boolean;
  is_divider?: boolean;
  icon?: string;
  highlight?: boolean;
  label?: string;
  children?: PrivateMenuItem[];
};

export const usePrivateMenu = (): PrivateMenuItem[] => {
  const { t } = useTranslation();

  return useMemo<PrivateMenuItem[]>(
    () => [
      { is_header: true, title: t('navigation.menu_header', { defaultValue: 'Navigation' }) },
      { path: APP_ROUTES.DASHBOARD, icon: 'bi bi-cpu', title: t('dashboard.menu_label') },
      { path: APP_ROUTES.PROFILE, icon: 'bi bi-person', title: t('user-profile.menu_label') },
      { is_divider: true },
      {
        path: APP_ROUTES.MESSAGES,
        icon: 'bi bi-envelope',
        title: t('messages.menu_label'),
      },
      {
        path: APP_ROUTES.TEAMS,
        icon: 'bi bi-people',
        title: t('teams.menu_label'),
        children: [
          {
            path: APP_ROUTES.TEAMS,
            title: t('teams.list.menu_label'),
          },
          {
            path: APP_ROUTES.TEAMS_CREATE,
            title: t('teams.create.menu_label'),
          },
          {
            path: APP_ROUTES.TEAMS_JOIN,
            title: t('teams.join.menu_label'),
          },
        ],
      },
    ],
    [t]
  );
};

export default usePrivateMenu;

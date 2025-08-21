export const API_ROUTES = {
  BASE: '/api',
  HEALTH: '/health',
  DEV: '/dev',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email/:token',
    VERIFY_EMAIL_RESEND: '/auth/verify-email-resend',
    VERIFY_EMAIL_SENT: '/auth/verify-email-sent',
    VERIFY_EMAIL_SUCCESS: '/auth/verify-email-success',
    VERIFY_EMAIL_EXPIRED: '/auth/verify-email-expired',
    VERIFY_EMAIL_ALREADY_VERIFIED: '/auth/verify-email-already-verified',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password/:token',
    ME: '/auth/me',
  },
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: '/users/:id',
    UPDATE_BY_ID: '/users/:id',
    DELETE_BY_ID: '/users/:id',
  },
  PROFILES: {
    GET_BY_ID: '/profiles/:id',
    AVAILABILITY: '/profiles/:id/availability',
    GAMES: '/profiles/:id/games',
    COUNTRY: '/profiles/:id/country',
    TIMEZONE: '/profiles/:id/timezone',
  },
  GAMES: {
    GET_ALL: '/games',
  },
  TEAMS: {
    GET_ALL: '/teams',
    GET_BY_ID: '/teams/:id',
    UPDATE_BY_ID: '/teams/:id',
    DELETE_BY_ID: '/teams/:id',
    CREATE: '/teams',
  },
  ADMIN: {
    USERS: '/admin/users',
    TEAMS: '/admin/teams',
    STATS: '/admin/stats',
  },
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
  },
  TIMEZONES: '/timezones',
  COUNTRIES: '/countries',
};

// Auxiliary functions to build routes with parameters for the frontend
// These functions return the partial route that will be used with the Axios instance
export const getAuthVerifyEmailUrl = (token: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.AUTH.VERIFY_EMAIL.replace(':token', encodeURIComponent(token))}`;

export const getAuthResetPasswordUrl = (token: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.AUTH.RESET_PASSWORD.replace(':token', encodeURIComponent(token))}`;

export const getUserByIdUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.USERS.GET_BY_ID.replace(':id', encodeURIComponent(id))}`;

export const getUpdateUserByIdUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.USERS.UPDATE_BY_ID.replace(':id', encodeURIComponent(id))}`;

export const getDeleteUserByIdUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.USERS.DELETE_BY_ID.replace(':id', encodeURIComponent(id))}`;

export const getTeamByIdUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.TEAMS.GET_BY_ID.replace(':id', encodeURIComponent(id))}`;

export const getUpdateTeamByIdUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.TEAMS.UPDATE_BY_ID.replace(':id', encodeURIComponent(id))}`;

export const getDeleteTeamByIdUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.TEAMS.DELETE_BY_ID.replace(':id', encodeURIComponent(id))}`;

export const getUserProfileUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.PROFILES.GET_BY_ID.replace(':id', encodeURIComponent(id))}`;

export const getUserAvailabilityUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.PROFILES.AVAILABILITY.replace(':id', encodeURIComponent(id))}`;

// New helpers for catalogs endpoints
export const getUserGamesUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.PROFILES.GAMES.replace(':id', encodeURIComponent(id))}`;

export const getUserCountryUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.PROFILES.COUNTRY.replace(':id', encodeURIComponent(id))}`;

export const getUserTimezoneUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.PROFILES.TIMEZONE.replace(':id', encodeURIComponent(id))}`;

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
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password/:token',
    ME: '/auth/me',
    VERIFY_EMAIL_SENT: '/auth/verify-email-sent',
    VERIFY_EMAIL_RESEND: '/auth/verify-email-resend',
    VERIFY_EMAIL_SUCCESS: '/auth/verify-email-success',
    VERIFY_EMAIL_EXPIRED: '/auth/verify-email-expired',
    VERIFY_EMAIL_ALREADY_VERIFIED: '/auth/verify-email-already-verified',
    VERIFY_EMAIL_ERROR: '/auth/verify-email-error',
  },
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: '/users/:id',
    GET_USER_TEAMS: '/users/:id/teams',
    UPDATE_BY_ID: '/users/:id',
    DELETE_BY_ID: '/users/:id',
    CREATE: '/users',
    // Preferences & public profile
    PREFERENCES: '/users/:id/preferences',
    GAMES: '/users/:id/games',
    AVAILABILITY: '/users/:id/availability',
    PUBLIC_PROFILE: '/users/:id/public',
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

// New helpers for preferences endpoints
export const getUserPublicProfileUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.USERS.PUBLIC_PROFILE.replace(':id', encodeURIComponent(id))}`;

export const getUserAvailabilityUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.USERS.AVAILABILITY.replace(':id', encodeURIComponent(id))}`;

export const getUserGamesUrl = (id: string): string =>
  `${API_ROUTES.BASE}${API_ROUTES.USERS.GAMES.replace(':id', encodeURIComponent(id))}`;

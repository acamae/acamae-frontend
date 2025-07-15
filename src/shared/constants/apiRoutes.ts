export const API_ROUTES = {
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
  },
  TEAMS: {
    GET_ALL: '/teams',
    GET_BY_ID: '/teams/:id',
    UPDATE_BY_ID: '/teams/:id',
    DELETE_BY_ID: '/teams/:id',
    CREATE: '/teams',
  },
};

// Funciones auxiliares para construir rutas con parámetros para el frontend
// Estas funciones devuelven la ruta parcial que se usará con la instancia de Axios.
export const getAuthVerifyEmailUrl = (token: string): string =>
  API_ROUTES.AUTH.VERIFY_EMAIL.replace(':token', encodeURIComponent(token));

export const getAuthResetPasswordUrl = (token: string): string =>
  API_ROUTES.AUTH.RESET_PASSWORD.replace(':token', token);

export const getUserByIdUrl = (id: string): string => API_ROUTES.USERS.GET_BY_ID.replace(':id', id);

export const getUpdateUserByIdUrl = (id: string): string =>
  API_ROUTES.USERS.UPDATE_BY_ID.replace(':id', id);

export const getDeleteUserByIdUrl = (id: string): string =>
  API_ROUTES.USERS.DELETE_BY_ID.replace(':id', id); // Añadido

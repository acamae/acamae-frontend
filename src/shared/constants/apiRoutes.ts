export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email/:token',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password/:token',
    ME: '/auth/me',
  },
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: '/users/:id',
    UPDATE_BY_ID: '/users/:id',
    DELETE_BY_ID: '/users/:id',
    // CREATE: '/users',
    // DELETE_BY_ID: '/users/:id',
  },
};

// Funciones auxiliares para construir rutas con parámetros para el frontend
// Estas funciones devuelven la ruta parcial que se usará con la instancia de Axios.
export const getAuthVerifyEmailUrl = (token: string): string =>
  API_ROUTES.AUTH.VERIFY_EMAIL.replace(':token', token);

export const getAuthResetPasswordUrl = (token: string): string =>
  API_ROUTES.AUTH.RESET_PASSWORD.replace(':token', token);

export const getUserByIdUrl = (id: string): string => API_ROUTES.USERS.GET_BY_ID.replace(':id', id);

export const getUpdateUserByIdUrl = (id: string): string =>
  API_ROUTES.USERS.UPDATE_BY_ID.replace(':id', id);

export const getDeleteUserByIdUrl = (id: string): string =>
  API_ROUTES.USERS.DELETE_BY_ID.replace(':id', id); // Añadido

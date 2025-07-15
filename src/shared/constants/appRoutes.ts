// Rutas públicas (sin prefijo)
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_EMAIL_SENT: '/verify-email-sent',
  VERIFY_EMAIL_SUCCESS: '/verify-email-success',
  VERIFY_EMAIL_EXPIRED: '/verify-email-expired',
  VERIFY_EMAIL_ALREADY_VERIFIED: '/verify-email-already-verified',
  VERIFY_EMAIL_RESEND: '/verify-email-resend',
  VERIFY_EMAIL_USED: '/verify-email-used',
  VERIFY_EMAIL_ERROR: '/verify-email-error',
} as const;

// Rutas privadas (con prefijo /app)
export const PRIVATE_ROUTES = {
  DASHBOARD: '/app/dashboard',
  PROFILE: '/app/profile',
  TEAMS: '/app/teams',
  TOURNAMENTS: '/app/tournaments',
  USERS: '/app/users',
} as const;

// Función helper para obtener rutas relativas de todas las rutas privadas (dinámica)
export const getPrivateRoutesRelative = () => {
  const appPrefix = '/app/';
  return Object.fromEntries(
    Object.entries(PRIVATE_ROUTES).map(([key, value]) => [
      key,
      value.startsWith(appPrefix) ? value.substring(appPrefix.length) : value,
    ])
  ) as typeof PRIVATE_ROUTES;
};

// Mantener compatibilidad hacia atrás con APP_ROUTES
export const APP_ROUTES = {
  ...PUBLIC_ROUTES,
  ...PRIVATE_ROUTES,
} as const;

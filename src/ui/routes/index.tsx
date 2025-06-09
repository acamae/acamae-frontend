import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ResendVerificationPage from '@/ui/pages/ResendVerificationPage';
import ResetPasswordPage from '@/ui/pages/ResetPasswordPage';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import PrivateRoute from '@ui/components/PrivateRoute';
import MainLayout from '@ui/layouts/MainLayout';
import PublicLayout from '@ui/layouts/PublicLayout';
import DashboardPage from '@ui/pages/DashboardPage';
import EmailAlreadyVerified from '@ui/pages/EmailAlreadyVerifiedPage';
import EmailVerificationExpired from '@ui/pages/EmailVerificationExpiredPage';
import EmailVerificationSentPage from '@ui/pages/EmailVerificationSentPage';
import EmailVerificationSuccess from '@ui/pages/EmailVerificationSuccessPage';
import ForgotPasswordPage from '@ui/pages/ForgotPasswordPage';
import HomePage from '@ui/pages/HomePage';
import LoginPage from '@ui/pages/LoginPage';
import NotFoundPage from '@ui/pages/NotFoundPage';
import RegisterPage from '@ui/pages/RegisterPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes with PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={APP_ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={APP_ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={APP_ROUTES.VERIFY_EMAIL_SENT} element={<EmailVerificationSentPage />} />
        <Route path={APP_ROUTES.VERIFY_EMAIL_SUCCESS} element={<EmailVerificationSuccess />} />
        <Route path={APP_ROUTES.VERIFY_EMAIL_EXPIRED} element={<EmailVerificationExpired />} />
        <Route path={APP_ROUTES.VERIFY_EMAIL_ALREADY_VERIFIED} element={<EmailAlreadyVerified />} />
        <Route path={APP_ROUTES.VERIFY_EMAIL_RESEND} element={<ResendVerificationPage />} />
      </Route>

      {/* Private routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route
          path={APP_ROUTES.DASHBOARD}
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* 404 page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;

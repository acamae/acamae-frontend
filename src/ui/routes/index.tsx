import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ResendVerificationPage from '@/ui/pages/ResendVerificationPage';
import ResetPasswordPage from '@/ui/pages/ResetPasswordPage';
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verification-sent" element={<EmailVerificationSentPage />} />
        <Route path="/verification-success" element={<EmailVerificationSuccess />} />
        <Route path="/verification-expired" element={<EmailVerificationExpired />} />
        <Route path="/verification-already" element={<EmailAlreadyVerified />} />
        <Route path="/resend-verification" element={<ResendVerificationPage />} />
      </Route>

      {/* Private routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
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

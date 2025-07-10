import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { VerifyEmailUseCase } from '@application/use-cases/auth/VerifyEmailUseCase';
import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiSuccessCodes } from '@domain/constants/successCodes';
import { AuthApiRepository } from '@infrastructure/api/AuthApiRepository';
import { APP_ROUTES } from '@shared/constants/appRoutes';

const EmailVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      // No token provided, redirect to error page
      navigate(APP_ROUTES.VERIFY_EMAIL_EXPIRED);
      return;
    }

    // Prevent double execution in React Strict Mode
    if (hasVerified.current) {
      return;
    }
    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        const authRepository = new AuthApiRepository();
        const verifyEmailUseCase = new VerifyEmailUseCase(authRepository);

        const response = await verifyEmailUseCase.execute({ token });

        if (response.success) {
          // Verificación exitosa - el backend devolvió una respuesta exitosa
          setVerificationStatus(ApiSuccessCodes.SUCCESS);
        } else {
          // API error, check error code to determine the appropriate status
          switch (response.code) {
            case ApiErrorCodes.AUTH_TOKEN_EXPIRED:
              setVerificationStatus(ApiErrorCodes.AUTH_TOKEN_EXPIRED);
              break;
            case ApiErrorCodes.AUTH_USER_ALREADY_VERIFIED:
              setVerificationStatus(ApiErrorCodes.AUTH_USER_ALREADY_VERIFIED);
              break;
            case ApiErrorCodes.AUTH_TOKEN_INVALID:
            default:
              setVerificationStatus(ApiErrorCodes.AUTH_TOKEN_INVALID);
              break;
          }
        }
      } catch {
        // Network or other error, treat as invalid token
        setVerificationStatus(ApiErrorCodes.AUTH_TOKEN_INVALID);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, t]);

  useEffect(() => {
    // Redirect to specific pages based on verification status
    if (!loading && verificationStatus) {
      switch (verificationStatus) {
        case ApiSuccessCodes.SUCCESS:
          navigate(APP_ROUTES.VERIFY_EMAIL_SUCCESS);
          break;
        case ApiErrorCodes.AUTH_TOKEN_EXPIRED:
          navigate(APP_ROUTES.VERIFY_EMAIL_EXPIRED);
          break;
        case ApiErrorCodes.AUTH_USER_ALREADY_VERIFIED:
          navigate(APP_ROUTES.VERIFY_EMAIL_ALREADY_VERIFIED);
          break;
        case ApiErrorCodes.AUTH_TOKEN_INVALID:
          navigate(APP_ROUTES.VERIFY_EMAIL_ERROR);
          break;
        case ApiErrorCodes.AUTH_UPDATE_FAILED:
          navigate(APP_ROUTES.VERIFY_EMAIL_ERROR);
          break;
      }
    }
  }, [loading, verificationStatus, navigate]);

  if (loading) {
    return (
      <div className="email-verification" data-testid="email-verification-page">
        <main className="email-verification-content">
          <div className="email-verification-icon text-center mb-4">
            <i className="fa-solid fa-spinner fa-spin"></i>
          </div>
          <h1 className="text-center" data-testid="email-verification-loading-title">
            {t('verification.processing.title')}
          </h1>
          <div className="text-inverse text-opacity-50 text-center mb-4">
            <p>{t('verification.processing.message')}</p>
          </div>
        </main>
      </div>
    );
  }

  // All verification results redirect to specific pages
  // This should not be reached normally
  return null;
};

export default EmailVerificationPage;

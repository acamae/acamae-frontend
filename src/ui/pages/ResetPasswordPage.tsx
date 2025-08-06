import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { ValidateResetTokenUseCase } from '@application/use-cases/auth/ValidateResetTokenUseCase';
import { validateToken } from '@domain/services/validationService';
import { AuthApiRepository } from '@infrastructure/api/AuthApiRepository';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import ResetPasswordForm from '@ui/components/Forms/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [tokenValidated, setTokenValidated] = useState(false);
  const hasValidated = useRef(false);

  useEffect(() => {
    // Obtener token desde path parameters
    const token = params.token;

    if (!token) {
      // No token provided, redirect to error page
      navigate(APP_ROUTES.RESET_PASSWORD_ERROR);
      return;
    }

    // Prevent double execution in React Strict Mode
    if (hasValidated.current) {
      return;
    }
    hasValidated.current = true;

    const validateResetToken = async () => {
      try {
        // 1. Validación básica del formato del token
        if (!validateToken(token)) {
          navigate(APP_ROUTES.RESET_PASSWORD_ERROR);
          return;
        }

        // 2. Validación completa del token en el backend
        const authRepository = new AuthApiRepository();
        const validateResetTokenUseCase = new ValidateResetTokenUseCase(authRepository);

        const response = await validateResetTokenUseCase.execute({ token });

        if (response.success && response.data?.isValid) {
          // Token válido, mostrar el formulario
          setTokenValidated(true);
        } else {
          // Token inválido, verificar la razón específica
          if (response.data?.isExpired) {
            navigate(APP_ROUTES.RESET_PASSWORD_EXPIRED);
          } else {
            // Token inválido o usuario no existe
            navigate(APP_ROUTES.RESET_PASSWORD_ERROR);
          }
        }
      } catch (error: unknown) {
        console.error(error);
        // Error inesperado o de red, tratar como token inválido
        navigate(APP_ROUTES.RESET_PASSWORD_ERROR);
      } finally {
        setLoading(false);
      }
    };

    validateResetToken();
  }, [params, navigate]);

  if (loading) {
    return (
      <div className="reset-password" data-testid="reset-password-page">
        <main className="reset-password-content">
          <div className="reset-password-icon text-center mb-4">
            <i className="fa-solid fa-spinner fa-spin"></i>
          </div>
          <h1 className="text-center" data-testid="reset-password-loading-title">
            {t('reset.processing.title')}
          </h1>
          <div className="text-inverse text-opacity-50 text-center mb-4">
            <p>{t('reset.processing.message')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!tokenValidated) {
    return null;
  }

  // Obtener token desde path parameters
  const token = params.token ?? '';

  return (
    <div className="reset-password" data-testid="reset-password-page">
      <main className="reset-password-content">
        <h1 className="text-center" data-testid="reset-password-title">
          {t('reset.title')}
        </h1>
        <ResetPasswordForm
          tokenProp={token}
          onSuccess={() => navigate(APP_ROUTES.RESET_PASSWORD_SUCCESS)}
        />
      </main>
    </div>
  );
};

export default ResetPasswordPage;

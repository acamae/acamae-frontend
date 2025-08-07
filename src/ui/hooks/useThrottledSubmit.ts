import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ThrottleConfig, THROTTLE_CONFIGS } from '@shared/constants/security';
import { securityThrottleService, generateActionId } from '@shared/utils/securityUtils';
import { useToast } from '@ui/hooks/useToast';

export interface UseThrottledSubmitConfig {
  formName: string;
  throttleConfig?: Partial<ThrottleConfig>;
  onSubmit: () => Promise<void>;
  showToastOnThrottle?: boolean;
}

export interface UseThrottledSubmitReturn {
  isThrottled: boolean;
  canSubmit: boolean;
  timeUntilNextSubmission: number;
  remainingAttempts: number;
  handleThrottledSubmit: () => Promise<void>;
  resetThrottle: () => void;
  activateThrottle: () => void;
}

export const useThrottledSubmit = ({
  formName,
  throttleConfig = THROTTLE_CONFIGS.AUTH_FORMS as Partial<ThrottleConfig>,
  onSubmit,
  showToastOnThrottle = true,
}: UseThrottledSubmitConfig): UseThrottledSubmitReturn => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isThrottled, setIsThrottled] = useState(false);
  const [timeUntilNextSubmission, setTimeUntilNextSubmission] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(0);

  const actionId = generateActionId(formName, 'submit');

  // Función para actualizar el estado del throttle
  const updateThrottleState = useCallback(() => {
    const timeRemaining = securityThrottleService.getTimeUntilNextAction(actionId, throttleConfig);
    const attempts = securityThrottleService.getRemainingAttempts(actionId, throttleConfig);
    setTimeUntilNextSubmission(timeRemaining);
    setRemainingAttempts(attempts);
    setIsThrottled(timeRemaining > 0);
  }, [actionId, throttleConfig]);

  // Actualizar el estado inicial al montar el componente
  useEffect(() => {
    updateThrottleState();
  }, [updateThrottleState]);

  // Actualizar el tiempo restante cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      updateThrottleState();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateThrottleState]);

  const handleThrottledSubmit = useCallback(async (): Promise<void> => {
    // Verificar si la acción está permitida
    if (!securityThrottleService.canPerformAction(actionId, throttleConfig)) {
      // Actualizar el estado inmediatamente después del submit
      updateThrottleState();

      if (showToastOnThrottle) {
        const throttleState = securityThrottleService.getThrottleState(actionId);

        if (throttleState?.isBlocked) {
          // Usuario bloqueado por demasiados intentos
          toast.error(
            t('security.throttle.blocked', {
              minutes: Math.ceil(timeUntilNextSubmission / 60000),
            })
          );
        } else {
          // Usuario debe esperar antes del próximo intento
          toast.warning(
            t('security.throttle.wait', {
              seconds: Math.ceil(timeUntilNextSubmission / 1000),
            })
          );
        }
      }

      return;
    }

    await onSubmit();

    // Actualizar el estado inmediatamente después del submit exitoso
    updateThrottleState();
  }, [
    actionId,
    throttleConfig,
    onSubmit,
    showToastOnThrottle,
    t,
    toast,
    updateThrottleState,
    timeUntilNextSubmission,
  ]);

  const resetThrottle = useCallback(() => {
    securityThrottleService.clearThrottleState(actionId);
    setIsThrottled(false);
    setTimeUntilNextSubmission(0);
  }, [actionId]);

  const activateThrottle = useCallback(() => {
    // Activar el throttling manualmente cuando el servidor devuelve un error 429
    securityThrottleService.recordAction(actionId, throttleConfig);

    // Actualizar el estado inmediatamente
    const timeRemaining = securityThrottleService.getTimeUntilNextAction(actionId, throttleConfig);
    const attempts = securityThrottleService.getRemainingAttempts(actionId, throttleConfig);

    setTimeUntilNextSubmission(timeRemaining);
    setRemainingAttempts(attempts);
    setIsThrottled(true);

    if (showToastOnThrottle) {
      toast.error(t('security.throttle.server_blocked'));
    }
  }, [actionId, throttleConfig, showToastOnThrottle, t, toast]);

  const canSubmit = !isThrottled && timeUntilNextSubmission === 0;

  return {
    isThrottled,
    canSubmit,
    timeUntilNextSubmission,
    remainingAttempts,
    handleThrottledSubmit,
    resetThrottle,
    activateThrottle,
  };
};

/**
 * Hook especializado para formularios de autenticación
 */
export const useAuthThrottledSubmit = (
  formName: string,
  onSubmit: () => Promise<void>
): UseThrottledSubmitReturn => {
  return useThrottledSubmit({
    formName,
    throttleConfig: THROTTLE_CONFIGS.AUTH_FORMS as Partial<ThrottleConfig>,
    onSubmit,
    showToastOnThrottle: true,
  });
};

/**
 * Hook especializado para formularios regulares
 */
export const useRegularThrottledSubmit = (
  formName: string,
  onSubmit: () => Promise<void>
): UseThrottledSubmitReturn => {
  return useThrottledSubmit({
    formName,
    throttleConfig: THROTTLE_CONFIGS.REGULAR_FORMS as Partial<ThrottleConfig>,
    onSubmit,
    showToastOnThrottle: true,
  });
};

/**
 * Hook especializado para acciones críticas
 */
export const useCriticalThrottledSubmit = (
  formName: string,
  onSubmit: () => Promise<void>
): UseThrottledSubmitReturn => {
  return useThrottledSubmit({
    formName,
    throttleConfig: THROTTLE_CONFIGS.CRITICAL_ACTIONS as Partial<ThrottleConfig>,
    onSubmit,
    showToastOnThrottle: true,
  });
};

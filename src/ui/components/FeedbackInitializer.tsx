import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { configureFeedback } from '@application/state/middleware/feedbackMiddleware';
import { useToastContext } from '@shared/services/ToastProvider';
import { toastService } from '@shared/services/toastService';

const FeedbackInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastContext = useToastContext();
  const navigate = useNavigate();

  useEffect((): void => {
    // Configurar el toastService con la implementación real del contexto
    toastService.configure(toastContext);

    configureFeedback({
      toast: toastContext,
      navigate: (path: string): void | Promise<void> => {
        navigate(path, { replace: true });
      },
    });
  }, [toastContext, navigate]);

  return <>{children}</>;
};

export default FeedbackInitializer;

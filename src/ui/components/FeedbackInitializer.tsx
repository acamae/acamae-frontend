import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { configureFeedback } from '@application/state/middleware/feedbackMiddleware';
import { useToast } from '@ui/hooks/useToast';

const FeedbackInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();
  const navigate = useNavigate();

  useEffect((): void => {
    configureFeedback({
      toast,
      navigate: (path: string): void | Promise<void> => {
        navigate(path, { replace: true });
      },
    });
  }, [toast, navigate]);

  return <>{children}</>;
};

export default FeedbackInitializer;

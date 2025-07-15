import React, { useEffect } from 'react';

import { useToast } from '@ui/hooks/useToast';

/**
 * Componente que inicializa el sistema de feedback (toast).
 * Debe colocarse cerca de la raíz de la aplicación.
 */
const FeedbackInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialize } = useToast();

  useEffect(() => {
    // Inicializar el sistema de toast una vez al montar el componente
    initialize();
  }, [initialize]);

  // Renderiza solo los hijos, sin añadir elementos al DOM
  return <>{children}</>;
};

export default FeedbackInitializer;

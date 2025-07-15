import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';

import { UserRole } from '@domain/constants/user';
import { useAuth } from '@ui/hooks/useAuth';

interface PrivateRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <p className="text-center mt-5" data-testid="session-checking">
        {t('session.checking')}
      </p>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role-based access control
  if (roles && roles.length > 0) {
    const userRole = user?.role;

    if (!userRole || !roles.includes(userRole)) {
      // Redirect to unauthorized page or dashboard based on user role
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;

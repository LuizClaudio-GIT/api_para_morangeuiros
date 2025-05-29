
import { usePermissions } from '@/hooks/usePermissions';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { canManageUsers, user } = usePermissions();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canManageUsers()) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;

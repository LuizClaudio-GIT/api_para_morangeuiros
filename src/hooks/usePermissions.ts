
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/user';

export const usePermissions = () => {
  const { user } = useAuth();

  const isAdmin = (): boolean => {
    return user?.funcao === 'admin';
  };

  const isModerator = (): boolean => {
    return user?.funcao === 'moderator' || user?.funcao === 'admin';
  };

  const canManageUsers = (): boolean => {
    return isAdmin();
  };

  const canManageProducts = (): boolean => {
    return isModerator();
  };

  const canManageSales = (): boolean => {
    return isModerator();
  };

  return {
    isAdmin,
    isModerator,
    canManageUsers,
    canManageProducts,
    canManageSales,
    user
  };
};

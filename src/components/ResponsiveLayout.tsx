
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileNav from './MobileNav';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const { user, logout } = useAuth();
  const { canManageUsers } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/products', label: 'Produtos', icon: '🍰' },
    { path: '/customers', label: 'Clientes', icon: '👥' },
    { path: '/sales', label: 'Vendas', icon: '💰' },
    { path: '/cashier', label: 'Caixa', icon: '💳' },
  ];

  if (canManageUsers()) {
    menuItems.push({ path: '/users', label: 'Usuários', icon: '👤' });
  }

  const userName = user?.nome || 'Usuário';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-strawberry-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MobileNav />
              <div className="flex items-center ml-2 md:ml-0">
                <div className="w-10 h-10 bg-strawberry-500 rounded-lg mr-3 flex items-center justify-center text-white text-xl">
                  🍓
                </div>
                <h1 className="text-xl font-bold text-strawberry-700">PDV Morango</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-strawberry-100 text-strawberry-700'
                      : 'text-gray-600 hover:text-strawberry-600 hover:bg-strawberry-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Desktop User Info */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {userName} 
                {user?.funcao === 'admin' && (
                  <span className="ml-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    Admin
                  </span>
                )}
              </span>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="border-strawberry-200 text-strawberry-600 hover:bg-strawberry-50"
              >
                Sair
              </Button>
            </div>

            {/* Mobile User Badge */}
            <div className="md:hidden">
              <span className="text-xs text-gray-600">
                {user?.funcao === 'admin' && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded">
                    Admin
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default ResponsiveLayout;

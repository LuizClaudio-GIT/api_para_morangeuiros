
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { canManageUsers } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
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

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const userName = user?.nome || 'Usuário';

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-strawberry-500 rounded-lg flex items-center justify-center text-white text-lg">
              🍓
            </div>
            <span className="text-strawberry-700">PDV Morango</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full justify-between py-6">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-left transition-colors ${
                  location.pathname === item.path
                    ? 'bg-strawberry-100 text-strawberry-700'
                    : 'text-gray-600 hover:text-strawberry-600 hover:bg-strawberry-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="px-3">
              <p className="text-sm text-gray-700 font-medium">
                {userName}
              </p>
              {user?.funcao === 'admin' && (
                <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  Admin
                </span>
              )}
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full border-strawberry-200 text-strawberry-600 hover:bg-strawberry-50"
            >
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;

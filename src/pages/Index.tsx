
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // User is authenticated, stay on dashboard
      return;
    } else {
      // User is not authenticated, redirect to login
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // This will show briefly while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-strawberry-50 to-strawberry-100">
      <div className="text-center">
        <div className="w-20 h-20 bg-strawberry-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl animate-pulse">
          🍓
        </div>
        <h1 className="text-2xl font-bold text-strawberry-800">Carregando PDV Morango...</h1>
      </div>
    </div>
  );
};

export default Index;

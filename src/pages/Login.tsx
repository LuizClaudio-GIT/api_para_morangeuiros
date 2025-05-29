
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(loginData.email, loginData.password);
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema PDV Morango.",
        });
        navigate('/');
      } else {
        toast({
          title: "Erro no login",
          description: result.error || "Email ou senha incorretos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante o login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Recuperação de senha",
      description: "Entre em contato com o administrador do sistema para recuperar sua senha.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-strawberry-50 to-strawberry-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-strawberry-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
            🍓
          </div>
          <h1 className="text-3xl font-bold text-strawberry-800">PDV Morango</h1>
          <p className="text-strawberry-600 mt-2">Sistema de Gestão para Doçaria</p>
        </div>

        <Card className="shadow-lg border-strawberry-200">
          <CardHeader>
            <CardTitle className="text-center text-strawberry-700">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-center">
              Entre com sua conta para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-strawberry-500 hover:bg-strawberry-600"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
              
              <div className="text-center mt-4">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-strawberry-600 hover:text-strawberry-700"
                  onClick={handleForgotPassword}
                >
                  Esqueceu sua senha?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default Login;

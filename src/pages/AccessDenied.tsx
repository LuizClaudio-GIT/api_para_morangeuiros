
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página. 
              Entre em contato com um administrador se precisar de acesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')}
              className="bg-strawberry-500 hover:bg-strawberry-600"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AccessDenied;

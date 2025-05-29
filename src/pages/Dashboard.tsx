
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRecentActivity } from '@/hooks/useRecentActivity';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities = [], isLoading: activitiesLoading } = useRecentActivity();

  const quickActions = [
    { title: 'Nova Venda', description: 'Registrar uma nova venda', path: '/sales', icon: '🛒', color: 'bg-strawberry-500' },
    { title: 'Cadastrar Produto', description: 'Adicionar novo produto ao estoque', path: '/products', icon: '➕', color: 'bg-blue-500' },
    { title: 'Novo Cliente', description: 'Cadastrar um novo cliente', path: '/customers', icon: '👤', color: 'bg-purple-500' },
    { title: 'Ver Caixa', description: 'Consultar movimentação do caixa', path: '/cashier', icon: '💳', color: 'bg-green-500' },
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  };

  if (statsLoading) {
    return (
      <Layout>
        <div className="px-4 sm:px-0">
          <div className="text-center py-8">Carregando dados do dashboard...</div>
        </div>
      </Layout>
    );
  }

  const statsCards = [
    { 
      title: 'Vendas Hoje', 
      value: `R$ ${(stats?.todaysSales || 0).toFixed(2)}`, 
      icon: '💰', 
      color: 'bg-green-500' 
    },
    { 
      title: 'Produtos Cadastrados', 
      value: stats?.productsCount.toString() || '0', 
      icon: '🍰', 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Clientes Ativos', 
      value: stats?.customersCount.toString() || '0', 
      icon: '👥', 
      color: 'bg-purple-500' 
    },
    { 
      title: 'Pedidos Hoje', 
      value: stats?.ordersCount.toString() || '0', 
      icon: '📦', 
      color: 'bg-orange-500' 
    },
  ];

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="border-l-4 border-l-strawberry-500">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white text-xl mr-4`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(action.path)}>
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full ${action.color} flex items-center justify-center text-white text-2xl mx-auto mb-2`}>
                    {action.icon}
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button className="w-full" variant="outline">
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas movimentações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="text-center py-4">Carregando atividades...</div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={`${activity.type}-${activity.id}-${index}`} className={`flex items-center space-x-4 p-3 ${activity.bgColor} rounded-lg`}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTimeAgo(activity.created_at || '')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>Nenhuma atividade recente</p>
                <p className="text-sm">As atividades aparecerão aqui conforme você usar o sistema</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;

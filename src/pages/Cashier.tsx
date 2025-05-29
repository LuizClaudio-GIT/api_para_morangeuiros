import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCashMovementsByDate, useTodaysCashSummary } from '@/hooks/useCashMovements';
import { useAuth } from '@/contexts/AuthContext';
import AddExpenseDialog from '@/components/AddExpenseDialog';
import EditExpenseDialog from '@/components/EditExpenseDialog';
import DeleteExpenseDialog from '@/components/DeleteExpenseDialog';
import { Edit, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type CashMovement = Tables<'cash_movements'>;

const Cashier = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingExpense, setEditingExpense] = useState<CashMovement | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<CashMovement | null>(null);
  const { user } = useAuth();
  
  const { data: movements = [], isLoading: movementsLoading } = useCashMovementsByDate(selectedDate);
  const { data: summary = { 
    sales: 0, 
    expenses: 0, 
    total: 0, 
    salesCount: 0,
    cash: 0,
    credit: 0,
    debit: 0
  }, isLoading: summaryLoading } = useTodaysCashSummary(selectedDate);

  const getMovementTypeInfo = (type: string) => {
    switch (type) {
      case 'sale':
        return { label: 'Venda', color: 'bg-green-100 text-green-800', icon: '💰' };
      case 'expense':
        return { label: 'Despesa', color: 'bg-red-100 text-red-800', icon: '💸' };
      case 'opening':
        return { label: 'Abertura', color: 'bg-blue-100 text-blue-800', icon: '🔓' };
      case 'closing':
        return { label: 'Fechamento', color: 'bg-purple-100 text-purple-800', icon: '🔒' };
      default:
        return { label: 'Outros', color: 'bg-gray-100 text-gray-800', icon: '📄' };
    }
  };

  const getPaymentMethodLabel = (paymentMethod: string | null) => {
    switch (paymentMethod) {
      case 'cash': return 'Dinheiro';
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      default: return '';
    }
  };

  // Generate date options for the last 30 days
  const generateDateOptions = () => {
    const options = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('pt-BR');
      options.push({ value: dateString, label: displayDate });
    }
    return options;
  };

  const dateOptions = generateDateOptions();

  if (!user) {
    return (
      <Layout>
        <div className="px-4 sm:px-0">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Acesso negado</h2>
            <p className="text-gray-600">Você precisa estar logado para acessar o caixa.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (movementsLoading || summaryLoading) {
    return (
      <Layout>
        <div className="px-4 sm:px-0">
          <div className="text-center py-8">Carregando dados do caixa...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Caixa</h2>
            <p className="text-gray-600">Controle de movimentação financeira</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <AddExpenseDialog />
            <div className="flex items-center space-x-2">
              <label htmlFor="date-select" className="text-sm font-medium">Data:</label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white text-xl mr-4">
                  💰
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendas do Dia</p>
                  <p className="text-2xl font-bold text-green-600">R$ {summary.sales.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center text-white text-xl mr-4">
                  💸
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Despesas do Dia</p>
                  <p className="text-2xl font-bold text-red-600">R$ {summary.expenses.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xl mr-4">
                  🏦
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
                  <p className="text-2xl font-bold text-blue-600">R$ {summary.total.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white text-xl mr-4">
                  📊
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Número de Vendas</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.salesCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xl mr-4">
                  💵
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Dinheiro</p>
                  <p className="text-2xl font-bold text-emerald-600">R$ {summary.cash.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center text-white text-xl mr-4">
                  💳
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Cartão de Crédito</p>
                  <p className="text-2xl font-bold text-amber-600">R$ {summary.credit.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-cyan-500 flex items-center justify-center text-white text-xl mr-4">
                  💎
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Cartão de Débito</p>
                  <p className="text-2xl font-bold text-cyan-600">R$ {summary.debit.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movements List */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações do Dia</CardTitle>
            <CardDescription>
              Histórico detalhado de todas as movimentações em {new Date(selectedDate).toLocaleDateString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movements.length > 0 ? (
              <div className="space-y-4">
                {movements.map((movement) => {
                  const typeInfo = getMovementTypeInfo(movement.type);
                  const paymentMethodLabel = getPaymentMethodLabel(movement.sales?.payment_method || null);
                  
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
                          {typeInfo.icon}
                        </div>
                        <div>
                          <p className="font-medium">{movement.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                            {paymentMethodLabel && (
                              <Badge variant="outline">
                                {paymentMethodLabel}
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              {new Date(movement.created_at || '').toLocaleTimeString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            movement.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movement.amount > 0 ? '+' : ''}R$ {movement.amount.toFixed(2)}
                          </p>
                        </div>
                        {movement.type === 'expense' && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingExpense(movement)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingExpense(movement)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma movimentação</h3>
                <p className="text-gray-600">Não há movimentações para a data selecionada.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total de Vendas</p>
                <p className="text-2xl font-bold text-green-600">R$ {summary.sales.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total de Despesas</p>
                <p className="text-2xl font-bold text-red-600">R$ {summary.expenses.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Lucro Líquido</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {summary.total.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Expense Dialog */}
        {editingExpense && (
          <EditExpenseDialog
            expense={editingExpense}
            isOpen={!!editingExpense}
            onOpenChange={(open) => {
              if (!open) setEditingExpense(null);
            }}
          />
        )}

        {/* Delete Expense Dialog */}
        {deletingExpense && (
          <DeleteExpenseDialog
            expense={deletingExpense}
            isOpen={!!deletingExpense}
            onOpenChange={(open) => {
              if (!open) setDeletingExpense(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Cashier;

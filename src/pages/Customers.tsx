
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';

const Customers = () => {
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        await updateCustomerMutation.mutateAsync({
          id: editingCustomer.id,
          ...formData
        });
        toast({
          title: "Cliente atualizado!",
          description: "As informações do cliente foram atualizadas com sucesso.",
        });
      } else {
        await createCustomerMutation.mutateAsync(formData);
        toast({
          title: "Cliente cadastrado!",
          description: "Novo cliente adicionado com sucesso.",
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o cliente.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomerMutation.mutateAsync(id);
      toast({
        title: "Cliente removido!",
        description: "O cliente foi removido do sistema.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o cliente.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '' });
    setEditingCustomer(null);
    setIsDialogOpen(false);
  };

  const getCustomerBadge = (totalPurchases: number = 0) => {
    if (totalPurchases >= 500) return { label: 'VIP', color: 'bg-purple-100 text-purple-800' };
    if (totalPurchases >= 200) return { label: 'Premium', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Regular', color: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="px-4 sm:px-0">
          <div className="text-center py-8">Carregando clientes...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Clientes</h2>
            <p className="text-gray-600">Gerencie sua base de clientes</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-strawberry-500 hover:bg-strawberry-600" onClick={() => setEditingCustomer(null)}>
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                <DialogDescription>
                  {editingCustomer ? 'Atualize as informações do cliente.' : 'Adicione um novo cliente à sua base.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nome do cliente"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="cliente@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Endereço completo"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-strawberry-500 hover:bg-strawberry-600">
                    {editingCustomer ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {customers.map((customer) => {
            const badge = getCustomerBadge(0); // Sem dados de compras por enquanto
            return (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {customer.name}
                        <Badge className={badge.color}>
                          {badge.label}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2 space-y-1">
                        {customer.email && <span className="block">📧 {customer.email}</span>}
                        {customer.phone && <span className="block">📱 {customer.phone}</span>}
                        {customer.address && <span className="block">📍 {customer.address}</span>}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Total em compras:</span>
                      <span className="font-semibold text-strawberry-600">
                        R$ 0,00
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Última compra:</span>
                      <span>-</span>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEdit(customer)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDelete(customer.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {customers.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente cadastrado</h3>
              <p className="text-gray-600 mb-4">Comece adicionando seu primeiro cliente à base.</p>
              <Button 
                className="bg-strawberry-500 hover:bg-strawberry-600"
                onClick={() => setIsDialogOpen(true)}
              >
                Cadastrar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Customers;

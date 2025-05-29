
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSales, useCreateSale, useDeleteSale } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2 } from 'lucide-react';

interface CartItem {
  product: any;
  quantity: number;
}

const Sales = () => {
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const createSaleMutation = useCreateSale();
  const deleteSaleMutation = useDeleteSale();
  const { user } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  const { toast } = useToast();

  const addToCart = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock_quantity < quantity) {
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${product.stock_quantity} unidades disponíveis.`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.product.id === productId);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock_quantity < newQuantity) {
        toast({
          title: "Estoque insuficiente",
          description: `Apenas ${product.stock_quantity} unidades disponíveis.`,
          variant: "destructive",
        });
        return;
      }
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock_quantity) {
      toast({
        title: "Estoque insuficiente",
        description: `Produto ${product.name} não tem estoque suficiente.`,
        variant: "destructive",
      });
      return;
    }
    
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const completeSale = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para realizar uma venda.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCustomerId || cart.length === 0) {
      toast({
        title: "Erro na venda",
        description: "Selecione um cliente e adicione produtos ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    // Verify stock availability before processing
    for (const item of cart) {
      const product = products.find(p => p.id === item.product.id);
      if (!product || product.stock_quantity < item.quantity) {
        toast({
          title: "Estoque insuficiente",
          description: `Produto ${item.product.name} não tem estoque suficiente.`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      console.log('Starting sale creation...');
      
      const saleData = {
        customer_id: selectedCustomerId,
        total_amount: getCartTotal(),
        status: 'completed' as const,
        payment_method: paymentMethod
      };

      const items = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }));

      console.log('Sale data:', saleData);
      console.log('Items:', items);

      await createSaleMutation.mutateAsync({ sale: saleData, items });
      
      setCart([]);
      setSelectedCustomerId('');
      setPaymentMethod('cash');
      setIsDialogOpen(false);

      toast({
        title: "Venda realizada!",
        description: `Venda de R$ ${getCartTotal().toFixed(2)} registrada com sucesso.`,
      });
    } catch (error: any) {
      console.error('Sale error:', error);
      toast({
        title: "Erro ao processar venda",
        description: error.message || "Ocorreu um erro ao processar a venda.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    try {
      await deleteSaleMutation.mutateAsync(saleId);
      toast({
        title: "Venda excluída!",
        description: "A venda foi excluída e o estoque foi restaurado.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a venda.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return { label: 'Concluída', color: 'bg-green-100 text-green-800' };
      case 'pending': return { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
      case 'cancelled': return { label: 'Cancelada', color: 'bg-red-100 text-red-800' };
      default: return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="px-4 sm:px-0">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Acesso negado</h2>
            <p className="text-gray-600">Você precisa estar logado para acessar as vendas.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (salesLoading) {
    return (
      <Layout>
        <div className="px-4 sm:px-0">
          <div className="text-center py-8">Carregando vendas...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendas</h2>
            <p className="text-gray-600">Gerencie suas vendas e pedidos</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-strawberry-500 hover:bg-strawberry-600">
                Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nova Venda</DialogTitle>
                <DialogDescription>
                  Selecione o cliente, método de pagamento e adicione produtos ao carrinho.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <Label>Método de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit">Cartão de Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Selection */}
                <div className="space-y-4">
                  <Label>Produtos</Label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">R$ {product.price.toFixed(2)} - Estoque: {product.stock_quantity}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product.id, 1)}
                          disabled={product.stock_quantity === 0}
                        >
                          Adicionar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                  <div className="space-y-4">
                    <Label>Carrinho</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-600">R$ {item.product.price.toFixed(2)} cada</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="1"
                              max={item.product.stock_quantity}
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value) || 0)}
                              className="w-16 text-center"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">Total: R$ {getCartTotal().toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={completeSale}
                  className="bg-strawberry-500 hover:bg-strawberry-600"
                  disabled={!selectedCustomerId || cart.length === 0 || createSaleMutation.isPending}
                >
                  {createSaleMutation.isPending ? 'Processando...' : 'Finalizar Venda'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sales List */}
        <div className="space-y-4">
          {sales.map((sale) => {
            const badge = getStatusBadge(sale.status || 'pending');
            const paymentMethodLabel = sale.payment_method === 'cash' ? 'Dinheiro' : 
                                    sale.payment_method === 'credit' ? 'Cartão de Crédito' :
                                    sale.payment_method === 'debit' ? 'Cartão de Débito' : 'Não informado';
            
            return (
              <Card key={sale.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Venda #{sale.id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        Cliente: {sale.customers?.name || 'Cliente não informado'} • 
                        Data: {new Date(sale.created_at || '').toLocaleDateString('pt-BR')} • 
                        Pagamento: {paymentMethodLabel}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={badge.color}>
                        {badge.label}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSale(sale.id)}
                        disabled={deleteSaleMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Itens:</h4>
                      <div className="space-y-1">
                        {sale.sale_items?.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.products?.name}</span>
                            <span>R$ {item.total_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-strawberry-600">
                        R$ {sale.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {sales.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma venda registrada</h3>
              <p className="text-gray-600 mb-4">Comece registrando sua primeira venda.</p>
              <Button 
                className="bg-strawberry-500 hover:bg-strawberry-600"
                onClick={() => setIsDialogOpen(true)}
              >
                Registrar Primeira Venda
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Sales;

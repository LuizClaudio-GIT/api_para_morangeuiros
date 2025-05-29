
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // Get recent sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          total_amount,
          created_at,
          customers(name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (salesError) throw salesError;
      
      // Get recent products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (productsError) throw productsError;
      
      // Get recent customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (customersError) throw customersError;
      
      // Combine and sort all activities by date
      const activities = [
        ...salesData.map(sale => ({
          type: 'sale' as const,
          id: sale.id,
          title: 'Venda realizada',
          description: `${sale.customers?.name || 'Cliente'} - R$ ${Number(sale.total_amount).toFixed(2)}`,
          created_at: sale.created_at,
          icon: '💰',
          bgColor: 'bg-green-100'
        })),
        ...productsData.map(product => ({
          type: 'product' as const,
          id: product.id,
          title: 'Produto cadastrado',
          description: product.name,
          created_at: product.created_at,
          icon: '📦',
          bgColor: 'bg-blue-100'
        })),
        ...customersData.map(customer => ({
          type: 'customer' as const,
          id: customer.id,
          title: 'Cliente cadastrado',
          description: customer.name,
          created_at: customer.created_at,
          icon: '👤',
          bgColor: 'bg-purple-100'
        }))
      ].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 3);
      
      return activities;
    },
  });
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's sales total
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .eq('status', 'completed');
      
      if (salesError) throw salesError;
      
      const todaysSales = salesData.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
      
      // Get total products count
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (productsError) throw productsError;
      
      // Get total customers count
      const { count: customersCount, error: customersError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
      
      if (customersError) throw customersError;
      
      // Get today's orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      
      if (ordersError) throw ordersError;
      
      return {
        todaysSales,
        productsCount: productsCount || 0,
        customersCount: customersCount || 0,
        ordersCount: ordersCount || 0
      };
    },
  });
};

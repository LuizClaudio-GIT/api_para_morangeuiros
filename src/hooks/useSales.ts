import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

type Sale = Tables<'sales'>;
type SaleInsert = TablesInsert<'sales'>;
type SaleItem = Tables<'sale_items'>;
type SaleItemInsert = TablesInsert<'sale_items'>;

export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers(name),
          sale_items(
            *,
            products(name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching sales:', error);
        throw error;
      }
      
      return data;
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      sale, 
      items 
    }: { 
      sale: Omit<SaleInsert, 'user_id'>; 
      items: Omit<SaleItemInsert, 'sale_id'>[] 
    }) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Creating sale with user from usuarios table:', user.id);

      // Validate user exists in usuarios table
      const { data: userExists, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', user.id)
        .single();

      if (userError || !userExists) {
        console.error('User validation error:', userError);
        throw new Error('Invalid user ID - user does not exist');
      }

      // Create the sale with user ID from usuarios table
      const saleData = {
        ...sale,
        user_id: user.id
      };

      const { data: createdSale, error: saleError } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single();
      
      if (saleError) {
        console.error('Error creating sale:', saleError);
        throw saleError;
      }

      console.log('Sale created:', createdSale);
      
      // Create sale items
      const saleItems = items.map(item => ({
        ...item,
        sale_id: createdSale.id
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);
      
      if (itemsError) {
        console.error('Error creating sale items:', itemsError);
        throw itemsError;
      }
      
      // Update product stock
      for (const item of items) {
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();
        
        if (fetchError) {
          console.error('Error fetching product:', fetchError);
          continue;
        }
        
        const newStock = product.stock_quantity - item.quantity;
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: Math.max(0, newStock) })
          .eq('id', item.product_id);
        
        if (updateError) {
          console.error('Error updating stock:', updateError);
        }
      }
      
      // Check if cash movement already exists for this sale to avoid duplicates
      const { data: existingMovement } = await supabase
        .from('cash_movements')
        .select('id')
        .eq('sale_id', createdSale.id)
        .single();
      
      // Only create cash movement if it doesn't exist
      if (!existingMovement) {
        const { error: cashError } = await supabase
          .from('cash_movements')
          .insert({
            user_id: user.id,
            type: 'sale',
            amount: sale.total_amount,
            description: `Venda #${createdSale.id.slice(0, 8)} - ${sale.payment_method}`,
            sale_id: createdSale.id
          });
        
        if (cashError) {
          console.error('Error creating cash movement:', cashError);
        }
      }
      
      return createdSale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      queryClient.invalidateQueries({ queryKey: ['todays-cash-summary'] });
    },
    onError: (error) => {
      console.error('Sale creation failed:', error);
    }
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleId: string) => {
      console.log('Deleting sale:', saleId);
      
      // First get the sale items to restore stock
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', saleId);
      
      if (itemsError) {
        console.error('Error fetching sale items:', itemsError);
        throw itemsError;
      }
      
      // Restore product stock
      for (const item of saleItems || []) {
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();
        
        if (fetchError) {
          console.error('Error fetching product:', fetchError);
          continue;
        }
        
        const newStock = product.stock_quantity + item.quantity;
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product_id);
        
        if (updateError) {
          console.error('Error updating stock:', updateError);
        }
      }
      
      // Delete sale items first (due to foreign key constraint)
      const { error: deleteItemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);
      
      if (deleteItemsError) {
        console.error('Error deleting sale items:', deleteItemsError);
        throw deleteItemsError;
      }
      
      // Delete cash movements related to this sale
      const { error: deleteCashError } = await supabase
        .from('cash_movements')
        .delete()
        .eq('sale_id', saleId);
      
      if (deleteCashError) {
        console.error('Error deleting cash movement:', deleteCashError);
      }
      
      // Finally delete the sale
      const { error: deleteSaleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);
      
      if (deleteSaleError) {
        console.error('Error deleting sale:', deleteSaleError);
        throw deleteSaleError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      queryClient.invalidateQueries({ queryKey: ['todays-cash-summary'] });
    },
  });
};

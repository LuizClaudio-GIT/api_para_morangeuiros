
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database';

type Product = Tables<'products'>;
type ProductInsert = TablesInsert<'products'>;
type ProductUpdate = TablesUpdate<'products'>;

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      return data as Product[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      console.log('Creating product:', product);
      
      // Validate required fields
      if (!product.name || product.price === undefined || product.stock_quantity === undefined) {
        throw new Error('Name, price, and stock quantity are required');
      }
      
      if (product.price < 0) {
        throw new Error('Price cannot be negative');
      }
      
      if (product.stock_quantity < 0) {
        throw new Error('Stock quantity cannot be negative');
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }
      
      console.log('Product created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Product creation failed:', error);
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ProductUpdate & { id: string }) => {
      if (!id) {
        throw new Error('Product ID is required for update');
      }
      
      console.log('Updating product:', id, updates);
      
      // Validate fields if they are being updated
      if (updates.price !== undefined && updates.price < 0) {
        throw new Error('Price cannot be negative');
      }
      
      if (updates.stock_quantity !== undefined && updates.stock_quantity < 0) {
        throw new Error('Stock quantity cannot be negative');
      }
      
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error('Product ID is required for deletion');
      }
      
      console.log('Deleting product:', id);
      
      // Check if product is used in any sales before deleting
      const { data: saleItems, error: checkError } = await supabase
        .from('sale_items')
        .select('id')
        .eq('product_id', id)
        .limit(1);
      
      if (checkError) {
        console.error('Error checking product usage:', checkError);
        throw checkError;
      }
      
      if (saleItems && saleItems.length > 0) {
        throw new Error('Cannot delete product that has been used in sales');
      }
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

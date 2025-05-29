
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database';

type Customer = Tables<'customers'>;
type CustomerInsert = TablesInsert<'customers'>;
type CustomerUpdate = TablesUpdate<'customers'>;

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      
      return data as Customer[];
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: CustomerInsert) => {
      console.log('Creating customer:', customer);
      
      // Validate required fields
      if (!customer.name || customer.name.trim() === '') {
        throw new Error('Customer name is required');
      }
      
      // Validate email format if provided
      if (customer.email && customer.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customer.email)) {
          throw new Error('Invalid email format');
        }
      }
      
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }
      
      console.log('Customer created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      console.error('Customer creation failed:', error);
    }
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: CustomerUpdate & { id: string }) => {
      if (!id) {
        throw new Error('Customer ID is required for update');
      }
      
      console.log('Updating customer:', id, updates);
      
      // Validate fields if they are being updated
      if (updates.name !== undefined && (!updates.name || updates.name.trim() === '')) {
        throw new Error('Customer name cannot be empty');
      }
      
      if (updates.email && updates.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          throw new Error('Invalid email format');
        }
      }
      
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error('Customer ID is required for deletion');
      }
      
      console.log('Deleting customer:', id);
      
      // Check if customer has any sales before deleting
      const { data: sales, error: checkError } = await supabase
        .from('sales')
        .select('id')
        .eq('customer_id', id)
        .limit(1);
      
      if (checkError) {
        console.error('Error checking customer sales:', checkError);
        throw checkError;
      }
      
      if (sales && sales.length > 0) {
        throw new Error('Cannot delete customer that has associated sales');
      }
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

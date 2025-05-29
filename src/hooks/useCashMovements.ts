import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database';

type CashMovement = Tables<'cash_movements'>;
type CashMovementInsert = TablesInsert<'cash_movements'>;
type CashMovementUpdate = TablesUpdate<'cash_movements'>;

export const useCashMovements = () => {
  return useQuery({
    queryKey: ['cash-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching cash movements:', error);
        throw error;
      }
      
      return data as CashMovement[];
    },
  });
};

export const useCashMovementsByDate = (selectedDate: string) => {
  return useQuery({
    queryKey: ['cash-movements', selectedDate],
    queryFn: async () => {
      const startDate = `${selectedDate}T00:00:00`;
      const endDate = `${selectedDate}T23:59:59`;
      
      const { data, error } = await supabase
        .from('cash_movements')
        .select(`
          *,
          sales(payment_method)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching cash movements by date:', error);
        throw error;
      }
      
      return data;
    },
  });
};

export const useCreateCashMovement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movement: CashMovementInsert) => {
      console.log('Creating cash movement with data:', movement);
      
      // Validate required fields
      if (!movement.user_id) {
        throw new Error('User ID is required');
      }
      
      if (!movement.type || movement.amount === undefined || !movement.description) {
        throw new Error('Type, amount, and description are required');
      }

      // Validate user exists in usuarios table
      const { data: userExists, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', movement.user_id)
        .single();

      if (userError || !userExists) {
        console.error('User validation error:', userError);
        throw new Error('Invalid user ID - user does not exist');
      }
      
      const { data, error } = await supabase
        .from('cash_movements')
        .insert(movement)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating cash movement:', error);
        throw error;
      }
      
      console.log('Cash movement created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
      queryClient.invalidateQueries({ queryKey: ['todays-cash-summary'] });
    },
    onError: (error) => {
      console.error('Cash movement creation failed:', error);
    }
  });
};

export const useUpdateCashMovement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movement: { id: string } & Partial<CashMovementUpdate>) => {
      const { id, ...updateData } = movement;
      
      if (!id) {
        throw new Error('Cash movement ID is required for update');
      }
      
      console.log('Updating cash movement:', id, updateData);
      
      const { data, error } = await supabase
        .from('cash_movements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating cash movement:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
      queryClient.invalidateQueries({ queryKey: ['todays-cash-summary'] });
    },
  });
};

export const useDeleteCashMovement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movementId: string) => {
      if (!movementId) {
        throw new Error('Cash movement ID is required for deletion');
      }
      
      console.log('Deleting cash movement:', movementId);
      
      const { error } = await supabase
        .from('cash_movements')
        .delete()
        .eq('id', movementId);
      
      if (error) {
        console.error('Error deleting cash movement:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
      queryClient.invalidateQueries({ queryKey: ['todays-cash-summary'] });
    },
  });
};

export const useTodaysCashSummary = (selectedDate?: string) => {
  return useQuery({
    queryKey: ['todays-cash-summary', selectedDate],
    queryFn: async () => {
      const date = selectedDate || new Date().toISOString().split('T')[0];
      const startDate = `${date}T00:00:00`;
      const endDate = `${date}T23:59:59`;
      
      const { data, error } = await supabase
        .from('cash_movements')
        .select(`
          type, 
          amount,
          sales(payment_method)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) {
        console.error('Error fetching cash summary:', error);
        throw error;
      }
      
      const summary = data.reduce((acc, movement) => {
        if (movement.type === 'sale') {
          const paymentMethod = (movement.sales as any)?.payment_method || 'cash';
          acc.sales += Number(movement.amount);
          
          if (paymentMethod === 'cash') {
            acc.cash += Number(movement.amount);
          } else if (paymentMethod === 'credit') {
            acc.credit += Number(movement.amount);
          } else if (paymentMethod === 'debit') {
            acc.debit += Number(movement.amount);
          }
        } else if (movement.type === 'expense') {
          acc.expenses += Math.abs(Number(movement.amount));
        }
        return acc;
      }, { 
        sales: 0, 
        expenses: 0, 
        cash: 0, 
        credit: 0, 
        debit: 0 
      });
      
      const total = summary.sales - summary.expenses;
      const salesCount = data.filter(m => m.type === 'sale').length;
      
      return {
        ...summary,
        total,
        salesCount
      };
    },
  });
};

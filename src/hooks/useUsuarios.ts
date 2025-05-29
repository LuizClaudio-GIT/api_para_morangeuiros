
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Usuario, UsuarioInsert, UsuarioUpdate, UserRole } from '@/types/user';

export const useUsuarios = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      // Verifica se o usuário é admin
      if (user?.funcao !== 'admin') {
        throw new Error('Acesso negado: apenas administradores podem visualizar usuários');
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching usuarios:', error);
        throw error;
      }
      
      return data as Usuario[];
    },
    enabled: !!user && user.funcao === 'admin',
  });
};

export const useCreateUsuario = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (usuario: UsuarioInsert) => {
      // Verifica se o usuário é admin
      if (user?.funcao !== 'admin') {
        throw new Error('Acesso negado: apenas administradores podem criar usuários');
      }

      console.log('Creating usuario:', usuario);
      
      // Validate required fields
      if (!usuario.nome || usuario.nome.trim() === '') {
        throw new Error('Nome é obrigatório');
      }
      
      if (!usuario.email || usuario.email.trim() === '') {
        throw new Error('Email é obrigatório');
      }
      
      if (!usuario.senha || usuario.senha.trim() === '') {
        throw new Error('Senha é obrigatória');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(usuario.email)) {
        throw new Error('Formato de email inválido');
      }
      
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', usuario.email)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing email:', checkError);
        throw checkError;
      }
      
      if (existingUser) {
        throw new Error('Email já está em uso');
      }
      
      const { data, error } = await supabase
        .from('usuarios')
        .insert(usuario)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating usuario:', error);
        throw error;
      }
      
      console.log('Usuario created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error) => {
      console.error('Usuario creation failed:', error);
    }
  });
};

export const useUpdateUsuario = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UsuarioUpdate) => {
      // Verifica se o usuário é admin
      if (user?.funcao !== 'admin') {
        throw new Error('Acesso negado: apenas administradores podem editar usuários');
      }

      if (!id) {
        throw new Error('ID do usuário é obrigatório para atualização');
      }
      
      console.log('Updating usuario:', id, updates);
      
      // Validate fields if they are being updated
      if (updates.nome !== undefined && (!updates.nome || updates.nome.trim() === '')) {
        throw new Error('Nome não pode estar vazio');
      }
      
      if (updates.email && updates.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          throw new Error('Formato de email inválido');
        }
        
        // Check if email already exists for another user
        const { data: existingUser, error: checkError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', updates.email)
          .neq('id', id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing email:', checkError);
          throw checkError;
        }
        
        if (existingUser) {
          throw new Error('Email já está em uso por outro usuário');
        }
      }
      
      if (updates.senha !== undefined && (!updates.senha || updates.senha.trim() === '')) {
        throw new Error('Senha não pode estar vazia');
      }
      
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating usuario:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
};

export const useDeleteUsuario = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Verifica se o usuário é admin
      if (user?.funcao !== 'admin') {
        throw new Error('Acesso negado: apenas administradores podem excluir usuários');
      }

      if (!id) {
        throw new Error('ID do usuário é obrigatório para exclusão');
      }

      // Impede que o usuário exclua a própria conta
      if (id === user.id) {
        throw new Error('Você não pode excluir sua própria conta');
      }
      
      console.log('Deleting usuario:', id);
      
      // Check if user has any associated records before deleting
      const { data: sales, error: salesCheckError } = await supabase
        .from('sales')
        .select('id')
        .eq('user_id', id)
        .limit(1);
      
      if (salesCheckError) {
        console.error('Error checking user sales:', salesCheckError);
        throw salesCheckError;
      }
      
      if (sales && sales.length > 0) {
        throw new Error('Não é possível excluir usuário que possui vendas associadas');
      }
      
      const { data: cashMovements, error: cashCheckError } = await supabase
        .from('cash_movements')
        .select('id')
        .eq('user_id', id)
        .limit(1);
      
      if (cashCheckError) {
        console.error('Error checking user cash movements:', cashCheckError);
        throw cashCheckError;
      }
      
      if (cashMovements && cashMovements.length > 0) {
        throw new Error('Não é possível excluir usuário que possui movimentações de caixa associadas');
      }
      
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting usuario:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
};


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteUsuario } from '@/hooks/useUsuarios';
import { useToast } from '@/hooks/use-toast';
import type { Usuario } from '@/types/user';

interface DeleteUserDialogProps {
  user: Usuario;
  onClose: () => void;
}

const DeleteUserDialog = ({ user, onClose }: DeleteUserDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const deleteUsuario = useDeleteUsuario();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await deleteUsuario.mutateAsync(user.id);

      toast({
        title: "Usuário excluído com sucesso!",
        description: "O usuário foi removido do sistema.",
      });

      onClose();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] mx-4 max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>Excluir Usuário</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o usuário "{user.nome}"? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;

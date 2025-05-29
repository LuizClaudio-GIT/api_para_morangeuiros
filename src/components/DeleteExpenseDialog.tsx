
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useDeleteCashMovement } from '@/hooks/useCashMovements';
import { Tables } from '@/integrations/supabase/types';

type CashMovement = Tables<'cash_movements'>;

interface DeleteExpenseDialogProps {
  expense: CashMovement;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteExpenseDialog = ({ expense, isOpen, onOpenChange }: DeleteExpenseDialogProps) => {
  const { toast } = useToast();
  const deleteCashMovement = useDeleteCashMovement();

  const handleDelete = async () => {
    try {
      await deleteCashMovement.mutateAsync(expense.id);
      
      toast({
        title: "Despesa excluída!",
        description: "A despesa foi removida com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a despesa.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Tem certeza que deseja excluir esta despesa de R$ {Math.abs(expense.amount).toFixed(2)}?
            <br />
            <strong>Descrição:</strong> {expense.description}
            <br />
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
            disabled={deleteCashMovement.isPending}
          >
            {deleteCashMovement.isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteExpenseDialog;

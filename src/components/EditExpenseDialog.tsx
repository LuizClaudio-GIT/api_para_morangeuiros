
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUpdateCashMovement } from '@/hooks/useCashMovements';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type CashMovement = Tables<'cash_movements'>;

interface EditExpenseDialogProps {
  expense: CashMovement;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditExpenseDialog = ({ expense, isOpen, onOpenChange }: EditExpenseDialogProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const updateCashMovement = useUpdateCashMovement();
  const { user } = useAuth();

  useEffect(() => {
    if (expense) {
      setAmount(Math.abs(expense.amount).toString());
      setDescription(expense.description || '');
    }
  }, [expense]);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para editar despesas.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || !description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Erro",
        description: "Insira um valor válido para a despesa.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCashMovement.mutateAsync({
        id: expense.id,
        amount: -Math.abs(amountValue),
        description: description.trim()
      });

      toast({
        title: "Despesa atualizada!",
        description: `Despesa de R$ ${amountValue.toFixed(2)} foi atualizada com sucesso.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a despesa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] mx-4 max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>Editar Despesa</DialogTitle>
          <DialogDescription>
            Altere os dados da despesa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Valor da Despesa *</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição *</Label>
            <Textarea
              id="edit-description"
              placeholder="Descreva a despesa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
            disabled={updateCashMovement.isPending}
          >
            {updateCashMovement.isPending ? 'Atualizando...' : 'Atualizar Despesa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseDialog;

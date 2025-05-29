
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCreateCashMovement } from '@/hooks/useCashMovements';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

const AddExpenseDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const createCashMovement = useCreateCashMovement();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para registrar despesas.",
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

    if (description.trim().length === 0) {
      toast({
        title: "Erro",
        description: "A descrição não pode estar vazia.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to create cash movement with user ID:', user.id);
      await createCashMovement.mutateAsync({
        user_id: user.id,
        type: 'expense',
        amount: -Math.abs(amountValue), // Ensure negative value for expenses
        description: description.trim()
      });

      toast({
        title: "Despesa registrada!",
        description: `Despesa de R$ ${amountValue.toFixed(2)} foi registrada com sucesso.`,
      });

      // Reset form
      setAmount('');
      setDescription('');
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao registrar a despesa.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Registrar Despesa</DialogTitle>
          <DialogDescription>
            Adicione uma nova despesa ao caixa do dia.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor da Despesa *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva a despesa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500">
              {description.length}/500 caracteres
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-red-500 hover:bg-red-600"
            disabled={createCashMovement.isPending || !amount || !description}
          >
            {createCashMovement.isPending ? 'Registrando...' : 'Registrar Despesa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;

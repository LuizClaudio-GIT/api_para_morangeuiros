
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateUsuario } from '@/hooks/useUsuarios';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/types/user';

interface AddUserDialogProps {
  onClose: () => void;
}

const AddUserDialog = ({ onClose }: AddUserDialogProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    funcao: 'employee' as UserRole
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const createUsuario = useCreateUsuario();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createUsuario.mutateAsync(formData);

      toast({
        title: "Usuário criado com sucesso!",
        description: "O usuário foi adicionado ao sistema.",
      });

      onClose();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      
      let errorMessage = "Ocorreu um erro inesperado.";
      
      if (error?.message?.includes('duplicate key')) {
        errorMessage = "Este email já está cadastrado no sistema.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro ao criar usuário",
        description: errorMessage,
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
          <DialogTitle>Adicionar Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário para ter acesso ao sistema
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="senha" className="text-right">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="col-span-3"
                required
                minLength={6}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="funcao" className="text-right">
                Função
              </Label>
              <Select
                value={formData.funcao}
                onValueChange={(value: UserRole) => setFormData({ ...formData, funcao: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Funcionário</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-strawberry-500 hover:bg-strawberry-600 w-full sm:w-auto"
            >
              {isLoading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;

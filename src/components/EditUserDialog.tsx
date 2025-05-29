
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
import { useUpdateUsuario } from '@/hooks/useUsuarios';
import { useToast } from '@/hooks/use-toast';
import type { Usuario, UserRole } from '@/types/user';

interface EditUserDialogProps {
  user: Usuario;
  onClose: () => void;
}

const EditUserDialog = ({ user, onClose }: EditUserDialogProps) => {
  const [formData, setFormData] = useState({
    nome: user.nome,
    email: user.email,
    senha: '',
    funcao: user.funcao
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const updateUsuario = useUpdateUsuario();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: any = {
        id: user.id,
        nome: formData.nome,
        email: formData.email,
        funcao: formData.funcao
      };

      // Só inclui a senha se foi preenchida
      if (formData.senha.trim()) {
        updateData.senha = formData.senha;
      }

      await updateUsuario.mutateAsync(updateData);

      toast({
        title: "Usuário atualizado com sucesso!",
        description: "As informações do usuário foram atualizadas.",
      });

      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro ao atualizar usuário",
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
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário
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
                Nova Senha
              </Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="col-span-3"
                placeholder="Deixe em branco para manter atual"
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
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;

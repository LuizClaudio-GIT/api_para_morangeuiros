
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, User } from 'lucide-react';
import type { Usuario, UserRole } from '@/types/user';

interface UserCardProps {
  user: Usuario;
  onEdit: (user: Usuario) => void;
  onDelete: (user: Usuario) => void;
}

const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'moderator':
        return 'Moderador';
      default:
        return 'Funcionário';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-base">{user.nome}</CardTitle>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <Badge className={getRoleColor(user.funcao)}>
            {getRoleLabel(user.funcao)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col space-y-3">
          <div className="text-sm text-gray-500">
            Criado em: {formatDate(user.created_at)}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(user)}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(user)}
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;

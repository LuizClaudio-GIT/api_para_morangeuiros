
import { useState } from 'react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Plus, Search, Trash2, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import AddUserDialog from '@/components/AddUserDialog';
import EditUserDialog from '@/components/EditUserDialog';
import DeleteUserDialog from '@/components/DeleteUserDialog';
import UserCard from '@/components/UserCard';
import type { Usuario, UserRole } from '@/types/user';

const UsersPage = () => {
  const { data: usuarios = [], isLoading } = useUsuarios();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [deletingUser, setDeletingUser] = useState<Usuario | null>(null);
  const isMobile = useIsMobile();

  const filteredUsers = usuarios.filter(user =>
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">Carregando usuários...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Gerenciar Usuários</span>
                </CardTitle>
                <CardDescription>
                  Gerencie os usuários do sistema
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-strawberry-500 hover:bg-strawberry-600 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isMobile ? (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onEdit={setEditingUser}
                      onDelete={setDeletingUser}
                    />
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nome}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.funcao)}>
                              {getRoleLabel(user.funcao)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingUser(user)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showAddDialog && (
          <AddUserDialog onClose={() => setShowAddDialog(false)} />
        )}

        {editingUser && (
          <EditUserDialog
            user={editingUser}
            onClose={() => setEditingUser(null)}
          />
        )}

        {deletingUser && (
          <DeleteUserDialog
            user={deletingUser}
            onClose={() => setDeletingUser(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default UsersPage;

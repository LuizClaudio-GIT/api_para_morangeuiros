
export type UserRole = 'admin' | 'moderator' | 'employee';

export interface User {
  id: string;
  nome: string;
  email: string;
  funcao: UserRole;
  created_at: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  funcao: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UsuarioInsert {
  nome: string;
  email: string;
  senha: string;
  funcao?: UserRole;
}

export interface UsuarioUpdate {
  id: string;
  nome?: string;
  email?: string;
  senha?: string;
  funcao?: UserRole;
}

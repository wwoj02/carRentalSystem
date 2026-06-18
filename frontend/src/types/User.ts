export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: 'USER' | 'ADMIN';
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
}

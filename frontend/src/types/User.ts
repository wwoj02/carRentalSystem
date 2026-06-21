export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegisterRequest extends CreateUserRequest {
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

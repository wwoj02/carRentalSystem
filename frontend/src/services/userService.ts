import api from './api';
import type { User, CreateUserRequest, LoginRequest, RegisterRequest, AuthResponse } from '../types/User';

export const userService = {
  async getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async createUser(user: CreateUserRequest): Promise<User> {
    const { data } = await api.post<User>('/users', user);
    return data;
  },

  async register(request: RegisterRequest): Promise<User> {
    const { data } = await api.post<AuthResponse>('/auth/register', request);
    this.setSession(data);
    return data.user;
  },

  async login(request: LoginRequest): Promise<User> {
    const { data } = await api.post<AuthResponse>('/auth/login', request);
    this.setSession(data);
    return data.user;
  },

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    return JSON.parse(userJson);
  },

  setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  setSession(auth: AuthResponse): void {
    localStorage.setItem('user', JSON.stringify(auth.user));
    localStorage.setItem('token', auth.token);
  },

  clearCurrentUser(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/auth/me');
    this.clearCurrentUser();
  },
};

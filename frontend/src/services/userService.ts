import api from './api';
import type { User, CreateUserRequest, LoginRequest, RegisterRequest } from '../types/User';

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
    const { data } = await api.post<User>('/auth/register', request);
    this.setCurrentUser(data);
    return data;
  },

  async login(request: LoginRequest): Promise<User> {
    const { data } = await api.post<User>('/auth/login', request);
    this.setCurrentUser(data);
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    return JSON.parse(userJson);
  },

  setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearCurrentUser(): void {
    localStorage.removeItem('user');
  },
};

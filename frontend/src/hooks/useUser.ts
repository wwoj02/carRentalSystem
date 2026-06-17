import { useState } from 'react';
import type { User, CreateUserRequest } from '../types/User';
import { userService } from '../services/userService';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUser = async (): Promise<User | null> => {
    const currentUser = await userService.getCurrentUser();
    if (currentUser) setUser(currentUser);
    return currentUser;
  };

  const createUser = async (userData: CreateUserRequest): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userService.createUser(userData);
      userService.setCurrentUser(newUser);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsUser = (userData: User): void => {
    userService.setCurrentUser(userData);
    setUser(userData);
  };

  const logout = (): void => {
    userService.clearCurrentUser();
    setUser(null);
  };

  return { user, loading, error, getCurrentUser, createUser, loginAsUser, logout };
};

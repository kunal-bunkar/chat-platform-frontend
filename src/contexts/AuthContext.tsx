// Authentication context provider

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authService from "../services/authService";
import {
  clearAuthStorage,
  getAccessToken,
  setStoredUser,
  setTokens,
  type StoredUser,
} from "../utils/tokenManager";

export type AuthContextValue = {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear all tokens and user data on app startup
    // This forces users to login again each time they open the app
    clearAuthStorage();
    setUser(null);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setTokens(result.token, result.refreshToken);
    setStoredUser(result.user);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      // best-effort server logout for refresh-token invalidation, etc.
      await authService.logout();
    } catch {
      // ignore: for testing / offline scenarios we still clear locally
    } finally {
      clearAuthStorage();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = Boolean(getAccessToken()) && Boolean(user);
    return { user, isAuthenticated, isLoading, login, logout };
  }, [isLoading, login, logout, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
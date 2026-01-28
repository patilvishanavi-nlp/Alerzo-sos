import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiRequest, getApiUrl } from "@/lib/query-client";

export interface User {
  id: string;
  username: string;
  name: string | null;
  language: string | null;
  darkMode: boolean | null;
  fakeCallEnabled: boolean | null;
  silentSOS: boolean | null;
  sirenSound: boolean | null;
  powerSaving: boolean | null;
  selectedEmergencyType: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/auth/me", baseUrl), {
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await response.json();
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed" };
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", { username, password });
      const userData = await response.json();
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Registration failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

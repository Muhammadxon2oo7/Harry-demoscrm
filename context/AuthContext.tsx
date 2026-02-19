"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi, setTokens, clearTokens, type AuthUser, type UserRole } from "@/lib/api";

/** Map backend role to frontend route prefix */
const roleToPath: Record<UserRole, string> = {
  owner: "/admin",
  employee: "/staff",
  student: "/student",
};

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  /** Login with username + password. Role is determined by the backend. */
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("hp_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        localStorage.removeItem("hp_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const data = await authApi.login(username, password);
    setTokens(data.tokens.access, data.tokens.refresh);
    localStorage.setItem("hp_user", JSON.stringify(data.user));
    setUser(data.user);
    router.push(roleToPath[data.user.role] ?? "/login");
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

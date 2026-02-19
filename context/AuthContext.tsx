"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearTokens, type AuthUser, type UserRole } from "@/lib/api";
import { getCookie } from "@/lib/cookies";

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

  // Initialise from the hp_user cookie (set by the server login route)
  useEffect(() => {
    const cookieUser = getCookie("hp_user");
    if (cookieUser) {
      try {
        setUser(JSON.parse(cookieUser) as AuthUser);
      } catch {
        // corrupted cookie — ignore
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // POST to our Next.js server route which sets httpOnly cookies
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Propagate backend error so login page can display it
      throw data;
    }

    setUser(data.user as AuthUser);
    router.push(roleToPath[(data.user as AuthUser).role] ?? "/login");
  };

  const logout = async () => {
    // Call DELETE on the server route to clear the httpOnly cookie
    await fetch("/api/auth/login", { method: "DELETE" }).catch(() => {});
    clearTokens(); // clears any client-readable cookies too
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

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap } from "lucide-react";

const roleToPath: Record<string, string> = {
  owner: "/admin",
  employee: "/staff",
  student: "/student",
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(roleToPath[user.role] ?? "/");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err: unknown) {
      const apiError = err as Record<string, unknown>;
      const message =
        (apiError?.detail as string) ||
        (apiError?.non_field_errors as string[])?.join(", ") ||
        "Foydalanuvchi nomi yoki parol noto'g'ri";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || user) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 to-accent/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-lg rounded-2xl border border-border/50">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 text-foreground">
            Harry Potter Academy
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            CRM tizimiga xush kelibsiz
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Foydalanuvchi nomi
              </label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background border-border"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Parol
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border"
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition"
              disabled={isLoading}
            >
              {isLoading ? "Yuklanmoqda..." : "Kirish"}
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-primary hover:underline">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}

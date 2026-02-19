"use client";

import React from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AuthProvider } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <AuthProvider>
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </AuthProvider>
    </div>
  );
}

"use client";

import React from "react";
import { StaffSidebar } from "@/components/staff-sidebar";
import { AuthProvider } from "@/context/AuthContext";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <AuthProvider>
        <StaffSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </AuthProvider>
    </div>
  );
}

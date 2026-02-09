"use client";

import React from "react";
import { StudentSidebar } from "@/components/student-sidebar";
import { AuthProvider } from "@/context/AuthContext";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <AuthProvider>
        <StudentSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </AuthProvider>
    </div>
  );
}

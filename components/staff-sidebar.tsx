"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Menu,
  User,
  Users,
  ClipboardList,
  Award,
  DollarSign,
  BookOpen,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export function StaffSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { href: "/staff", label: "Dashboard", icon: Users },
    { href: "/staff/subjects", label: "Fanlar va Guruhlar", icon: BookOpen },
    { href: "/staff/tests", label: "Testlar", icon: FileText },
    { href: "/staff/messages", label: "Xabarlar", icon: MessageSquare },
    { href: "/staff/rating", label: "Reyting", icon: Award },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 text-white bg-primary rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-64 h-screen bg-card border-r border-border transition-transform duration-300 z-40 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/staff" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Harry Potter Academy"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-base text-foreground leading-tight">
                Harry Potter
              </p>
              <p className="font-bold text-base text-foreground leading-tight">
                Academy
              </p>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            variant="outline"
            className="w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
  Trophy,
  BookOpen,
  ClipboardList,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

  const myInfo = {
    groupName: "Beginner A1",
    subject: "Ingliz tili",
    teacher: "Aliyev Jasur",
    rank: 1,
    score: 95,
    attendance: 98,
  };

  return (
    <div className="p-4 md:p-8 w-full min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-8 md:p-12 text-center space-y-6 bg-card/95 backdrop-blur-sm border shadow-lg animate-in fade-in slide-in-from-bottom duration-500">
        {/* Logo */}
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-primary" />
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Xush kelibsiz, {user?.full_name || user?.username || "O'quvchi"}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Safimizga qo'shilganingizdan juda xursandmiz.
          </p>
          <div className="pt-2 space-y-1">
            <p className="text-base font-medium text-foreground">
              {myInfo.groupName} - {myInfo.subject}
            </p>
            <p className="text-sm text-muted-foreground">
              O'qituvchi: {myInfo.teacher}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Reyting</p>
            <p className="text-lg font-bold text-yellow-600">#{myInfo.rank}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Ball</p>
            <p className="text-lg font-bold text-green-600">{myInfo.score}%</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <ClipboardList className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Davomat</p>
            <p className="text-lg font-bold text-blue-600">
              {myInfo.attendance}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

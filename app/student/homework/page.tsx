"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, CheckCircle, Clock } from "lucide-react";

interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "completed" | "pending" | "overdue";
}

export default function StudentHomeworkPage() {
  const homeworks: Homework[] = [
    {
      id: "1",
      title: "Present Simple mashqlari",
      description: "Student book 45-47 betlar, 10 ta mashqni yozing",
      dueDate: "2026-02-12",
      status: "pending",
    },
    {
      id: "2",
      title: "Vocabulary - Family members",
      description: "20 ta yangi so'zni yodlang va gaplarda qo'llang",
      dueDate: "2026-02-10",
      status: "pending",
    },
    {
      id: "3",
      title: "Reading comprehension",
      description: "Matnni o'qing va savollarga javob bering",
      dueDate: "2026-02-08",
      status: "completed",
    },
    {
      id: "4",
      title: "Listening practice",
      description: "Audio faylni tinglang va xulosangizni yozing",
      dueDate: "2026-02-05",
      status: "overdue",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Bajarilgan</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Kutilmoqda</Badge>;
      case "overdue":
        return <Badge variant="destructive">Muddati o'tgan</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "overdue":
        return <Clock className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const pendingCount = homeworks.filter((h) => h.status === "pending").length;
  const completedCount = homeworks.filter((h) => h.status === "completed").length;
  const overdueCount = homeworks.filter((h) => h.status === "overdue").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Uyga vazifalar</h1>
        <p className="text-muted-foreground mt-2">
          Berilgan barcha vazifalar ro'yxati
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Kutilmoqda</p>
              <h3 className="text-2xl font-bold mt-2">{pendingCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bajarilgan</p>
              <h3 className="text-2xl font-bold mt-2">{completedCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Muddati o'tgan</p>
              <h3 className="text-2xl font-bold mt-2">{overdueCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Homework List */}
      <div className="grid gap-4">
        {homeworks.map((homework) => (
          <Card key={homework.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                {getStatusIcon(homework.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{homework.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {homework.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Muddat: {homework.dueDate}</span>
                    </div>
                  </div>
                  {getStatusBadge(homework.status)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

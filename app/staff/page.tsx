"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Users, Calendar, Clock, BookOpen, TrendingUp } from "lucide-react";

export default function StaffDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const myGroups = [
    {
      id: "1",
      name: "Beginner A1",
      subject: "Ingliz tili",
      days: ["Dushanba", "Chorshanba", "Juma"],
      startTime: "09:00",
      endTime: "11:00",
      studentsCount: 12,
    },
    {
      id: "2",
      name: "Advanced C1",
      subject: "Ingliz tili",
      days: ["Seshanba", "Payshanba"],
      startTime: "14:00",
      endTime: "16:00",
      studentsCount: 8,
    },
  ];

  const today = new Date();
  const currentDay = [
    "Yakshanba",
    "Dushanba",
    "Seshanba",
    "Chorshanba",
    "Payshanba",
    "Juma",
    "Shanba",
  ][today.getDay()];
  const currentTime = today.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayClasses = myGroups.filter((group) =>
    group.days.includes(currentDay)
  );

  return (
    <div className="p-4 md:p-8 w-full space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
          <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          Xush kelibsiz, {user?.fullName}!
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Bugungi sana: {today.toLocaleDateString("uz-UZ")} | {currentDay} |{" "}
          {currentTime}
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <Card className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom duration-300" style={{animationDelay: "0ms"}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Mening guruhlarim
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mt-2 text-primary">
                {myGroups.length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom duration-300" style={{animationDelay: "100ms"}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Bugungi darslar
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mt-2 text-green-600">
                {todayClasses.length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom duration-300" style={{animationDelay: "200ms"}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Jami o'quvchilar
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mt-2 text-blue-600">
                {myGroups.reduce(
                  (total, group) => total + group.studentsCount,
                  0
                )}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Classes */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Bugungi darslar
        </h2>
        {todayClasses.length > 0 ? (
          <div className="space-y-4">
            {todayClasses.map((group) => (
              <div key={group.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <h3 className="font-semibold">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">{group.subject}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{group.startTime} - {group.endTime}</p>
                  <p className="text-sm text-muted-foreground">{group.studentsCount} o'quvchi</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Bugun darslaringiz yo'q</p>
        )}
      </Card>

      {/* All My Groups */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Barcha guruhlarim
        </h2>
        <div className="grid gap-4">
          {myGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => router.push(`/staff/${group.id}`)}
              className="border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition cursor-pointer"
            >
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Fan:</p>
                  <p className="font-medium">{group.subject}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dars kunlari:</p>
                  <p className="font-medium">{group.days.join(", ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vaqt:</p>
                  <p className="font-medium">{group.startTime} - {group.endTime}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">O'quvchilar:</p>
                  <p className="font-medium">{group.studentsCount} ta</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

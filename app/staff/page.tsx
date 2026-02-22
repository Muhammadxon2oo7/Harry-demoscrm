"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { fmtDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Users, Calendar, Clock, BookOpen, TrendingUp } from "lucide-react";
import { groupsApi, type Group } from "@/lib/api";

const dayMap: Record<string, string> = {
  Mon: "Dushanba",
  Tue: "Seshanba",
  Wed: "Chorshanba",
  Thu: "Payshanba",
  Fri: "Juma",
  Sat: "Shanba",
  Sun: "Yakshanba",
};

const todayKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

export default function StaffDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const groups = await groupsApi.list();
      setMyGroups(groups);
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const today = new Date();
  const currentDay = dayMap[todayKey] || "";
  const currentTime = today.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

  const todayClasses = myGroups.filter((g) =>
    (g.days || "").split(",").map((d) => d.trim()).includes(todayKey)
  );

  const totalStudents = myGroups.reduce((sum, g) => sum + (g.students_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
          <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          Xush kelibsiz, {user?.full_name || user?.username}!
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Bugungi sana: {fmtDate(today)} | {currentDay} | {currentTime}
        </p>
      </header>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 md:p-6 h-28 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          <Card className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom duration-300" style={{ animationDelay: "0ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Barcha guruhlar</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 text-primary">{myGroups.length}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom duration-300" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Bugungi darslar</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 text-green-600">{todayClasses.length}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom duration-300" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Jami o'quvchilar</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 text-blue-600">{totalStudents}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Today's Classes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Bugungi darslar
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-muted/30 rounded" />
            ))}
          </div>
        ) : todayClasses.length > 0 ? (
          <div className="space-y-4">
            {todayClasses.map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`/staff/${group.id}`)}
                className="flex items-center justify-between border-b pb-3 last:border-0 cursor-pointer hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div>
                  <h3 className="font-semibold">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">{group.subject_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{group.start_time?.slice(0, 5)} - {group.end_time?.slice(0, 5)}</p>
                  <p className="text-sm text-muted-foreground">{group.students_count} o'quvchi</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Bugun darslaringiz yo'q</p>
        )}
      </Card>

    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Trophy, ClipboardList, CheckCircle, TrendingUp } from "lucide-react";
import {
  studentsApi,
  attendanceApi,
  groupsApi,
  type AttendanceRecord,
  type UserProfile,
} from "@/lib/api";
import Image from "next/image";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subjectName, setSubjectName] = useState<string>("");
  const [rank, setRank] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      try {
        // Fetch student profile + all students list (for ranking) in parallel
        const [studentProfile, allStudents, attendanceList] = await Promise.all([
          studentsApi.get(user!.id),
          studentsApi.list(),
          attendanceApi.list(),
        ]);

        setProfile(studentProfile);

        // Subject name from group
        if (studentProfile.group?.id) {
          try {
            const group = await groupsApi.get(studentProfile.group.id);
            setSubjectName(group.subject_name || "");
          } catch {
            setSubjectName("");
          }
        }

        // Rank by all_score
        const sorted = [...allStudents].sort(
          (a, b) => (b.all_score ?? 0) - (a.all_score ?? 0)
        );
        const myIdx = sorted.findIndex((s) => s.id === user!.id);
        setRank(myIdx !== -1 ? myIdx + 1 : null);

        // My attendance percentage
        const myAtt = attendanceList.filter((a: AttendanceRecord) => {
          const sid =
            typeof a.student === "object"
              ? a.student.id
              : (a as unknown as { student: number }).student;
          return sid === user!.id;
        });
        const present = myAtt.filter(
          (a) => a.status === "keldi" || a.status === "kechikdi"
        ).length;
        setAttendance(
          myAtt.length ? Math.round((present / myAtt.length) * 100) : 0
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  return (
    <div className="w-full min-h-full flex items-center justify-center">
      <Card className="w-full max-w-md p-8 md:p-12 text-center space-y-6 bg-card/95 backdrop-blur-sm border shadow-lg animate-in fade-in slide-in-from-bottom duration-500">
        {/* Logo */}
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={72}
            height={72}
            className="w-20 h-20 md:w-12 md:h-12 object-contain"
          />
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Xush kelibsiz,{" "}
            {user?.full_name || user?.username || "O'quvchi"}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Safimizga qo&apos;shilganingizdan juda xursandmiz.
          </p>
          {loading ? (
            <p className="text-sm text-muted-foreground animate-pulse">
              Ma&apos;lumotlar yuklanmoqda...
            </p>
          ) : profile?.group ? (
            <div className="pt-2 space-y-1">
              <p className="text-sm text-muted-foreground">Sizning guruhingiz:</p>
              <p className="text-base font-medium text-foreground">
                {profile.group.name}
                {subjectName ? ` — ${subjectName}` : ""}
              </p>
            </div>
          ) : null}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-0">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Reyting</p>
            <p className="text-lg font-bold text-yellow-600">
              {loading ? "—" : rank != null ? `#${rank}` : "—"}
            </p>
          </div>
          {/* <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Ball</p>
            <p className="text-lg font-bold text-green-600">
              {loading ? "—" : profile?.all_score ?? 0}
            </p>
          </div> */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <ClipboardList className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Davomat</p>
            <p className="text-lg font-bold text-blue-600">
              {loading ? "—" : attendance != null ? `${attendance}%` : "—"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CheckCircle, Clock, XCircle } from "lucide-react";
import { attendanceApi, type AttendanceRecord } from "@/lib/api";
import { fmtDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const STATUS_CONFIG = {
  keldi: {
    label: "Keldi",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    badge: "default" as const,
  },
  kechikdi: {
    label: "Kechikdi",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    badge: "secondary" as const,
  },
  kelmadi: {
    label: "Kelmadi",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    badge: "destructive" as const,
  },
} as const;

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      try {
        const all = await attendanceApi.list();
        const mine = all.filter((a) => {
          const sid =
            typeof a.student === "object"
              ? a.student.id
              : (a as unknown as { student: number }).student;
          return sid === user!.id;
        });
        // Sort by date descending
        mine.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecords(mine);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const totalKeldi = records.filter((r) => r.status === "keldi").length;
  const totalKechikdi = records.filter((r) => r.status === "kechikdi").length;
  const totalKelmadi = records.filter((r) => r.status === "kelmadi").length;
  const present = totalKeldi + totalKechikdi;
  const attendancePct = records.length
    ? Math.round((present / records.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Davomat</h1>
        <p className="text-muted-foreground">Darslarga qatnovingiz tarixi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{attendancePct}%</p>
          <p className="text-xs text-muted-foreground mt-1">Umumiy davomat</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalKeldi}</p>
          <p className="text-xs text-muted-foreground mt-1">Keldi</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{totalKechikdi}</p>
          <p className="text-xs text-muted-foreground mt-1">Kechikdi</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{totalKelmadi}</p>
          <p className="text-xs text-muted-foreground mt-1">Kelmadi</p>
        </Card>
      </div>

      {/* Timeline */}
      {loading ? (
        <p className="text-muted-foreground animate-pulse">Yuklanmoqda...</p>
      ) : records.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarCheck className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">Ma&apos;lumot yo&apos;q</h3>
          <p className="text-muted-foreground text-sm">
            Hozircha davomat yozuvlari topilmadi.
          </p>
        </Card>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-0">
            {records.map((record) => {
              const cfg = STATUS_CONFIG[record.status];
              const Icon = cfg.icon;

              const dotBorder =
                record.status === "keldi"
                  ? "border-green-500 bg-green-50"
                  : record.status === "kechikdi"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-red-500 bg-red-50";

              const cardBg =
                record.status === "keldi"
                  ? "bg-green-50/40 border-green-200"
                  : record.status === "kechikdi"
                  ? "bg-yellow-50/40 border-yellow-200"
                  : "bg-red-50/30 border-red-200";

              return (
                <div
                  key={record.id}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {/* Dot */}
                  <div className="relative z-10 shrink-0 mt-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${dotBorder}`}
                    >
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 rounded-xl border p-4 flex items-center justify-between ${cardBg}`}
                  >
                    <div>
                      <p className="font-semibold">{fmtDate(record.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.group && typeof record.group === "object"
                          ? record.group.name
                          : ""}
                        {record.time ? ` · ${record.time.slice(0, 5)}` : ""}
                      </p>
                    </div>
                    <Badge variant={cfg.badge}>{cfg.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

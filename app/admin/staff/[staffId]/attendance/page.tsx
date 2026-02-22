"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  BookOpen,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  workersApi,
  teacherLogsApi,
  type UserProfile,
  type TeacherLog,
  type TeacherLogStat,
  type TeacherLogStatus,
} from "@/lib/api";
import { fmtDateFull } from "@/lib/utils";

type StatusFilter = "all" | TeacherLogStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Hammasi" },
  { value: "dars_otdi", label: "Dars o'tdi" },
  { value: "orin_bosdi", label: "O'rin bosdi" },
  { value: "dars_otmadi", label: "Dars o'tmadi" },
];

function StatusBadge({ status, display }: { status: TeacherLogStatus; display: string }) {
  if (status === "dars_otdi")
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1 font-medium">
        <CheckCircle2 className="w-3 h-3" />
        {display}
      </Badge>
    );
  if (status === "dars_otmadi")
    return (
      <Badge className="bg-red-50 text-red-700 border border-red-200 gap-1 font-medium">
        <XCircle className="w-3 h-3" />
        {display}
      </Badge>
    );
  return (
    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 gap-1 font-medium">
      <RefreshCw className="w-3 h-3" />
      {display}
    </Badge>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}

export default function StaffAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const staffId = Number(params.staffId);

  const [staff, setStaff] = useState<UserProfile | null>(null);
  const [teacherLogs, setTeacherLogs] = useState<TeacherLog[]>([]);
  const [teacherStat, setTeacherStat] = useState<TeacherLogStat | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffData, tLogs, tStat] = await Promise.all([
        workersApi.get(staffId),
        teacherLogsApi.list({ teacher_id: staffId }),
        teacherLogsApi.stat({ teacher_id: staffId }),
      ]);
      setStaff(staffData);
      setTeacherLogs(tLogs);
      setTeacherStat(tStat);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staffId) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  const filteredLogs = useMemo(() => {
    if (statusFilter === "all") return teacherLogs;
    return teacherLogs.filter((l) => l.status === statusFilter);
  }, [teacherLogs, statusFilter]);

  // Group logs by date for timeline view (newest first)
  const groupedByDate = useMemo(() => {
    const map = new Map<string, TeacherLog[]>();
    for (const log of filteredLogs) {
      const existing = map.get(log.date) ?? [];
      map.set(log.date, [...existing, log]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [filteredLogs]);

  if (loading && !staff) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!loading && !staff) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold">Xodim topilmadi</h2>
          <Button onClick={() => router.push("/admin/staff")} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga qaytish
          </Button>
        </div>
      </div>
    );
  }

  const staffName = staff
    ? `${staff.first_name} ${staff.last_name}`.trim() || staff.username
    : "";

  return (
    <div className="md:px-2 space-y-5 pb-10">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/staff")}
        className="flex items-center gap-2 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Xodimlar</span>
      </Button>

      {/* Profile header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold">{staffName}</h1>
          <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
            {staff?.phone && <span>{staff.phone}</span>}
            {staff?.phone && staff?.username && <span>·</span>}
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{staff?.username}</span>
            {staff?.is_active ? (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">Faol</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Nofaol</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {teacherStat && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Jami darslar" value={teacherStat.total_lessons} />
          <StatCard label="Dars o'tdi" value={teacherStat.dars_otdi} />
          <StatCard label="Dars o'tmadi" value={teacherStat.dars_otmadi} />
        </div>
      )}

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => {
          const count =
            opt.value === "all"
              ? teacherLogs.length
              : teacherLogs.filter((l) => l.status === opt.value).length;
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === opt.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {opt.label}
              <span className="ml-1.5 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Logs */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="h-[68px] animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card className="py-16 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm font-medium">Dars loglari topilmadi</p>
          {statusFilter !== "all" && (
            <p className="text-xs text-muted-foreground mt-1">
              Boshqa status bo&apos;yicha filtrlashni sinab ko&apos;ring
            </p>
          )}
        </Card>
      ) : (
        <div className="space-y-5">
          {groupedByDate.map(([date, logs]) => (
            <div key={date} className="space-y-2">
              {/* Date header */}
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-full border bg-background">
                  {fmtDateFull(date + "T00:00:00")}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Log cards for this date */}
              {logs.map((log) => (
                <Card
                  key={log.id}
                  className="p-4 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-semibold text-sm truncate">{log.group_name}</p>
                    <p className="text-xs text-muted-foreground">{log.group_subject}</p>
                    {log.replaced_for_name && (
                      <p className="text-xs text-blue-600 font-medium">
                        O&apos;rniga: {log.replaced_for_name}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={log.status} display={log.status_display} />
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
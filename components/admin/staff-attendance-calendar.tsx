"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle,
  CheckCircle2,
  XCircle,
  UserX,
  TrendingUp,
  TrendingDown,
  BarChart2,
  List,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { uz } from "date-fns/locale";

interface ClassSession {
  id: string;
  staffId: string;
  staffName: string;
  groupName: string;
  date: string;
  time: string;
  status: "attended" | "absent" | "replaced";
  replacedBy?: string;
  replacedByName?: string;
}

interface StaffAttendanceCalendarProps {
  staffId: string;
  staffName: string;
  sessions: ClassSession[];
  onClose?: () => void;
}

type Filter = "all" | "attended" | "absent" | "replaced";

function StatusBadge({ status }: { status: string }) {
  if (status === "attended")
    return (
      <Badge className="bg-green-500 hover:bg-green-600 text-white gap-1">
        <CheckCircle className="w-3 h-3" /> Keldi
      </Badge>
    );
  if (status === "absent")
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" /> Kelmadi
      </Badge>
    );
  return (
    <Badge className="bg-blue-500 hover:bg-blue-600 text-white gap-1">
      <UserX className="w-3 h-3" /> Almashdi
    </Badge>
  );
}

const WEEK_DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export function StaffAttendanceCalendar({
  staffId,
  staffName,
  sessions,
}: StaffAttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const initials = staffName
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const monthSessions = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return sessions.filter((s) => {
      const d = new Date(s.date);
      if (d < monthStart || d > monthEnd) return false;
      if (s.staffId !== staffId && s.replacedBy !== staffId) return false;
      if (filter === "absent") return s.status === "absent";
      if (filter === "replaced") return s.status === "replaced";
      if (filter === "attended") return s.status === "attended";
      return true;
    });
  }, [sessions, currentMonth, staffId, filter]);

  const stats = useMemo(() => {
    const attended = monthSessions.filter((s) => s.status === "attended").length;
    const absent = monthSessions.filter((s) => s.status === "absent").length;
    const replaced = monthSessions.filter((s) => s.status === "replaced").length;
    const total = attended + absent + replaced;
    const rate = total > 0 ? ((attended / total) * 100).toFixed(1) : "0";
    return { attended, absent, replaced, total, rate };
  }, [monthSessions]);

  const selectedDaySessions = useMemo(() => {
    if (!selectedDate) return [];
    return monthSessions.filter((s) => isSameDay(new Date(s.date), selectedDate));
  }, [selectedDate, monthSessions]);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, ClassSession[]>();
    monthSessions.forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    });
    return map;
  }, [monthSessions]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getDayStatus = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    const ds = sessionsByDate.get(key) ?? [];
    if (!ds.length) return null;
    return {
      total: ds.length,
      attended: ds.filter((s) => s.status === "attended").length,
      absent: ds.filter((s) => s.status === "absent").length,
      replaced: ds.filter((s) => s.status === "replaced").length,
    };
  };

  const FilterBar = () => (
    <div className="flex flex-wrap gap-2 mb-5">
      {(
        [
          { key: "all" as Filter, label: "Hammasi" },
          { key: "attended" as Filter, label: "Keldi", active: "bg-green-500 text-white" },
          { key: "absent" as Filter, label: "Kelmadi", active: "bg-red-500 text-white" },
          { key: "replaced" as Filter, label: "Almashdi", active: "bg-blue-500 text-white" },
        ]
      ).map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={[
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            filter === f.key
              ? (f.active ?? "bg-primary text-primary-foreground") + " shadow"
              : "bg-muted hover:bg-muted/80 text-muted-foreground",
          ].join(" ")}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  const CalendarGrid = () => (
    <>
      <div className="flex items-center justify-between mb-4 bg-muted/40 px-3 py-2.5 rounded-xl">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-semibold text-sm capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: uz })}
        </span>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const dayStatus = getDayStatus(day);
          const inMonth = isSameMonth(day, currentMonth);
          const isSelected = !!selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={idx}
              onClick={() => inMonth && setSelectedDate(day)}
              disabled={!inMonth || !dayStatus}
              className={[
                "flex flex-col items-center justify-center rounded-xl py-1.5 md:py-2 transition-all duration-150 select-none aspect-square",
                inMonth ? "text-foreground" : "text-muted-foreground/30 pointer-events-none",
                isSelected ? "bg-primary text-primary-foreground shadow-md scale-105" : "",
                !isSelected && isToday ? "ring-2 ring-primary/60 bg-primary/5" : "",
                !isSelected && !isToday && dayStatus && inMonth ? "hover:bg-muted cursor-pointer" : "",
                !dayStatus && inMonth ? "opacity-40 cursor-default" : "",
              ].join(" ")}
            >
              <span className="text-xs md:text-sm font-semibold leading-none">{format(day, "d")}</span>
              {dayStatus && inMonth && (
                <div className="flex gap-0.5 mt-1">
                  {dayStatus.attended > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-green-300" : "bg-green-500"}`} />}
                  {dayStatus.absent > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-red-300" : "bg-red-500"}`} />}
                  {dayStatus.replaced > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-300" : "bg-blue-500"}`} />}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );

  const DayDetail = () =>
    selectedDate ? (
      <div>
        <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4" />
          {format(selectedDate, "d MMMM, EEEE", { locale: uz })}
        </p>
        {selectedDaySessions.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center text-sm text-muted-foreground gap-2">
            <CalendarIcon className="w-8 h-8 opacity-30" />
            Ushbu kunda yozuv yo'q
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDaySessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{s.groupName || "—"}</p>
                  {s.time && <p className="text-xs text-muted-foreground mt-0.5">{s.time}</p>}
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    ) : (
      <div className="flex flex-col items-center py-14 text-center text-sm text-muted-foreground gap-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <CalendarIcon className="w-6 h-6 text-primary" />
        </div>
        Tafsilot ko'rish uchun kunni tanlang
      </div>
    );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Davomat</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Xodim ish davomati — {format(currentMonth, "MMMM yyyy", { locale: uz })}
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-base leading-snug truncate">{staffName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(currentMonth, "MMMM yyyy", { locale: uz })} · Jami {stats.total} yozuv
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <Badge className={parseFloat(stats.rate) >= 80 ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
              {stats.rate}%
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.attended}</p>
            <p className="text-xs text-muted-foreground">Keldi</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-xs text-muted-foreground">Kelmadi</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.replaced}</p>
            <p className="text-xs text-muted-foreground">Almashdi</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {parseFloat(stats.rate) >= 80 ? (
              <TrendingUp className="w-4 h-4 text-primary" />
            ) : (
              <TrendingDown className="w-4 h-4 text-primary" />
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{stats.rate}%</p>
            <p className="text-xs text-muted-foreground">Davomat</p>
          </div>
        </div>
      </div>

      <div className="block lg:hidden">
        <Tabs defaultValue="calendar">
          <TabsList className="grid grid-cols-2 w-full h-11 mb-4">
            <TabsTrigger value="calendar" className="gap-1.5 text-sm">
              <CalendarIcon className="w-4 h-4" /> Kalendar
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5 text-sm">
              <List className="w-4 h-4" /> Ro&apos;yxat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-sm">Kalendar ko&apos;rinish</span>
              </div>
              <div className="p-4">
                <FilterBar />
                <CalendarGrid />
              </div>
            </div>
            {selectedDate && (
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Kun tafsiloti</span>
                </div>
                <div className="p-4">
                  <DayDetail />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "all" as Filter, label: "Hammasi" },
                  { key: "attended" as Filter, label: "Keldi", active: "bg-green-500 text-white" },
                  { key: "absent" as Filter, label: "Kelmadi", active: "bg-red-500 text-white" },
                  { key: "replaced" as Filter, label: "Almashdi", active: "bg-blue-500 text-white" },
                ]
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    filter === f.key
                      ? (f.active ?? "bg-primary text-primary-foreground") + " shadow"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground",
                  ].join(" ")}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {monthSessions.length === 0 ? (
              <div className="rounded-xl border bg-card p-10 flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
                <BarChart2 className="w-8 h-8 opacity-30" />
                Ma&apos;lumot topilmadi
              </div>
            ) : (
              monthSessions.map((s) => (
                <div key={s.id} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.groupName || "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(s.date), "d MMM, EEEE", { locale: uz })}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden lg:grid grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6">
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">Kalendar ko&apos;rinish</span>
          </div>
          <div className="p-5">
            <FilterBar />
            <CalendarGrid />
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden self-start sticky top-6">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">Kun tafsiloti</span>
          </div>
          <div className="p-5">
            <DayDetail />
          </div>
        </div>
      </div>
    </div>
  );
}

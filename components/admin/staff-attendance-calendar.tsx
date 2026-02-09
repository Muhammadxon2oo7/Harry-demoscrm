"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  UserX,
  Filter,
  TrendingUp,
  TrendingDown,
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
  getDay,
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

export function StaffAttendanceCalendar({
  staffId,
  staffName,
  sessions,
}: StaffAttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<"all" | "absent" | "replaced" | "attended">("all");

  // Filter sessions by current month and staff
  const monthSessions = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      const isInMonth = sessionDate >= monthStart && sessionDate <= monthEnd;
      const isForStaff = session.staffId === staffId || session.replacedBy === staffId;
      
      if (!isInMonth || !isForStaff) return false;
      
      if (filter === "absent" && session.status !== "absent") return false;
      if (filter === "replaced" && session.status !== "replaced") return false;
      if (filter === "attended" && session.status !== "attended") return false;
      
      return true;
    });
  }, [sessions, currentMonth, staffId, filter]);

  // Calculate monthly statistics
  const stats = useMemo(() => {
    const attended = monthSessions.filter((s) => s.status === "attended").length;
    const absent = monthSessions.filter((s) => s.status === "absent").length;
    const replaced = monthSessions.filter((s) => s.status === "replaced").length;
    const total = attended + absent + replaced;
    const attendanceRate = total > 0 ? ((attended / total) * 100).toFixed(1) : "0";
    
    return { attended, absent, replaced, total, attendanceRate };
  }, [monthSessions]);

  // Get sessions for selected date
  const selectedDaySessions = useMemo(() => {
    if (!selectedDate) return [];
    return monthSessions.filter((session) =>
      isSameDay(new Date(session.date), selectedDate)
    );
  }, [selectedDate, monthSessions]);

  // Get sessions grouped by date
  const sessionsByDate = useMemo(() => {
    const grouped = new Map<string, ClassSession[]>();
    monthSessions.forEach((session) => {
      const dateKey = session.date;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(session);
    });
    return grouped;
  }, [monthSessions]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (day: Date) => {
    if (!isSameMonth(day, currentMonth)) return;
    setSelectedDate(day);
  };

  const getDayStatus = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const daySessions = sessionsByDate.get(dateKey) || [];
    
    if (daySessions.length === 0) return null;
    
    const attended = daySessions.filter((s) => s.status === "attended").length;
    const absent = daySessions.filter((s) => s.status === "absent").length;
    const replaced = daySessions.filter((s) => s.status === "replaced").length;
    
    return { total: daySessions.length, attended, absent, replaced };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "attended":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> O'tdi
          </Badge>
        );
      case "absent":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Kelmadi
          </Badge>
        );
      case "replaced":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
            <UserX className="w-3 h-3" /> Almashdi
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold">{staffName}</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {format(currentMonth, "MMMM yyyy", { locale: uz })} - Davomat kalendari
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">O'tgan</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {stats.attended}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Kelmagan</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600">
                {stats.absent}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">O'rnini bosgan</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {stats.replaced}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <UserX className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Davomat</p>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {stats.attendanceRate}%
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-full flex items-center justify-center">
              {parseFloat(stats.attendanceRate) >= 80 ? (
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              ) : (
                <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile: Tabs View */}
      <div className="md:hidden">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="calendar" className="text-sm font-medium">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Kalendar
            </TabsTrigger>
            <TabsTrigger value="list" className="text-sm font-medium">
              Ro'yxat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4 mt-4">
            {/* Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className="h-9 whitespace-nowrap"
                >
                  Hammasi
                </Button>
                <Button
                  size="sm"
                  variant={filter === "absent" ? "destructive" : "outline"}
                  onClick={() => setFilter("absent")}
                  className="h-9 whitespace-nowrap"
                >
                  Kelmagan
                </Button>
                <Button
                  size="sm"
                  variant={filter === "replaced" ? "default" : "outline"}
                  onClick={() => setFilter("replaced")}
                  className={`h-9 whitespace-nowrap ${filter === "replaced" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                >
                  O'rnini bosgan
                </Button>
                <Button
                  size="sm"
                  variant={filter === "attended" ? "default" : "outline"}
                  onClick={() => setFilter("attended")}
                  className={`h-9 whitespace-nowrap ${filter === "attended" ? "bg-green-500 hover:bg-green-600" : ""}`}
                >
                  Kelgan
                </Button>
              </div>
            </div>

            {/* Calendar */}
            <Card className="p-4 shadow-sm">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4 bg-muted/30 p-3 rounded-lg">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={goToPreviousMonth}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="font-semibold text-base">
                  {format(currentMonth, "MMMM yyyy", { locale: uz })}
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={goToNextMonth}
                  className="h-9 w-9"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const dayStatus = getDayStatus(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(day)}
                      disabled={!isCurrentMonth || !dayStatus}
                      className={`
                        relative aspect-square p-2 rounded-lg text-sm transition-all duration-200
                        ${isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"}
                        ${isSelected ? "bg-primary text-primary-foreground ring-2 ring-primary shadow-md" : ""}
                        ${isToday && !isSelected ? "ring-1 ring-primary" : ""}
                        ${dayStatus && isCurrentMonth ? "hover:bg-muted cursor-pointer active:scale-95" : "cursor-default"}
                        ${!dayStatus && isCurrentMonth ? "opacity-50" : ""}
                      `}
                    >
                      <div className="text-center font-semibold mb-1">{format(day, "d")}</div>
                      {dayStatus && isCurrentMonth && (
                        <div className="flex items-center justify-center gap-0.5">
                          {dayStatus.attended > 0 && (
                            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-green-300" : "bg-green-500"}`} />
                          )}
                          {dayStatus.absent > 0 && (
                            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-red-300" : "bg-red-500"}`} />
                          )}
                          {dayStatus.replaced > 0 && (
                            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-300" : "bg-blue-500"}`} />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Selected Day Details */}
            {selectedDate && selectedDaySessions.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, "d MMMM, EEEE", { locale: uz })}
                </h3>
                <div className="space-y-3">
                  {selectedDaySessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 bg-muted/50 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{session.groupName}</span>
                        {getStatusBadge(session.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.time}
                      </p>
                      {session.status === "absent" && session.replacedByName && (
                        <p className="text-xs text-muted-foreground">
                          O'rnini bosgan: <span className="font-medium">{session.replacedByName}</span>
                        </p>
                      )}
                      {session.status === "replaced" && session.replacedByName && (
                        <p className="text-xs text-muted-foreground">
                          O'rnini bosgan: <span className="font-medium">{session.replacedByName}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="list" className="space-y-3">
            {monthSessions.length === 0 ? (
              <Card className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Ma'lumot topilmadi</p>
              </Card>
            ) : (
              monthSessions.map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{session.groupName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.date), "d MMM, EEEE", { locale: uz })}
                      </p>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{session.time}</p>
                  {session.status === "absent" && session.replacedByName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      O'rnini bosgan: <span className="font-medium">{session.replacedByName}</span>
                    </p>
                  )}
                  {session.status === "replaced" && session.replacedByName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      O'rnini bosgan: <span className="font-medium">{session.replacedByName}</span>
                    </p>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Split View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_35%] gap-6">
          {/* Calendar */}
          <div>
            <Card className="p-6 shadow-sm">
              {/* Filter */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                    className="h-9"
                  >
                    Hammasi
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === "absent" ? "destructive" : "outline"}
                    onClick={() => setFilter("absent")}
                    className="h-9"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Kelmagan
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === "replaced" ? "default" : "outline"}
                    onClick={() => setFilter("replaced")}
                    className={`h-9 ${filter === "replaced" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    O'rnini bosgan
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === "attended" ? "default" : "outline"}
                    onClick={() => setFilter("attended")}
                    className={`h-9 ${filter === "attended" ? "bg-green-500 hover:bg-green-600" : ""}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Kelgan
                  </Button>
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6 bg-muted/30 p-3 rounded-lg">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={goToPreviousMonth}
                  className="hover:bg-primary/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="font-semibold text-lg">
                  {format(currentMonth, "MMMM yyyy", { locale: uz })}
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={goToNextMonth}
                  className="hover:bg-primary/10"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-2 mb-3 px-1">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-2 px-1">
                {calendarDays.map((day, idx) => {
                  const dayStatus = getDayStatus(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(day)}
                      disabled={!isCurrentMonth || !dayStatus}
                      className={`
                        relative aspect-square p-3 rounded-xl transition-all duration-200
                        ${isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"}
                        ${isSelected ? "bg-primary text-primary-foreground ring-2 ring-primary shadow-lg scale-105" : ""}
                        ${isToday && !isSelected ? "ring-2 ring-primary/50" : ""}
                        ${dayStatus && isCurrentMonth ? "hover:bg-muted cursor-pointer hover:scale-105 hover:shadow-md" : "cursor-default"}
                        ${!dayStatus && isCurrentMonth ? "opacity-50" : ""}
                      `}
                    >
                      <div className="text-center font-semibold mb-2">
                        {format(day, "d")}
                      </div>
                      {dayStatus && isCurrentMonth && (
                        <>
                          <div className={`text-sm font-bold text-center mb-2 ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                            {dayStatus.total}
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            {dayStatus.attended > 0 && (
                              <div
                                className={`h-2 rounded-full transition-all ${isSelected ? "bg-green-300" : "bg-green-500"}`}
                                style={{ width: `${(dayStatus.attended / dayStatus.total) * 100}%` }}
                              />
                            )}
                            {dayStatus.absent > 0 && (
                              <div
                                className={`h-2 rounded-full transition-all ${isSelected ? "bg-red-300" : "bg-red-500"}`}
                                style={{ width: `${(dayStatus.absent / dayStatus.total) * 100}%` }}
                              />
                            )}
                            {dayStatus.replaced > 0 && (
                              <div
                                className={`h-2 rounded-full transition-all ${isSelected ? "bg-blue-300" : "bg-blue-500"}`}
                                style={{ width: `${(dayStatus.replaced / dayStatus.total) * 100}%` }}
                              />
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Selected Day Details */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6 shadow-sm">
              {selectedDate ? (
                <>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-primary">
                    <CalendarIcon className="w-5 h-5" />
                    {format(selectedDate, "d MMMM, EEEE", { locale: uz })}
                  </h3>
                  {selectedDaySessions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                        <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ushbu kunda dars yo'q
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedDaySessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-4 bg-muted/30 rounded-xl space-y-2 hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-primary/20"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-base">{session.groupName}</span>
                            {getStatusBadge(session.status)}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {session.time}
                          </p>
                          {session.status === "absent" && session.replacedByName && (
                            <p className="text-xs text-muted-foreground pt-2 border-t">
                              O'rnini bosgan:{" "}
                              <span className="font-medium text-blue-600">
                                {session.replacedByName}
                              </span>
                            </p>
                          )}
                          {session.status === "replaced" && session.replacedByName && (
                            <p className="text-xs text-muted-foreground pt-2 border-t">
                              {session.replacedByName} ning o'rnini bosgan
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <CalendarIcon className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tafsilotlarni ko'rish uchun kunni tanlang
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

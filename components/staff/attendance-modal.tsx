"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Check, Clock, AlertCircle, UserCheck, CalendarIcon, List } from "lucide-react";
import { format, isBefore, isAfter, startOfDay } from "date-fns";
import { attendanceApi, type AttendanceRecord } from "@/lib/api";

interface Props {
  groupId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceModal({ groupId, isOpen, onClose }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(selectedDate);
  const isTodayDate = selectedDay.getTime() === today.getTime();
  const isPastDate = isBefore(selectedDay, today);
  const isFutureDate = isAfter(selectedDay, today);
  const isEditable = isTodayDate;
  const canCreate = isTodayDate;

  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    if (isOpen) {
      loadAttendance();
    }
  }, [selectedDate, isOpen]);
  useEffect(() => {
  setActiveTab("list");
}, [selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const all = await attendanceApi.list();
      const data = all.filter(
        (a) => (typeof a.group === "object" ? a.group.id : a.group) === groupId && a.date === formattedDate
      );
      setAttendances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttendance = async () => {
    if (!canCreate) return;
    setLoading(true);
    try {
      const data = await attendanceApi.bulkCreate(groupId);
      const filtered = data.filter((a) => a.date === formattedDate);
      setAttendances(filtered);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    attendanceId: number,
    status: "keldi" | "kechikdi" | "kelmadi"
  ) => {
    if (!isEditable) return;
    setUpdating(attendanceId);
    try {
      const updated = await attendanceApi.updateStatus(attendanceId, status);
      setAttendances((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Desktop: Markaziy modal */}
      <div className="hidden md:flex fixed h-full inset-0 bg-black/50 items-center justify-center z-50 p-4">
        <div className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-row">
          {/* Kalendar */}
          <div className="p-6 border-r bg-muted/50 w-80 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Sanani tanlang</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{ today: [new Date()] }}
              modifiersStyles={{
                today: {
                  border: "2px solid",
                  borderColor: "hsl(var(--primary))",
                  borderRadius: "8px",
                },
              }}
              disabled={loading}
            />
            {!isTodayDate && (
              <p className="mt-4 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {isPastDate ? "O‘tgan" : "Kelajak"} — faqat ko‘rish
              </p>
            )}
          </div>

          {/* Ro'yxat */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Davomat</h2>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, "dd MMMM, yyyy")}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderAttendanceList()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobil: Bottom Sheet + Tabs */}
      <div className="md:hidden fixed inset-0 h-full bg-black/50 z-50 flex flex-col justify-end">
        <div
          className="bg-card rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3">
            <div className="w-12 h-1 bg-muted rounded-full" />
          </div>

          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold">Davomat</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <Tabs
  value={activeTab}
  onValueChange={(val) => setActiveTab(val as "list" | "calendar")}
  className="flex-1 flex flex-col"
>
            <TabsList className="grid w-full grid-cols-2 h-11 rounded-none">
              <TabsTrigger value="list" className="text-xs">
                <List className="w-4 h-4 mr-1.5" /> Ro‘yxat
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs">
                <CalendarIcon className="w-4 h-4 mr-1.5" /> Sana
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
          <TabsContent value="list" className="flex-1 overflow-y-auto p-4 mt-0 flex-col max-h-125">

            
              <div className="mb-3 text-center">
                <p className="text-sm font-medium">{format(selectedDate, "dd MMMM, yyyy")}</p>
                {!isTodayDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {isPastDate ? "O‘tgan" : "Kelajak"} — faqat ko‘rish
                  </p>
                )}
              </div>
              {renderAttendanceList()}
            </TabsContent>

            <TabsContent value="calendar" className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border mx-auto"
                modifiers={{ today: [new Date()] }}
                modifiersStyles={{
                  today: {
                    border: "2px solid",
                    borderColor: "hsl(var(--primary))",
                    borderRadius: "8px",
                  },
                }}
                disabled={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );

  function renderAttendanceList() {
    if (loading) {
      return <p className="text-center text-muted-foreground py-8">Yuklanmoqda...</p>;
    }

    if (attendances?.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium">Davomat yo‘q</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isPastDate || isFutureDate
              ? "Bu kun uchun davomat mavjud emas"
              : "Hali yaratilmagan"}
          </p>
          {canCreate && (
            <Button
              onClick={handleStartAttendance}
              disabled={loading}
              size="sm"
              className="mt-4 h-9 text-xs"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Yaratish
            </Button>
          )}
        </div>
      );
    }

    return (
      
         <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pb-10 md:pb-0">
        {attendances.map((att) => (
          <Card key={att.id} className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {att.student.first_name} {att.student.last_name}
                </p>
                <p className="text-xs text-muted-foreground">@{att.student.username}</p>
              </div>
              <div className="flex gap-1">
                {(["keldi", "kechikdi", "kelmadi"] as const).map((status) => {
                  const isActive = att.status === status;
                  const isUpdating = updating === att.id;

                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(att.id, status)}
                      disabled={!isEditable || isUpdating || isActive}
                      className={`p-1.5 rounded-lg transition-all text-xs ${
                        isActive
                          ? status === "keldi"
                            ? "bg-green-100 text-green-700"
                            : status === "kechikdi"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                          : isEditable
                          ? "hover:bg-muted"
                          : "opacity-40"
                      }`}
                    >
                      {status === "keldi" && <Check className="w-4 h-4" />}
                      {status === "kechikdi" && <Clock className="w-4 h-4" />}
                      {status === "kelmadi" && <X className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
}
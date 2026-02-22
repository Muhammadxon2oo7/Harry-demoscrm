"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, AlertCircle, Trophy, CalendarIcon, List } from "lucide-react";
import { format, isBefore, isAfter, startOfDay } from "date-fns";
import { scoresApi, studentsApi, type ScoreRecord } from "@/lib/api";
import { toast } from "@/lib/toast";

interface Props {
  groupId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ScoreModal({ groupId, isOpen, onClose }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  // YANGI: Tabni boshqarish
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");

  const today = startOfDay(new Date());
  const selectedDay = startOfDay(selectedDate);
  const isTodayDate = selectedDay.getTime() === today.getTime();
  const isPastDate = isBefore(selectedDay, today);
  const isFutureDate = isAfter(selectedDay, today);
  const isEditable = isTodayDate;
  const canCreate = isTodayDate;

  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  // YANGI: Sana o‘zgarganda → list tabiga o‘t
  useEffect(() => {
    setActiveTab("list");
  }, [selectedDate]);

  useEffect(() => {
    if (isOpen) {
      loadScores();
    }
  }, [selectedDate, isOpen]);

  const loadScores = async () => {
    setLoading(true);
    try {
      const all = await scoresApi.list();
      const data = all.filter(
        (s) => (typeof s.group === "object" ? s.group.id : s.group) === groupId && s.date === formattedDate
      );
      setScores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScore = async () => {
    if (!canCreate) return;
    setLoading(true);
    try {
      const students = await studentsApi.list(groupId);
      const created = await Promise.all(
        students.map((st) => scoresApi.create(st.id, groupId, 0))
      );
      setScores(created);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleScoreChange = async (scoreId: number, value: string) => {
  if (!isEditable) return;
  const num = parseInt(value);
  if (isNaN(num) || num < 0 || num > 100) return; // Maks 100

  setUpdating(scoreId);
  try {
    const updated = await scoresApi.update(scoreId, num);
    setScores((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setUpdating(null);
  }
};

  if (!isOpen) return null;

  return (
    <>
      {/* Desktop: Markaziy modal */}
      <div className="hidden md:flex fixed inset-0 h-full bg-black/50 items-center justify-center z-50 p-4">
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
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Baholash
                </h2>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, "dd MMMM, yyyy")}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderScoreList()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobil: Bottom Sheet + Tabs */}
      <div className="md:hidden fixed h-full inset-0 bg-black/50 z-50 flex flex-col justify-end">
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
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Baholash
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs — boshqariladigan */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "list" | "calendar")} className="flex-1 flex flex-col">
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
              {renderScoreList()}
            </TabsContent>

            <TabsContent value="calendar" className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    // useEffect avtomatik "list" ga o‘tadi
                  }
                }}
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

  function renderScoreList() {
    if (loading) {
      return <p className="text-center text-muted-foreground py-8">Yuklanmoqda...</p>;
    }

    if (scores?.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium">Baho yo‘q</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isPastDate || isFutureDate
              ? "Bu kun uchun baho mavjud emas"
              : "Hali yaratilmagan"}
          </p>
          {canCreate && (
            <Button
              onClick={handleStartScore}
              disabled={loading}
              size="sm"
              className="mt-4 h-9 text-xs"
            >
              <Trophy className="w-3.5 h-3.5 mr-1.5" /> Boshlash
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pb-10 md:pb-0">
        {scores.map((score) => {
          const isUpdating = updating === score.id;
          const scoreValue = score.score ?? 0;

          return (
            <Card key={score.id} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {score.student.first_name} {score.student.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">@{score.student.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  
                  <Input
  type="number"
  min="0"
  max="100"
  value={scoreValue}
  onChange={(e) => handleScoreChange(score.id, e.target.value)}
  disabled={!isEditable || isUpdating}
  className={`w-16 h-9 text-center text-sm font-bold transition-all ${
    scoreValue >= 80
      ? "bg-green-100 text-green-700"
      : scoreValue >= 60
      ? "bg-yellow-100 text-yellow-700"
      : scoreValue >= 40
      ? "bg-orange-100 text-orange-700"
      : "bg-red-100 text-red-700"
  } ${!isEditable ? "opacity-50" : ""}`}
/>
<span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }
}
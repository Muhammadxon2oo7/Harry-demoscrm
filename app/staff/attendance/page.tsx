"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  groupsApi,
  studentsApi,
  attendanceApi,
  scoresApi,
  type Group,
  type UserProfile,
  type AttendanceRecord,
} from "@/lib/api";
import { Input } from "@/components/ui/input";

interface StudentRow {
  profile: UserProfile;
  attended: boolean | null;
  grade: string;
  attendanceId?: number;
}

const DAY_CODES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StaffAttendancePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [isClassTime, setIsClassTime] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [error, setError] = useState("");

  // Load groups on mount
  useEffect(() => {
    groupsApi.list().then(setGroups).catch(console.error);
  }, []);

  const checkClassTime = useCallback(
    (groupId: string) => {
      const group = groups.find((g) => String(g.id) === groupId);
      if (!group) return;

      const today = new Date();
      const todayCode = DAY_CODES[today.getDay()];
      const groupDays = group.days ? group.days.split(",").map((d) => d.trim()) : [];
      const isDayMatch = groupDays.includes(todayCode);

      const currentMins = today.getHours() * 60 + today.getMinutes();
      const parseMins = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + (m || 0);
      };
      const startMins = parseMins(group.start_time || "00:00");
      const endMins = parseMins(group.end_time || "23:59");
      const isTimeMatch = currentMins >= startMins - 15 && currentMins <= endMins + 15;

      setIsClassTime(isDayMatch && isTimeMatch);
    },
    [groups]
  );

  const handleGroupChange = async (groupId: string) => {
    setSelectedGroup(groupId);
    setStudentRows([]);
    setError("");
    if (!groupId) return;

    checkClassTime(groupId);

    setLoadingStudents(true);
    try {
      // bulk_create returns attendance records for today
      const records: AttendanceRecord[] = await attendanceApi.bulkCreate(Number(groupId));
      const students = await studentsApi.list(Number(groupId));

      const rows: StudentRow[] = students.map((s) => {
        const rec = records.find(
          (r) => (typeof r.student === "object" ? r.student.id : r.student) === s.id
        );
        let attended: boolean | null = null;
        if (rec) {
          if (rec.status === "keldi" || rec.status === "kechikdi") attended = true;
          else if (rec.status === "kelmadi") attended = false;
        }
        return {
          profile: s,
          attended,
          grade: "",
          attendanceId: rec?.id,
        };
      });
      setStudentRows(rows);
    } catch (err) {
      console.error(err);
      // Fallback: just load students without attendance records
      try {
        const students = await studentsApi.list(Number(groupId));
        setStudentRows(students.map((s) => ({ profile: s, attended: null, grade: "" })));
      } catch (e2) {
        console.error(e2);
        setError("O'quvchilarni yuklashda xatolik yuz berdi");
      }
    } finally {
      setLoadingStudents(false);
    }

    // re-check every minute
    const interval = setInterval(() => checkClassTime(groupId), 60000);
    return () => clearInterval(interval);
  };

  const handleAttendance = (studentId: number, attended: boolean) => {
    setStudentRows((prev) =>
      prev.map((r) => (r.profile.id === studentId ? { ...r, attended } : r))
    );
  };

  const handleGrade = (studentId: number, grade: string) => {
    setStudentRows((prev) =>
      prev.map((r) => (r.profile.id === studentId ? { ...r, grade } : r))
    );
  };

  const handleSave = async () => {
    const allMarked = studentRows.every((r) => r.attended !== null);
    if (!allMarked) {
      setError("Barcha o'quvchilarning davomatini belgilang!");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await Promise.all(
        studentRows.map(async (row) => {
          const status = row.attended ? "keldi" : "kelmadi";
          if (row.attendanceId) {
            await attendanceApi.updateStatus(row.attendanceId, status);
          } else {
            await attendanceApi.create(row.profile.id, Number(selectedGroup), status);
          }
          if (row.attended && row.grade) {
            const score = parseInt(row.grade, 10);
            if (!isNaN(score) && score > 0) {
              await scoresApi.create(row.profile.id, Number(selectedGroup), score);
            }
          }
        })
      );
      setSavedSuccessfully(true);
      setTimeout(() => setSavedSuccessfully(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const selectedGroupData = groups.find((g) => String(g.id) === selectedGroup);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Davomat va Baholar</h1>
        <p className="text-muted-foreground mt-2">
          Faqat dars vaqtida davomat va baho qo&apos;yish mumkin
        </p>
      </div>

      {/* Group Selection */}
      <Card className="p-6 mb-6">
        <Label className="mb-2 block">Guruhni tanlang</Label>
        <Select value={selectedGroup} onValueChange={handleGroupChange}>
          <SelectTrigger>
            <SelectValue placeholder="Guruhni tanlang" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={String(group.id)}>
                {group.name} — {group.subject_name} — {group.start_time?.slice(0, 5)}-{group.end_time?.slice(0, 5)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {selectedGroup && (
        <>
          {/* Class Time Alert */}
          {!isClassTime ? (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Dars vaqti emas! Davomat va baho qo&apos;yish faqat dars vaqtida mumkin.
                Ushbu guruh dars kunlari: {selectedGroupData?.days}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Dars vaqti! Davomat va baho qo&apos;yishingiz mumkin.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Students List */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">O&apos;quvchilar ro&apos;yxati</h2>
            {loadingStudents ? (
              <p className="text-muted-foreground">Yuklanmoqda...</p>
            ) : (
              <div className="space-y-4">
                {studentRows.map((row) => (
                  <div
                    key={row.profile.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {row.profile.first_name} {row.profile.last_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={row.attended === true ? "default" : "outline"}
                          onClick={() => handleAttendance(row.profile.id, true)}
                          disabled={!isClassTime}
                          className="gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Keldi
                        </Button>
                        <Button
                          size="sm"
                          variant={row.attended === false ? "destructive" : "outline"}
                          onClick={() => handleAttendance(row.profile.id, false)}
                          disabled={!isClassTime}
                          className="gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Kelmadi
                        </Button>
                      </div>

                      {/* Grade */}
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={row.grade}
                        onChange={(e) => handleGrade(row.profile.id, e.target.value)}
                        disabled={!isClassTime || row.attended !== true}
                        placeholder="Ball"
                        className="w-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            {savedSuccessfully && (
              <Alert className="flex-1 border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Ma&apos;lumotlar muvaffaqiyatli saqlandi!
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={handleSave} disabled={!isClassTime || saving} size="lg">
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

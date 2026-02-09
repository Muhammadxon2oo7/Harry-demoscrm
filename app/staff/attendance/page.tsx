"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Student {
  id: string;
  name: string;
  attended: boolean | null;
  grade: string;
}

export default function StaffAttendancePage() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isClassTime, setIsClassTime] = useState(false);
  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Abdullayev Vali", attended: null, grade: "" },
    { id: "2", name: "Karimov Ali", attended: null, grade: "" },
    { id: "3", name: "Toshmatov Sardor", attended: null, grade: "" },
    { id: "4", name: "Usmanova Nigora", attended: null, grade: "" },
    { id: "5", name: "Rahimov Akmal", attended: null, grade: "" },
  ]);
  const [homework, setHomework] = useState("");
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  const groups = [
    {
      id: "1",
      name: "Beginner A1",
      days: ["Dushanba", "Chorshanba", "Juma"],
      time: "14:00 - 16:00",
    },
    {
      id: "2",
      name: "Advanced C1",
      days: ["Seshanba", "Payshanba"],
      time: "16:00 - 18:00",
    },
  ];

  useEffect(() => {
    // Check if current time matches class time
    const checkClassTime = () => {
      if (!selectedGroup) return;
      
      const group = groups.find((g) => g.id === selectedGroup);
      if (!group) return;

      const today = new Date();
      const currentDay = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"][today.getDay()];
      const currentTime = today.getHours() * 60 + today.getMinutes();

      // For demo: Allow access if it's one of the class days
      const isDayMatch = group.days.includes(currentDay);
      
      // Parse time range (e.g., "14:00 - 16:00")
      const [startTime, endTime] = group.time.split(" - ").map((t) => {
        const [hours, minutes] = t.split(":").map(Number);
        return hours * 60 + minutes;
      });

      // Check if current time is within class time (with 15 min buffer)
      const isTimeMatch = currentTime >= startTime - 15 && currentTime <= endTime + 15;

      setIsClassTime(isDayMatch && isTimeMatch);
    };

    checkClassTime();
    const interval = setInterval(checkClassTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [selectedGroup]);

  const handleAttendance = (studentId: string, attended: boolean) => {
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, attended } : s
      )
    );
  };

  const handleGrade = (studentId: string, grade: string) => {
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, grade } : s
      )
    );
  };

  const handleSave = () => {
    const allAttendanceMarked = students.every((s) => s.attended !== null);
    
    if (!allAttendanceMarked) {
      alert("Barcha o'quvchilarning davomatini belgilang!");
      return;
    }

    // Save data (in real app, send to backend)
    console.log("Saved:", { students, homework });
    setSavedSuccessfully(true);
    setTimeout(() => setSavedSuccessfully(false), 3000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Davomat va Baholar</h1>
        <p className="text-muted-foreground mt-2">
          Faqat dars vaqtida davomat va baho qo'yish mumkin
        </p>
      </div>

      {/* Group Selection */}
      <Card className="p-6 mb-6">
        <Label className="mb-2 block">Guruhni tanlang</Label>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger>
            <SelectValue placeholder="Guruhni tanlang" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} - {group.days.join(", ")} - {group.time}
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
                Dars vaqti emas! Davomat va baho qo'yish faqat dars vaqtida mumkin.
                Ushbu guruh dars kunlari: {groups.find((g) => g.id === selectedGroup)?.days.join(", ")}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Dars vaqti! Davomat va baho qo'yishingiz mumkin.
              </AlertDescription>
            </Alert>
          )}

          {/* Students List */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">O'quvchilar ro'yxati</h2>
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                  </div>
                  
                  {/* Attendance */}
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={student.attended === true ? "default" : "outline"}
                        onClick={() => handleAttendance(student.id, true)}
                        disabled={!isClassTime}
                        className="gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Keldi
                      </Button>
                      <Button
                        size="sm"
                        variant={student.attended === false ? "destructive" : "outline"}
                        onClick={() => handleAttendance(student.id, false)}
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
                      value={student.grade}
                      onChange={(e) => handleGrade(student.id, e.target.value)}
                      disabled={!isClassTime || student.attended !== true}
                      placeholder="Ball"
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Homework */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Uyga vazifa
            </h2>
            <Textarea
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              disabled={!isClassTime}
              placeholder="Uyga vazifa matnini kiriting..."
              rows={5}
            />
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            {savedSuccessfully && (
              <Alert className="flex-1 border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Ma'lumotlar muvaffaqiyatli saqlandi!
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleSave}
              disabled={!isClassTime}
              size="lg"
            >
              Saqlash
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

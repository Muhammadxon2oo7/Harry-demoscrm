"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Test {
  id: string;
  title: string;
  subject: string;
  date: string;
  score?: number;
  status: "taken" | "available";
}

export default function StudentTestsPage() {
  const [testCode, setTestCode] = useState("");
  const [isEnterCodeOpen, setIsEnterCodeOpen] = useState(false);

  const tests: Test[] = [
    {
      id: "1",
      title: "Haftalik test #1",
      subject: "Ingliz tili",
      date: "2026-02-09",
      score: 85,
      status: "taken",
    },
    {
      id: "2",
      title: "Present Simple & Continuous",
      subject: "Ingliz tili",
      date: "2026-02-05",
      score: 92,
      status: "taken",
    },
    {
      id: "3",
      title: "Vocabulary Test",
      subject: "Ingliz tili",
      date: "2026-02-01",
      score: 88,
      status: "taken",
    },
  ];

  const handleEnterCode = () => {
    if (!testCode.trim()) {
      alert("Imtihon kodini kiriting!");
      return;
    }
    // In real app, validate code and redirect to test
    alert(`Imtihon kodi: ${testCode}\nImtihon topildi! Imtihonga o'tkazilmoqda...`);
    setTestCode("");
    setIsEnterCodeOpen(false);
  };

  const averageScore =
    tests.reduce((sum, test) => sum + (test.score || 0), 0) / tests.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Imtihonlar</h1>
          <p className="text-muted-foreground mt-2">
            Imtihonlar va natijalaringiz
          </p>
        </div>
        <Dialog open={isEnterCodeOpen} onOpenChange={setIsEnterCodeOpen}>
          <DialogTrigger asChild>
            <Button>
              <ClipboardList className="w-4 h-4 mr-2" />
              Imtihon topshirish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Imtihon kodini kiriting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Imtihon kodi</Label>
                <Input
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                  placeholder="ENG001"
                  className="text-lg font-mono uppercase"
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  O'qituvchi bergan 6 belgili kodni kiriting
                </p>
              </div>
              <Button onClick={handleEnterCode} className="w-full">
                Imtihonga kirish
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami imtihonlar</p>
              <h3 className="text-2xl font-bold mt-2">{tests.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">O'rtacha ball</p>
              <h3 className="text-2xl font-bold mt-2">{Math.round(averageScore)}%</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Eng yuqori ball</p>
              <h3 className="text-2xl font-bold mt-2">
                {Math.max(...tests.map((t) => t.score || 0))}%
              </h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tests List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Imtihon natijalari</h2>
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{test.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{test.subject}</span>
                    <span>•</span>
                    <span>{test.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{test.score}%</p>
                {test.score! >= 80 ? (
                  <Badge className="bg-green-500 mt-1">A'lo</Badge>
                ) : test.score! >= 60 ? (
                  <Badge className="bg-blue-500 mt-1">Yaxshi</Badge>
                ) : (
                  <Badge className="bg-yellow-500 mt-1">Qoniqarli</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

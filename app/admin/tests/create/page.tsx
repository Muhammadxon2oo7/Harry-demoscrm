"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Eye, Save,
  CheckCircle, XCircle, FileText,
} from "lucide-react";
import type { LocalTest } from "../page";

const STORAGE_KEY = "hpa_tests";

function loadTests(): LocalTest[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveTests(tests: LocalTest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const SUBJECTS = ["Ingliz tili", "Matematika", "Fizika", "Kimyo", "Biologiya", "Tarix", "Rus tili"];

interface Option { id: string; text: string; isCorrect: boolean; }
interface Question {
  id: string;
  type: "multiple-choice" | "open-ended";
  questionText: string;
  points: number;
  options?: Option[];
  correctAnswer?: string;
}

function AdminCreateTestPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [testName, setTestName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing test if editing
  useEffect(() => {
    if (!editId) return;
    const existing = loadTests().find((t) => t.id === editId);
    if (existing) {
      setTestName(existing.name);
      setSubject(existing.subject);
      setDescription(existing.description || "");
      setTimeLimit(existing.timeLimit ? String(existing.timeLimit) : "");
      setQuestions((existing.questions as Question[]) || []);
    }
  }, [editId]);

  const addQuestion = (type: "multiple-choice" | "open-ended") => {
    const q: Question = {
      id: Date.now().toString(),
      type,
      questionText: "",
      points: 1,
      ...(type === "multiple-choice"
        ? { options: [{ id: "1", text: "", isCorrect: false }, { id: "2", text: "", isCorrect: false }] }
        : { correctAnswer: "" }),
    };
    setQuestions((prev) => [...prev, q]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));

  const deleteQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  const addOption = (qId: string) =>
    setQuestions((prev) => prev.map((q) =>
      q.id === qId && q.type === "multiple-choice"
        ? { ...q, options: [...(q.options || []), { id: Date.now().toString(), text: "", isCorrect: false }] }
        : q
    ));

  const updateOption = (qId: string, optId: string, text: string) =>
    setQuestions((prev) => prev.map((q) =>
      q.id === qId ? { ...q, options: q.options?.map((o) => o.id === optId ? { ...o, text } : o) } : q
    ));

  const toggleCorrect = (qId: string, optId: string) =>
    setQuestions((prev) => prev.map((q) =>
      q.id === qId ? { ...q, options: q.options?.map((o) => o.id === optId ? { ...o, isCorrect: !o.isCorrect } : o) } : q
    ));

  const deleteOption = (qId: string, optId: string) =>
    setQuestions((prev) => prev.map((q) =>
      q.id === qId ? { ...q, options: q.options?.filter((o) => o.id !== optId) } : q
    ));

  const handleSave = (status: "draft" | "published") => {
    if (!testName.trim() || !subject) return;
    const all = loadTests();
    if (editId) {
      const updated = all.map((t) =>
        t.id === editId
          ? { ...t, name: testName, subject, description, timeLimit: timeLimit ? parseInt(timeLimit) : undefined, questions, questionCount: questions.length, status }
          : t
      );
      saveTests(updated);
    } else {
      const newTest: LocalTest = {
        id: Date.now().toString(),
        name: testName,
        subject,
        description,
        testCode: generateCode(),
        questionCount: questions.length,
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
        createdAt: new Date().toISOString().slice(0, 10),
        status,
        completedCount: 0,
        questions,
      };
      saveTests([newTest, ...all]);
    }
    router.push("/admin/tests");
  };

  if (showPreview) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowPreview(false)} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tahrirlashga qaytish
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave("draft")}>
              <Save className="w-4 h-4 mr-2" />Qoralama sifatida saqlash
            </Button>
            <Button onClick={() => handleSave("published")}>Nashr etish</Button>
          </div>
        </div>
        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold mb-2">{testName}</h1>
              <p className="text-muted-foreground">{subject}</p>
              {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
              {timeLimit && <Badge className="mt-3">Vaqt: {timeLimit} daqiqa</Badge>}
            </div>
            {questions.map((q, i) => (
              <div key={q.id} className="border-b pb-6 last:border-0">
                <div className="flex items-start gap-3 mb-4">
                  <span className="shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-lg font-medium mb-2">{q.questionText}</p>
                    <Badge variant="secondary">{q.points} ball</Badge>
                  </div>
                </div>
                {q.type === "multiple-choice" ? (
                  <div className="space-y-2 ml-11">
                    {q.options?.map((opt, oi) => (
                      <div key={opt.id} className={`p-3 rounded-lg border-2 ${opt.isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-border"}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{String.fromCharCode(97 + oi)})</span>
                          <span className="flex-1">{opt.text}</span>
                          {opt.isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-11 p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">To&apos;g&apos;ri javob:</p>
                    <p>{q.correctAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/tests")} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />Orqaga
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{editId ? "Testni tahrirlash" : "Yangi test yaratish"}</h1>
            <p className="text-sm text-muted-foreground">Test ma&apos;lumotlarini kiriting va savollar qo&apos;shing</p>
          </div>
        </div>
        {questions.length > 0 && (
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />Ko&apos;rib chiqish
          </Button>
        )}
      </div>

      {/* Test Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Test ma&apos;lumotlari</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Test nomi <span className="text-red-500">*</span></Label>
            <Input placeholder="Masalan: Ingliz tili — Haftalik test" value={testName} onChange={(e) => setTestName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Fan <span className="text-red-500">*</span></Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue placeholder="Fan tanlang" /></SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vaqt chegarasi (daqiqa)</Label>
            <Input type="number" placeholder="Ixtiyoriy" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Tavsif</Label>
            <Textarea placeholder="Test haqida qisqacha ma'lumot..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </div>
      </Card>

      {/* Questions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Savollar ({questions.length})</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addQuestion("multiple-choice")}>
              <Plus className="w-4 h-4 mr-2" />Test (a,b,c,d)
            </Button>
            <Button variant="outline" size="sm" onClick={() => addQuestion("open-ended")}>
              <Plus className="w-4 h-4 mr-2" />Yozma savol
            </Button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Hozircha savollar yo&apos;q</p>
            <Button onClick={() => addQuestion("multiple-choice")}>
              <Plus className="w-4 h-4 mr-2" />Birinchi savolni qo&apos;shish
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, i) => (
              <Card key={q.id} className="p-4 border-2">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-move shrink-0" />
                  <div className="flex-1 space-y-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Savol {i + 1}</span>
                          <Badge variant="secondary">{q.type === "multiple-choice" ? "Test" : "Yozma"}</Badge>
                        </div>
                        <Input
                          placeholder="Savol matnini kiriting..."
                          value={q.questionText}
                          onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0" onClick={() => deleteQuestion(q.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                    {/* Multiple choice options */}
                    {q.type === "multiple-choice" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Javob variantlari (to&apos;g&apos;ri javobni belgilang)</Label>
                        {q.options?.map((opt, oi) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <button
                              onClick={() => toggleCorrect(q.id, opt.id)}
                              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${opt.isCorrect ? "bg-green-500 border-green-500" : "border-muted-foreground hover:border-primary"}`}
                            >
                              {opt.isCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                            </button>
                            <span className="font-medium shrink-0">{String.fromCharCode(97 + oi)})</span>
                            <Input
                              placeholder="Javob varianti..."
                              value={opt.text}
                              onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                              className="flex-1"
                            />
                            {q.options && q.options.length > 2 && (
                              <Button variant="ghost" size="icon" onClick={() => deleteOption(q.id, opt.id)}>
                                <XCircle className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {q.options && q.options.length < 10 && (
                          <Button variant="outline" size="sm" onClick={() => addOption(q.id)} className="mt-1">
                            <Plus className="w-4 h-4 mr-2" />Javob qo&apos;shish
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Open-ended */}
                    {q.type === "open-ended" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">To&apos;g&apos;ri javob (namunaviy)</Label>
                        <Textarea
                          placeholder="To'g'ri javobni kiriting..."
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      {testName && subject && (
        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => handleSave("draft")}>
            <Save className="w-4 h-4 mr-2" />Qoralama sifatida saqlash
          </Button>
          <Button onClick={() => handleSave("published")}>Nashr etish</Button>
        </div>
      )}
    </div>
  );
}

export default function AdminCreateTestPage() {
  return (
    <Suspense fallback={null}>
      <AdminCreateTestPageContent />
    </Suspense>
  );
}

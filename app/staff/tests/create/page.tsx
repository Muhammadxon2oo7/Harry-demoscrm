"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  type: "multiple-choice" | "open-ended";
  questionText: string;
  points: number;
  options?: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer?: string;
}

export default function StaffCreateTestPage() {
  const router = useRouter();
  const [testName, setTestName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Mock subjects
  const subjects = [
    "Ingliz tili",
    "Matematika",
    "Fizika",
    "Kimyo",
    "Biologiya",
    "Tarix",
  ];

  const addQuestion = (type: "multiple-choice" | "open-ended") => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      questionText: "",
      points: 1,
      ...(type === "multiple-choice"
        ? {
            options: [
              { id: "1", text: "", isCorrect: false },
              { id: "2", text: "", isCorrect: false },
            ],
          }
        : { correctAnswer: "" }),
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "multiple-choice") {
          const newOption = {
            id: Date.now().toString(),
            text: "",
            isCorrect: false,
          };
          return {
            ...q,
            options: [...(q.options || []), newOption],
          };
        }
        return q;
      })
    );
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    text: string
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "multiple-choice") {
          return {
            ...q,
            options: q.options?.map((opt) =>
              opt.id === optionId ? { ...opt, text } : opt
            ),
          };
        }
        return q;
      })
    );
  };

  const toggleCorrectAnswer = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "multiple-choice") {
          return {
            ...q,
            options: q.options?.map((opt) =>
              opt.id === optionId
                ? { ...opt, isCorrect: !opt.isCorrect }
                : opt
            ),
          };
        }
        return q;
      })
    );
  };

  const deleteOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "multiple-choice") {
          return {
            ...q,
            options: q.options?.filter((opt) => opt.id !== optionId),
          };
        }
        return q;
      })
    );
  };

  const generateTestCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSave = (status: "draft" | "published") => {
    // TODO: Save to backend
    console.log({
      testName,
      subject,
      description,
      timeLimit: timeLimit ? parseInt(timeLimit) : null,
      testCode: generateTestCode(),
      questions,
      status,
    });
    router.push("/staff/tests");
  };

  if (showPreview) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setShowPreview(false)}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tahrirlashga qaytish
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave("draft")}>
              <Save className="w-4 h-4 mr-2" />
              Qoralama sifatida saqlash
            </Button>
            <Button onClick={() => handleSave("published")}>
              Nashr etish
            </Button>
          </div>
        </div>

        <Card className="p-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold mb-2">{testName}</h1>
              <p className="text-muted-foreground">{subject}</p>
              {description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {description}
                </p>
              )}
              {timeLimit && (
                <Badge className="mt-3">Vaqt: {timeLimit} daqiqa</Badge>
              )}
            </div>

            {questions.map((question, index) => (
              <div key={question.id} className="border-b pb-6 last:border-0">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg font-medium mb-2">
                      {question.questionText}
                    </p>
                    <Badge variant="secondary">{question.points} ball</Badge>
                  </div>
                </div>

                {question.type === "multiple-choice" ? (
                  <div className="space-y-2 ml-11">
                    {question.options?.map((option, optIndex) => (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border-2 ${
                          option.isCorrect
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {String.fromCharCode(97 + optIndex)})
                          </span>
                          <span className="flex-1">{option.text}</span>
                          {option.isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-11">
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-2">
                        To'g'ri javob:
                      </p>
                      <p>{question.correctAnswer}</p>
                    </div>
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
          <Button
            variant="ghost"
            onClick={() => router.push("/staff/tests")}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Yangi test yaratish</h1>
            <p className="text-sm text-muted-foreground">
              Test ma'lumotlarini kiriting va savollar qo'shing
            </p>
          </div>
        </div>
        {questions.length > 0 && (
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Ko'rib chiqish
          </Button>
        )}
      </div>

      {/* Test Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Test ma'lumotlari</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testName">
              Test nomi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="testName"
              placeholder="Masalan: Ingliz tili Beginner A1 - Haftalik test"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">
              Fan <span className="text-red-500">*</span>
            </Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Fan tanlang" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeLimit">Vaqt chegarasi (daqiqa)</Label>
            <Input
              id="timeLimit"
              type="number"
              placeholder="Ixtiyoriy"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Tavsif</Label>
            <Textarea
              id="description"
              placeholder="Test haqida qisqacha ma'lumot..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Questions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Savollar ({questions.length})
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion("multiple-choice")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Test (a,b,c,d)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion("open-ended")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Yozma savol
            </Button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Hozircha savollar yo'q
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => addQuestion("multiple-choice")}>
                <Plus className="w-4 h-4 mr-2" />
                Birinchi savolni qo'shish
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id} className="p-4 border-2">
                <div className="flex items-start gap-3 mb-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-move" />
                  <div className="flex-1 space-y-4">
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-lg">
                            Savol {index + 1}
                          </span>
                          <Badge variant="secondary">
                            {question.type === "multiple-choice"
                              ? "Test"
                              : "Yozma"}
                          </Badge>
                        </div>
                        <Input
                          placeholder="Savol matnini kiriting..."
                          value={question.questionText}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              questionText: e.target.value,
                            })
                          }
                          className="text-base"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              points: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-20"
                          placeholder="Ball"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Multiple Choice Options */}
                    {question.type === "multiple-choice" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Javob variantlari (to'g'ri javobni belgilang)
                        </Label>
                        {question.options?.map((option, optIndex) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-2"
                          >
                            <button
                              onClick={() =>
                                toggleCorrectAnswer(question.id, option.id)
                              }
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                option.isCorrect
                                  ? "bg-green-500 border-green-500"
                                  : "border-muted-foreground hover:border-primary"
                              }`}
                            >
                              {option.isCorrect && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </button>
                            <span className="font-medium">
                              {String.fromCharCode(97 + optIndex)})
                            </span>
                            <Input
                              placeholder="Javob varianti..."
                              value={option.text}
                              onChange={(e) =>
                                updateOption(
                                  question.id,
                                  option.id,
                                  e.target.value
                                )
                              }
                              className="flex-1"
                            />
                            {question.options && question.options.length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  deleteOption(question.id, option.id)
                                }
                              >
                                <XCircle className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {question.options && question.options.length < 10 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="mt-2"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Javob qo'shish
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Open-Ended Answer */}
                    {question.type === "open-ended" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          To'g'ri javob (namunaviy javob)
                        </Label>
                        <Textarea
                          placeholder="To'g'ri javobni yoki namunaviy javobni kiriting..."
                          value={question.correctAnswer}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              correctAnswer: e.target.value,
                            })
                          }
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
      {(testName && subject && questions.length > 0) && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => handleSave("draft")}>
            <Save className="w-4 h-4 mr-2" />
            Qoralama sifatida saqlash
          </Button>
          <Button onClick={() => handleSave("published")}>
            Nashr etish
          </Button>
        </div>
      )}
    </div>
  );
}

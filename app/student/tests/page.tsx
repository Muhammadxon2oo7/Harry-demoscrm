"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText, Clock, CheckCircle2, XCircle, Loader2,
  KeyRound, ChevronLeft, ChevronRight, Award,
  BarChart3, ClipboardCheck,
} from "lucide-react";
import { examsApi, examResultsApi, type ExamResultRecord } from "@/lib/api";

type DialogStep = "idle" | "code" | "taking" | "result";

interface ActiveExam {
  id: number;
  title: string;
  time_limit: number;
  questions: Array<{
    id: number;
    text: string;
    type: "test" | "written";
    order: number;
    options?: Array<{ id: number; text: string }>;
  }>;
}

function scoreBadge(score: number) {
  if (score >= 70) return { label: "A'lo", cls: "bg-green-500/10 text-green-700 border-green-300" };
  if (score >= 50) return { label: "Yaxshi", cls: "bg-blue-500/10 text-blue-700 border-blue-300" };
  return { label: "Qoniqarli", cls: "bg-yellow-500/10 text-yellow-700 border-yellow-300" };
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function StudentTestsPage() {
  const [results, setResults] = useState<ExamResultRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog flow
  const [step, setStep] = useState<DialogStep>("idle");
  const [examCode, setExamCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [activeExam, setActiveExam] = useState<ActiveExam | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { option_id?: number; written_answer?: string }>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ExamResultRecord | null>(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadResults = useCallback(() => {
    setLoading(true);
    examResultsApi.myResults().then(setResults).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadResults(); }, [loadResults]);

  // start timer when activeExam with time_limit
  useEffect(() => {
    if (step === "taking" && activeExam && activeExam.time_limit > 0) {
      setTimeLeft(activeExam.time_limit * 60);
    }
  }, [step, activeExam]);

  useEffect(() => {
    if (step !== "taking" || timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, timeLeft <= 0]);

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleEnterCode = async () => {
    if (!examCode.trim()) return;
    setCodeError("");
    setCodeLoading(true);
    try {
      const exam = await examsApi.enterCode(examCode.trim());
      setActiveExam(exam as unknown as ActiveExam);
      setCurrentQ(0);
      setAnswers({});
      setStep("taking");
    } catch {
      setCodeError("Noto'g'ri kod yoki imtihon topilmadi");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeExam) return;
    setSubmitLoading(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const submitAnswers = Object.entries(answers).map(([qId, ans]) => ({
        question_id: parseInt(qId),
        ...(ans.option_id != null ? { option_id: ans.option_id } : {}),
        ...(ans.written_answer != null ? { written_answer: ans.written_answer } : {}),
      }));
      const res = await examsApi.submit(activeExam.id, submitAnswers);
      setLastResult(res as unknown as ExamResultRecord);
      setStep("result");
      loadResults();
    } catch (e) {
      console.error(e);
      alert("Imtihonni topshirishda xatolik yuz berdi");
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetDialog = () => {
    setStep("idle");
    setExamCode("");
    setCodeError("");
    setActiveExam(null);
    setAnswers({});
    setLastResult(null);
    setCurrentQ(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const question = activeExam?.questions[currentQ];
  const totalQ = activeExam?.questions.length ?? 0;
  const answered = Object.keys(answers).length;
  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + (r.score ?? 0), 0) / results.length)
    : 0;
  const checkedCount = results.filter((r) => r.is_checked).length;

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Testlar</h1>
          <p className="text-muted-foreground">Imtihon topshirish va natijalarni ko&apos;rish</p>
        </div>
        <Button onClick={() => setStep("code")} className="w-fit">
          <KeyRound className="w-4 h-4 mr-2" />Imtihon kodini kiriting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Jami imtihonlar", value: results.length, icon: FileText, color: "text-primary" },
          { label: "Tekshirilgan", value: checkedCount, icon: ClipboardCheck, color: "text-green-500" },
          { label: "O'rtacha ball", value: `${avgScore}%`, icon: BarChart3, color: "text-blue-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
            <Icon className={`w-8 h-8 opacity-70 ${color}`} />
          </Card>
        ))}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Natijalar</h2>
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-48 mb-2" />
              <div className="h-4 bg-muted rounded w-32" />
            </Card>
          ))
        ) : results.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-14 h-14 mx-auto text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-lg font-semibold mb-2">Hali imtihon topshirilmagan</h3>
            <p className="text-muted-foreground mb-4">Imtihon topshirish uchun kodingizni kiriting</p>
            <Button onClick={() => setStep("code")}>
              <KeyRound className="w-4 h-4 mr-2" />Kod kiritish
            </Button>
          </Card>
        ) : (
          results.map((result) => {
            const sb = scoreBadge(result.score ?? 0);
            return (
              <Card key={result.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-base">
                      {result.exam_title ?? `Imtihon #${result.exam}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">{fmtDate(result.created_at)}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className={`border ${sb.cls}`}>
                        <Award className="w-3 h-3 mr-1" />{sb.label}
                      </Badge>
                      {result.is_checked ? (
                        <Badge className="bg-green-500/10 text-green-600 border border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />Tekshirilgan
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />Tekshirilmoqda
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{Math.round(result.score ?? 0)}%</p>
                      <p className="text-xs text-muted-foreground">Ball</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold">
                        {result.correct_answers ?? "—"}/{result.total_questions ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">To&apos;g&apos;ri</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* === ENTER CODE DIALOG === */}
      <Dialog open={step === "code"} onOpenChange={(o) => !o && resetDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />Imtihon kodini kiriting
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O&apos;qituvchingizdan olgan imtihon kodini kiriting
            </p>
            <Input
              placeholder="Masalan: ABC123"
              value={examCode}
              onChange={(e) => { setExamCode(e.target.value.toUpperCase()); setCodeError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleEnterCode()}
              className="text-center text-xl tracking-widest font-bold h-14"
              autoFocus
            />
            {codeError && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />{codeError}
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetDialog} className="flex-1">Bekor qilish</Button>
              <Button onClick={handleEnterCode} disabled={codeLoading || !examCode.trim()} className="flex-1">
                {codeLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Boshlash
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* === TAKING EXAM DIALOG === */}
      <Dialog open={step === "taking"} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeExam && question && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="text-base truncate max-w-xs">{activeExam.title}</DialogTitle>
                  {activeExam.time_limit > 0 && (
                    <Badge
                      className={`shrink-0 font-mono text-sm ${
                        timeLeft < 60 ? "bg-red-500 text-white" : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 mr-1" />{fmtTime(timeLeft)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {currentQ + 1} / {totalQ}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                    {currentQ + 1}
                  </span>
                  <p className="text-base font-medium">{question.text}</p>
                </div>

                {question.type === "test" && question.options && (
                  <div className="space-y-2 ml-11">
                    {question.options.map((opt, oi) => {
                      const selected = answers[question.id]?.option_id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: { option_id: opt.id } }))}
                          className={`w-full text-left p-3.5 rounded-lg border-2 transition-colors ${
                            selected
                              ? "border-primary bg-primary/10 font-medium"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <span className="font-medium mr-2">{String.fromCharCode(97 + oi)})</span>
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>
                )}

                {question.type === "written" && (
                  <div className="ml-11">
                    <Textarea
                      placeholder="Javobingizni yozing..."
                      value={answers[question.id]?.written_answer ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [question.id]: { written_answer: e.target.value } }))
                      }
                      rows={5}
                      className="resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQ((p) => p - 1)}
                  disabled={currentQ === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />Oldingi
                </Button>
                <span className="text-xs text-muted-foreground">
                  {answered} / {totalQ} javoblandi
                </span>
                {currentQ < totalQ - 1 ? (
                  <Button onClick={() => setCurrentQ((p) => p + 1)}>
                    Keyingi<ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={submitLoading} className="bg-green-600 hover:bg-green-700">
                    {submitLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Topshirish
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* === RESULT DIALOG === */}
      <Dialog open={step === "result"} onOpenChange={resetDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Imtihon yakunlandi</DialogTitle>
          </DialogHeader>
          {lastResult && (
            <div className="space-y-6 py-4">
              <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="currentColor" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - (lastResult.score ?? 0) / 100)}`}
                    strokeLinecap="round"
                    className={lastResult.score >= 70 ? "text-green-500" : lastResult.score >= 50 ? "text-blue-500" : "text-yellow-500"}
                  />
                </svg>
                <span className="absolute text-3xl font-bold">{Math.round(lastResult.score ?? 0)}%</span>
              </div>

              <div>
                <Badge className={`border text-sm px-4 py-1 ${scoreBadge(lastResult.score ?? 0).cls}`}>
                  <Award className="w-4 h-4 mr-1.5" />{scoreBadge(lastResult.score ?? 0).label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <Card className="p-4">
                  <p className="text-2xl font-bold text-green-500">{lastResult.correct_answers ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">To&apos;g&apos;ri javob</p>
                </Card>
                <Card className="p-4">
                  <p className="text-2xl font-bold">{lastResult.total_questions ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Jami savollar</p>
                </Card>
              </div>

              <p className="text-sm text-muted-foreground">
                {lastResult.is_checked
                  ? "Imtihon tekshirildi"
                  : "Imtihon o'qituvchi tomonidan tekshiriladi"}
              </p>

              <Button onClick={resetDialog} className="w-full">Yopish</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

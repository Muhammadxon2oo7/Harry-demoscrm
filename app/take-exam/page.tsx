"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Clock, CheckCircle2, Loader2, ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import { examsApi, type ExamSubmitAnswer } from "@/lib/api";
import { toast } from "@/lib/toast";

interface ActiveExam {
  id: number;
  title: string;
  time_limit: number; // minutes, 0 = no limit
  questions: Array<{
    id: number;
    text: string;
    type: "test" | "written";
    order: number;
    options?: Array<{ id: number; text: string }>;
  }>;
}

function fmtTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TakeExamPage() {
  const router = useRouter();
  const [exam, setExam] = useState<ActiveExam | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { option_id?: number; written_answer?: string }>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);
  // Keep a ref to always have the latest answers for timer auto-submit
  const answersRef = useRef(answers);
  const examRef = useRef<ActiveExam | null>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Load exam from sessionStorage on mount
  useEffect(() => {
    const raw = sessionStorage.getItem("activeExam");
    if (!raw) {
      setNotFound(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as ActiveExam;
      setExam(parsed);
      examRef.current = parsed;
      if (parsed.time_limit > 0) {
        setTimeLeft(parsed.time_limit * 60);
      }
    } catch {
      setNotFound(true);
    }
  }, []);

  const doSubmit = useCallback(async () => {
    if (submittedRef.current || !examRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitLoading(true);
    try {
      const submitAnswers: ExamSubmitAnswer[] = Object.entries(answersRef.current).map(([qId, ans]) => ({
        question_id: parseInt(qId),
        ...(ans.option_id != null ? { option_id: ans.option_id } : {}),
        ...(ans.written_answer != null ? { written_answer: ans.written_answer } : {}),
      }));
      await examsApi.submit(examRef.current.id, submitAnswers);
      sessionStorage.removeItem("activeExam");
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      submittedRef.current = false;
      toast.error("Imtihonni topshirishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSubmitLoading(false);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!exam || exam.time_limit <= 0 || submitted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          doSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, submitted]);

  /* ---- States ---- */

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-sm w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto opacity-80" />
          <h2 className="text-lg font-semibold">Imtihon topilmadi</h2>
          <p className="text-sm text-muted-foreground">
            Imtihon kodi yaroqsiz yoki muddati o&apos;tib ketgan
          </p>
          <Button onClick={() => router.push("/student/tests")} className="w-full">
            Testlar sahifasiga qaytish
          </Button>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Imtihon topshirildi!</h2>
            <p className="text-muted-foreground leading-relaxed">
              Natijangiz tez orada o&apos;qituvchi tomonidan tekshiriladi
            </p>
          </div>
          <Button onClick={() => router.push("/student/tests")} className="w-full" size="lg">
            Bosh sahifaga
          </Button>
        </Card>
      </div>
    );
  }

  const question = exam.questions[currentQ];
  const totalQ = exam.questions.length;
  const answered = Object.keys(answers).length;
  const progress = ((currentQ + 1) / totalQ) * 100;
  const isLowTime = exam.time_limit > 0 && timeLeft > 0 && timeLeft < 60;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm md:text-base truncate">{exam.title}</h1>
            <p className="text-xs text-muted-foreground">
              {answered}/{totalQ} javoblandi
            </p>
          </div>
          {exam.time_limit > 0 && (
            <Badge
              className={`font-mono text-sm shrink-0 px-3 py-1 ${
                isLowTime
                  ? "bg-red-500 text-white animate-pulse border-red-500"
                  : "bg-primary/10 text-primary border border-primary/30"
              }`}
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              {fmtTime(timeLeft)}
            </Badge>
          )}
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Question */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Savol <span className="font-semibold text-foreground">{currentQ + 1}</span> / {totalQ}
          </span>
          <Badge variant="outline" className="text-xs">
            {question.type === "test" ? "Test savol" : "Yozma savol"}
          </Badge>
        </div>

        <Card className="p-5 md:p-7">
          <p className="text-base md:text-lg font-medium leading-relaxed mb-6">
            {question.text}
          </p>

          {question.type === "test" && question.options && (
            <div className="space-y-3">
              {question.options.map((opt, oi) => {
                const selected = answers[question.id]?.option_id === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [question.id]: { option_id: opt.id } }))
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <span className="font-semibold mr-2 text-primary">
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === "written" && (
            <Textarea
              placeholder="Javobingizni shu yerga yozing..."
              value={answers[question.id]?.written_answer ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [question.id]: { written_answer: e.target.value } }))
              }
              rows={6}
              className="resize-none text-sm"
            />
          )}
        </Card>
      </main>

      {/* Footer nav */}
      <footer className="border-t bg-card sticky bottom-0 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentQ((p) => p - 1)}
            disabled={currentQ === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />Oldingi
          </Button>

          {currentQ < totalQ - 1 ? (
            <Button onClick={() => setCurrentQ((p) => p + 1)} className="gap-1">
              Keyingi<ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={doSubmit}
              disabled={submitLoading}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              {submitLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <CheckCircle2 className="w-4 h-4" />
              }
              Topshirish
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

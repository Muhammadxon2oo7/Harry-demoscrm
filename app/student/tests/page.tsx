"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText, Clock, CheckCircle2, XCircle, Loader2,
  KeyRound, Award,
} from "lucide-react";
import { examsApi, examResultsApi, type ExamResultRecord } from "@/lib/api";
import { fmtDateTime } from "@/lib/utils";

type DialogStep = "idle" | "code";

function scoreBadge(score: number) {
  if (score >= 70) return { label: "A'lo", cls: "bg-green-500/10 text-green-700 border-green-300" };
  if (score >= 50) return { label: "Yaxshi", cls: "bg-blue-500/10 text-blue-700 border-blue-300" };
  return { label: "Qoniqarli", cls: "bg-yellow-500/10 text-yellow-700 border-yellow-300" };
}

export default function StudentTestsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ExamResultRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog flow
  const [step, setStep] = useState<DialogStep>("idle");
  const [examCode, setExamCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  const loadResults = useCallback(() => {
    setLoading(true);
    examResultsApi.myResults().then(setResults).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadResults(); }, [loadResults]);

  const handleEnterCode = async () => {
    if (!examCode.trim()) return;
    setCodeError("");
    setCodeLoading(true);
    try {
      const exam = await examsApi.enterCode(examCode.trim());
      sessionStorage.setItem("activeExam", JSON.stringify(exam));
      router.push("/take-exam");
    } catch {
      setCodeError("Noto'g'ri kod yoki imtihon topilmadi");
    } finally {
      setCodeLoading(false);
    }
  };

  const resetDialog = () => {
    setStep("idle");
    setExamCode("");
    setCodeError("");
  };

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
          { label: "Jami imtihonlar", value: results.length },
          { label: "Tekshirilgan", value: checkedCount },
          { label: "O'rtacha ball", value: avgScore },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
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
                    <p className="text-sm text-muted-foreground">{fmtDateTime(result.created_at)}</p>
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
                      <p className="text-3xl font-bold text-primary">{Math.round(result.score ?? 0)}</p>
                      <p className="text-xs text-muted-foreground">Ball</p>
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
    </div>
  );
}

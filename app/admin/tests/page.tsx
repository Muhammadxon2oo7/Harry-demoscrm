"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Trash2, Copy, Clock, FileText, Users,
  Globe, GlobeLock, Pencil, CheckCircle2, RefreshCw,
  BarChart3, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { examsApi, examResultsApi, type ExamRecord, type ExamResultRecord, type ExamGradeInput } from "@/lib/api";
import { fmtDate } from "@/lib/utils";
import { toast } from "@/lib/toast";

export default function AdminTestsPage() {
  const router = useRouter();

  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Results drawer
  const [resultsExam, setResultsExam] = useState<ExamRecord | null>(null);
  const [examResults, setExamResults] = useState<ExamResultRecord[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [expandedResultId, setExpandedResultId] = useState<number | null>(null);
  // answerGrades[resultId][answerId] = { earned_score }
  const [answerGrades, setAnswerGrades] = useState<Record<number, Record<number, { earned_score: string }>>>({});
  const [gradeSaving, setGradeSaving] = useState(false);

  const loadExams = useCallback(() => {
    setLoading(true);
    examsApi.list().then(setExams).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadExams(); }, [loadExams]);

  const handlePublish = async (exam: ExamRecord) => {
    try {
      exam.is_published ? await examsApi.unpublish(exam.id) : await examsApi.publish(exam.id);
      loadExams();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try { await examsApi.delete(deleteId); loadExams(); } catch (e) { console.error(e); }
    finally { setDeleteId(null); }
  };

  const openResults = async (exam: ExamRecord) => {
    setResultsExam(exam);
    setResultsLoading(true);
    setExamResults([]);
    try {
      const all = await examResultsApi.list();
      setExamResults(all.filter((r) => r.exam === exam.id));
    } catch (e) { console.error(e); }
    finally { setResultsLoading(false); }
  };

  const setAnswerGrade = (resultId: number, ansId: number, value: string) => {
    setAnswerGrades((p) => ({
      ...p,
      [resultId]: {
        ...(p[resultId] ?? {}),
        [ansId]: { earned_score: value },
      },
    }));
  };

  const handleGrade = async (resultId: number) => {
    const result = examResults.find((r) => r.id === resultId);
    if (!result?.answers) return;
    setGradeSaving(true);
    try {
      const gradeItems: ExamGradeInput[] = result.answers.map((ans) => ({
        answer_id: ans.id,
        earned_score: parseFloat(answerGrades[resultId]?.[ans.id]?.earned_score ?? "0") || 0,
      }));
      const updated = await examResultsApi.grade(resultId, gradeItems);
      setExamResults((prev) => prev.map((r) => r.id === resultId ? updated : r));
      setExpandedResultId(null);
    } catch (e) { console.error(e); }
    finally { setGradeSaving(false); }
  };

  const filtered = exams.filter((e) =>
    [e.title, e.subject_name, e.code].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const published = exams.filter((e) => e.is_published).length;
  const totalParticipants = exams.reduce((s, e) => s + (e.participants_count ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Testlar</h1>
          <p className="text-muted-foreground">Imtihonlarni yaratish va boshqarish</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={loadExams}>
            <RefreshCw className="w-4 h-4 mr-2" />Yangilash
          </Button>
          <Button onClick={() => router.push("/admin/tests/create")}>
            <Plus className="w-4 h-4 mr-2" />Yangi imtihon
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Jami imtihonlar", value: exams.length },
          { label: "Nashr etilgan", value: published },
          { label: "Qoralama", value: exams.length - published },
          { label: "Jami ishtirokchilar", value: totalParticipants },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Nomi, kodi yoki fan bilan qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-5 bg-muted rounded w-48 mb-3" />
              <div className="h-4 bg-muted rounded w-32" />
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-14 h-14 mx-auto text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-lg font-semibold mb-2">Imtihon topilmadi</h3>
            <p className="text-muted-foreground mb-4">
              {search ? "Qidiruv natijasi bo'sh" : "Hali imtihon yaratilmagan"}
            </p>
            {!search && (
              <Button onClick={() => router.push("/admin/tests/create")}>
                <Plus className="w-4 h-4 mr-2" />Yangi imtihon
              </Button>
            )}
          </Card>
        ) : (
          filtered.map((exam) => (
            <Card key={exam.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{exam.title}</h3>
                    {exam.is_published ? (
                      <Badge className="bg-green-500/10 text-green-600 border border-green-200">
                        <Globe className="w-3 h-3 mr-1" />Nashr etilgan
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <GlobeLock className="w-3 h-3 mr-1" />Qoralama
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Fan:</span> {exam.subject_name}
                  </p>
                  {exam.description && (
                    <p className="text-sm text-muted-foreground">{exam.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />{exam.questions_count ?? 0} savol
                    </span>
                    {exam.time_limit > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />{exam.time_limit} daqiqa
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />{exam.participants_count ?? 0} ishtirokchi
                    </span>
                    <span>{fmtDate(exam.date)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg text-center hover:bg-primary/20 transition-colors cursor-pointer group"
                    onClick={async () => {
                      await navigator.clipboard.writeText(exam.code);
                      toast.success(`Kod nusxalandi: ${exam.code}`);
                    }}
                    title="Nusxalash uchun bosing"
                  >
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      Kod <Copy className="w-3 h-3 group-hover:opacity-100 opacity-50" />
                    </p>
                    <p className="text-xl font-bold tracking-wider text-primary">{exam.code}</p>
                  </button>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      size="sm"
                      variant={exam.is_published ? "outline" : "default"}
                      onClick={() => handlePublish(exam)}
                      className="text-xs"
                    >
                      {exam.is_published
                        ? <><GlobeLock className="w-3.5 h-3.5 mr-1" />Yashirish</>
                        : <><Globe className="w-3.5 h-3.5 mr-1" />Nashr</>}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/tests/create?edit=${exam.id}`)}
                      className="text-xs"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />Tahrir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openResults(exam)}
                      className="text-xs"
                    >
                      <BarChart3 className="w-3.5 h-3.5 mr-1" />Natijalar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(exam.id)}
                      className="text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />O&apos;chirish
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete confirm */}
      <Dialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imtihonni o&apos;chirish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Rostdan ham o&apos;chirmoqchimisiz? Bu amalni bekor qilib bo&apos;lmaydi.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Bekor qilish</Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1">O&apos;chirish</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Drawer (bottom) */}
      <Drawer open={resultsExam != null} onOpenChange={(o) => { if (!o) { setResultsExam(null); setExamResults([]); setExpandedResultId(null); } }}>
        <DrawerContent className="max-h-[88vh] flex flex-col">
          <DrawerHeader className="flex items-center justify-between border-b pb-3 shrink-0">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5" />
              {resultsExam?.title} — Natijalar
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1 p-4">
            {resultsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : examResults.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Hali hech kim imtihon topshirmagan</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-3">{examResults.length} ta ishtirokchi</p>
                {examResults.map((result) => {
                  const expanded = expandedResultId === result.id;
                  const name = (result as unknown as { student_full_name?: string }).student_full_name
                    || `O\'quvchi #${result.student}`;
                  return (
                    <Card key={result.id} className="overflow-hidden">
                      {/* Accordion header */}
                      <button
                        className="w-full p-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors text-left"
                        onClick={async () => {
                          if (expanded) { setExpandedResultId(null); return; }
                          if (!result.answers) {
                            const full = await examResultsApi.get(result.id);
                            setExamResults((prev) => prev.map((r) => r.id === result.id ? full : r));
                          }
                          setExpandedResultId(result.id);
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{name}</p>
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {result.is_checked ? (
                                <Badge className="bg-green-500/10 text-green-600 border-green-200 border text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />Tekshirilgan
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />Tekshirilmoqda
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {result.correct_answers}/{result.total_questions} to&apos;g&apos;ri
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xl font-bold text-primary">{Math.round(result.score ?? 0)}</span>
                          {expanded
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          }
                        </div>
                      </button>

                      {/* Expanded: answers + grading */}
                      {expanded && result.answers && (() => {
                        const totalEntered = result.answers.reduce(
                          (s, a) => s + (parseFloat(answerGrades[result.id]?.[a.id]?.earned_score ?? "0") || 0), 0
                        );
                        return (
                          <div className="border-t bg-muted/20 p-4 space-y-4">
                            {result.answers.map((ans, idx) => {
                              const isWritten = ans.written_answer != null;
                              return (
                                <div key={ans.id} className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground">
                                    {idx + 1}. {ans.question_text}
                                  </p>
                                  {isWritten ? (
                                    <div className="bg-background border rounded-lg p-3 text-sm whitespace-pre-wrap leading-relaxed">
                                      {ans.written_answer}
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center bg-blue-500/5 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700">
                                      {ans.option_text ?? "—"}
                                    </div>
                                  )}
                                  {!result.is_checked && (
                                    <Input
                                      type="number" min="0" step="0.5"
                                      placeholder="Ball"
                                      value={answerGrades[result.id]?.[ans.id]?.earned_score ?? ""}
                                      onChange={(e) => setAnswerGrade(result.id, ans.id, e.target.value)}
                                      className="h-8 w-24 text-sm text-center"
                                    />
                                  )}
                                  {result.is_checked && ans.earned_score != null && (
                                    <div className="text-xs font-medium text-foreground">{ans.earned_score} ball</div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Submit row */}
                            {!result.is_checked && (
                              <div className="pt-3 border-t flex items-center justify-between gap-3">
                                <span className="text-sm text-muted-foreground">
                                  Kiritilgan jami: <span className="font-semibold text-foreground">{totalEntered}</span> ball
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => handleGrade(result.id)}
                                  disabled={gradeSaving}
                                >
                                  {gradeSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Saqlash
                                </Button>
                              </div>
                            )}

                            {result.is_checked && (
                              <div className="pt-3 border-t flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Baholangan — {Math.round(result.score ?? 0)} ball</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

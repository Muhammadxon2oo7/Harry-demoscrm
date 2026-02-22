"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Eye, Save,
  XCircle, FileText, Loader2,
} from "lucide-react";
import {
  examsApi, subjectsApi,
  type Subject, type ExamQuestionInput,
} from "@/lib/api";
import { toast } from "@/lib/toast";

interface UIOption { id: string; text: string; }
interface UIQuestion {
  id: string;
  type: "multiple-choice" | "open-ended";
  questionText: string;
  options?: UIOption[];
  order: number;
}

function toApiQuestions(questions: UIQuestion[]): ExamQuestionInput[] {
  return questions.map((q, idx) => ({
    text: q.questionText,
    type: q.type === "multiple-choice" ? "test" : "written",
    order: idx + 1,
    ...(q.type === "multiple-choice"
      ? { options: (q.options || []).filter((o) => o.text.trim() !== "").map((o, oi) => ({ text: o.text, order: oi + 1 })) }
      : {}),
  }));
}

function StaffCreateTestPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<UIQuestion[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { subjectsApi.list().then(setSubjects).catch(console.error); }, []);

  useEffect(() => {
    if (!editId) return;
    examsApi.get(parseInt(editId)).then((exam) => {
      setExamTitle(exam.title ?? "");
      setSubjectId(String(exam.subject));
      setDescription(exam.description ?? "");
      setTimeLimit(exam.time_limit > 0 ? String(exam.time_limit) : "");
      setIsPublished(exam.is_published);
      if (exam.questions) {
        setQuestions(exam.questions.map((q, idx) => ({
          id: String(q.id),
          type: q.type === "test" ? "multiple-choice" : "open-ended",
          questionText: q.text,
          order: idx + 1,
          options: q.options?.map((o) => ({ id: String(o.id), text: o.text })),
        })));
      }
    }).catch(console.error);
  }, [editId]);

  const addQuestion = (type: "multiple-choice" | "open-ended") =>
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(), type, questionText: "", order: prev.length + 1,
        ...(type === "multiple-choice"
          ? { options: [{ id: "1", text: "" }, { id: "2", text: "" }] }
          : {}),
      },
    ]);

  const updateQuestion = (id: string, updates: Partial<UIQuestion>) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));

  const deleteQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  const addOption = (qId: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId && q.type === "multiple-choice"
          ? { ...q, options: [...(q.options || []), { id: Date.now().toString(), text: "" }] }
          : q
      )
    );

  const updateOption = (qId: string, optId: string, text: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: q.options?.map((o) => (o.id === optId ? { ...o, text } : o)) } : q
      )
    );

  const deleteOption = (qId: string, optId: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: q.options?.filter((o) => o.id !== optId) } : q
      )
    );

  const handleSave = async (publish: boolean) => {
    if (!examTitle.trim() || !subjectId) return;
    setSaving(true);
    try {
      const data = {
        subject: parseInt(subjectId),
        title: examTitle.trim(),
        description: description || undefined,
        time_limit: timeLimit ? parseInt(timeLimit) : undefined,
        is_published: publish,
        is_active: true,
        date: new Date().toISOString().slice(0, 10),
        questions: toApiQuestions(questions),
      };
      editId ? await examsApi.update(parseInt(editId), data) : await examsApi.create(data);
      router.push("/staff/tests");
    } catch (e) {
      console.error(e);
      toast.error("Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (showPreview) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />Tahrirlashga qaytish
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />Qoralama
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Nashr etish
            </Button>
          </div>
        </div>
        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold mb-2">{examTitle}</h1>
              <p className="text-muted-foreground">{subjects.find((s) => String(s.id) === subjectId)?.name}</p>
              {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
              {timeLimit && <Badge className="mt-3">Vaqt: {timeLimit} daqiqa</Badge>}
            </div>
            {questions.map((q, i) => (
              <div key={q.id} className="border-b pb-6 last:border-0">
                <div className="flex items-start gap-3 mb-4">
                  <span className="shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  <p className="text-lg font-medium">{q.questionText}</p>
                </div>
                {q.type === "multiple-choice" ? (
                  <div className="space-y-2 ml-11">
                    {q.options?.map((opt, oi) => (
                      <div
                        key={opt.id}
                        className="p-3 rounded-lg border-2 border-border"
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(97 + oi)})</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-11 p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground italic">Yozma javob (o&apos;quvchi tomonidan to&apos;ldiriladi)</p>
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
    <div className="space-y-6 px-4 py-6 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/staff/tests")}>
          <ArrowLeft className="w-4 h-4 mr-2" />Orqaga
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{editId ? "Imtihonni tahrirlash" : "Yangi imtihon yaratish"}</h1>
          <p className="text-sm text-muted-foreground">Savol-javob tizimi bilan imtihon yarating</p>
        </div>
      </div>

      {/* Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Imtihon ma&apos;lumotlari</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Imtihon nomi <span className="text-destructive">*</span></Label>
            <Input
              placeholder="Masalan: 1-Haftalik Imtihon"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Fan <span className="text-destructive">*</span></Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue placeholder="Fan tanlang" /></SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vaqt chegarasi (daqiqa) — 0 = cheksiz</Label>
            <Input
              type="number"
              placeholder="Masalan: 60"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Holat</Label>
            <div className="flex items-center gap-3 h-10">
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              <span className="text-sm">{isPublished ? "Nashr etilgan" : "Qoralama"}</span>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Tavsif</Label>
            <Textarea
              placeholder="Ixtiyoriy tavsif..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Questions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Savollar ({questions.length})</h2>
          <div className="flex gap-2">
            {questions.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-1.5" />Ko&apos;rib chiqish
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => addQuestion("multiple-choice")}>
              <Plus className="w-4 h-4 mr-1.5" />Test savol
            </Button>
            <Button variant="outline" size="sm" onClick={() => addQuestion("open-ended")}>
              <Plus className="w-4 h-4 mr-1.5" />Yozma savol
            </Button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="mb-4">Hozircha savollar yo&apos;q</p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => addQuestion("multiple-choice")}>
                <Plus className="w-4 h-4 mr-2" />Test savol qo&apos;shish
              </Button>
              <Button variant="outline" onClick={() => addQuestion("open-ended")}>
                <Plus className="w-4 h-4 mr-2" />Yozma savol qo&apos;shish
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {questions.map((q, i) => (
              <Card key={q.id} className="p-4 border-2">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">Savol {i + 1}</span>
                          <Badge variant="secondary" className="text-xs">
                            {q.type === "multiple-choice" ? "Test" : "Yozma"}
                          </Badge>
                        </div>
                        <Input
                          placeholder="Savol matnini kiriting..."
                          value={q.questionText}
                          onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                    {q.type === "multiple-choice" && (
                      <div className="space-y-2">
                        <Label className="text-xs">Javob variantlari</Label>
                        {q.options?.map((opt, oi) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <span className="font-medium text-xs shrink-0">{String.fromCharCode(97 + oi)})</span>
                            <Input
                              placeholder="Javob varianti..."
                              value={opt.text}
                              onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                              className="flex-1 h-8 text-sm"
                            />
                            {q.options && q.options.length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7"
                                onClick={() => deleteOption(q.id, opt.id)}
                              >
                                <XCircle className="w-3.5 h-3.5 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {q.options && q.options.length < 6 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(q.id)}
                            className="text-xs mt-1"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />Variant qo&apos;shish
                          </Button>
                        )}
                      </div>
                    )}

                    {q.type === "open-ended" && (
                      <div className="p-3 bg-muted/40 rounded-lg border border-dashed">
                        <p className="text-xs text-muted-foreground">O&apos;quvchi bu yerga yozma javob yozadi</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {examTitle && subjectId && (
        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />Qoralama
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Nashr etish
          </Button>
        </div>
      )}
    </div>
  );
}

export default function StaffCreateTestPage() {
  return (
    <Suspense fallback={null}>
      <StaffCreateTestPageContent />
    </Suspense>
  );
}

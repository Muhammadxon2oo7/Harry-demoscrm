"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Trash2, Copy, Clock, FileText, Users,
  Globe, GlobeLock, Pencil, CheckCircle2, RefreshCw,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { examsApi, type ExamRecord } from "@/lib/api";

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminTestsPage() {
  const router = useRouter();

  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  const handleCopy = async (id: number) => {
    try { await examsApi.copy(id); loadExams(); } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try { await examsApi.delete(deleteId); loadExams(); } catch (e) { console.error(e); }
    finally { setDeleteId(null); }
  };

  const filtered = exams.filter((e) =>
    [e.title, e.subject_name, e.code].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const published = exams.filter((e) => e.is_published).length;
  const totalParticipants = exams.reduce((s, e) => s + (e.participants_count ?? 0), 0);

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
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
          { label: "Jami imtihonlar", value: exams.length, icon: FileText, color: "text-primary" },
          { label: "Nashr etilgan", value: published, icon: Globe, color: "text-green-500" },
          { label: "Qoralama", value: exams.length - published, icon: GlobeLock, color: "text-orange-500" },
          { label: "Jami ishtirokchilar", value: totalParticipants, icon: CheckCircle2, color: "text-blue-500" },
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
                  <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Kod</p>
                    <p className="text-xl font-bold tracking-wider text-primary">{exam.code}</p>
                  </div>
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
                    <Button size="sm" variant="outline" onClick={() => handleCopy(exam.id)} className="text-xs">
                      <Copy className="w-3.5 h-3.5 mr-1" />Nusxa
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
    </div>
  );
}

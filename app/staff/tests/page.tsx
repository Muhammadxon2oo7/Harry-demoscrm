"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Edit, Trash2, Copy, Eye, BarChart,
  Clock, FileText, Users,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { LocalTest } from "@/app/admin/tests/page";
import { loadTests, saveTests } from "@/app/admin/tests/page";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function StaffTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<LocalTest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  useEffect(() => { setTests(loadTests()); }, []);

  const filtered = tests.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.testCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDuplicate = (test: LocalTest) => {
    const newTest: LocalTest = {
      ...test,
      id: Date.now().toString(),
      name: `${test.name} (nusxa)`,
      testCode: generateCode(),
      status: "draft",
      completedCount: 0,
      averageScore: undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [newTest, ...tests];
    setTests(updated);
    saveTests(updated);
  };

  const handleDelete = () => {
    if (!testToDelete) return;
    const updated = tests.filter((t) => t.id !== testToDelete);
    setTests(updated);
    saveTests(updated);
    setIsDeleteDialogOpen(false);
    setTestToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Testlar</h1>
          <p className="text-muted-foreground">Testlar yaratish va boshqarish</p>
        </div>
        <Button onClick={() => router.push("/staff/tests/create")} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Yangi test yaratish
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Test nomi, fan yoki kod bilan qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Jami testlar</p>
            <p className="text-2xl font-bold">{tests.length}</p>
          </div>
          <FileText className="w-8 h-8 text-primary" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Nashr etilgan</p>
            <p className="text-2xl font-bold">{tests.filter((t) => t.status === "published").length}</p>
          </div>
          <Eye className="w-8 h-8 text-green-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Qoralama</p>
            <p className="text-2xl font-bold">{tests.filter((t) => t.status === "draft").length}</p>
          </div>
          <Edit className="w-8 h-8 text-orange-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Ishtirokchilar</p>
            <p className="text-2xl font-bold">{tests.reduce((a, t) => a + t.completedCount, 0)}</p>
          </div>
          <Users className="w-8 h-8 text-blue-500" />
        </Card>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Test topilmadi</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Qidiruv natijasi topilmadi" : "Hozircha testlar yo'q"}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push("/staff/tests/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Birinchi testni yaratish
              </Button>
            )}
          </Card>
        ) : (
          filtered.map((test) => (
            <Card key={test.id} className="p-6 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold">{test.name}</h3>
                    <Badge variant={test.status === "published" ? "default" : "secondary"}>
                      {test.status === "published" ? "Nashr etilgan" : "Qoralama"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Fan:</span> {test.subject}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{test.questionCount} ta savol</span>
                    </div>
                    {test.timeLimit && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{test.timeLimit} daqiqa</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{test.completedCount} ta ishtirokchi</span>
                    </div>
                    {test.averageScore !== undefined && (
                      <div className="flex items-center gap-1">
                        <BarChart className="w-4 h-4" />
                        <span>O&apos;rtacha: {test.averageScore}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap lg:flex-col items-start gap-2 shrink-0">
                  <div className="bg-primary/10 px-4 py-2 rounded-lg mb-1 w-full text-center">
                    <p className="text-xs text-muted-foreground">Test kodi</p>
                    <p className="text-lg font-bold text-primary">{test.testCode}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/staff/tests/create?edit=${test.id}`)} className="flex-1 lg:w-full">
                    <Edit className="w-4 h-4 mr-2" />Tahrirlash
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDuplicate(test)} className="flex-1 lg:w-full">
                    <Copy className="w-4 h-4 mr-2" />Nusxa
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => { setTestToDelete(test.id); setIsDeleteDialogOpen(true); }} className="flex-1 lg:w-full">
                    <Trash2 className="w-4 h-4 mr-2" />O&apos;chirish
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Testni o&apos;chirish</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Rostdan ham bu testni o&apos;chirmoqchimisiz? Bu amalni bekor qilib bo&apos;lmaydi.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1">Bekor qilish</Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1">O&apos;chirish</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

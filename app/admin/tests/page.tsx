"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Trash2,
  FileText,
  Clock,
  Headphones,
  BookOpen,
  PenLine,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockTestsApi, type MockTest } from "@/lib/api";
import { toast } from "sonner";

export default function AdminTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await mockTestsApi.list();
      setTests(data);
    } catch {
      toast.error("Testlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(
    (test) =>
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    try {
      setDeleting(true);
      await mockTestsApi.delete(testToDelete);
      setTests((prev) => prev.filter((t) => t.id !== testToDelete));
      toast.success("Test o'chirildi");
      setIsDeleteDialogOpen(false);
      setTestToDelete(null);
    } catch {
      toast.error("Testni o'chirishda xatolik");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mock Testlar</h1>
          <p className="text-muted-foreground">
            IELTS mock testlarini yaratish va boshqarish
          </p>
        </div>
        <Button onClick={() => router.push("/admin/tests/create")} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Yangi test yaratish
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Test nomi yoki kod bilan qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami testlar</p>
              <p className="text-2xl font-bold">{tests.length}</p>
            </div>
            <FileText className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami savollar</p>
              <p className="text-2xl font-bold">
                {tests.reduce(
                  (acc, t) =>
                    acc +
                    (t.reading?.question_count ?? 0) +
                    (t.writing?.question_count ?? 0) +
                    (t.listening?.question_count ?? 0),
                  0
                )}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami vaqt (min)</p>
              <p className="text-2xl font-bold">
                {tests.reduce(
                  (acc, t) =>
                    acc +
                    (t.reading?.duration ?? 0) +
                    (t.writing?.duration ?? 0) +
                    (t.listening?.duration ?? 0),
                  0
                )}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Tests List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredTests.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Test topilmadi</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Qidiruv natijasi topilmadi"
              : "Hozircha testlar yo'q"}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push("/admin/tests/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Birinchi testni yaratish
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTests.map((test) => (
            <Card key={test.id} className="p-6 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-semibold">{test.title}</h3>
                    <Badge variant="secondary">
                      Kod: <span className="font-bold ml-1">{test.code}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-700 dark:text-blue-400">Reading</p>
                        <p className="text-muted-foreground">
                          {test.reading?.question_count ?? 0} savol &middot; {test.reading?.duration ?? 0} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <PenLine className="w-4 h-4 text-green-500 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-green-700 dark:text-green-400">Writing</p>
                        <p className="text-muted-foreground">
                          {test.writing?.question_count ?? 0} task &middot; {test.writing?.duration ?? 0} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <Headphones className="w-4 h-4 text-purple-500 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-purple-700 dark:text-purple-400">Listening</p>
                        <p className="text-muted-foreground">
                          {test.listening?.question_count ?? 0} savol &middot; {test.listening?.duration ?? 0} min
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Yaratilgan: {new Date(test.created_at).toLocaleDateString("uz-UZ")}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setTestToDelete(test.id);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  O'chirish
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testni o'chirish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Rostdan ham bu testni o'chirmoqchimisiz? Bu amalni bekor qilib
              bo'lmaydi.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1"
                disabled={deleting}
              >
                Bekor qilish
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTest}
                className="flex-1"
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                O'chirish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

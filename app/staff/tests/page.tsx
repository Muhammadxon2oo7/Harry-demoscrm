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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockTestsApi, type MockTest } from "@/lib/api";

export default function StaffTestsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await mockTestsApi.list();
        setTests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTests = tests.filter(
    (test) =>
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    try {
      await mockTestsApi.delete(testToDelete);
      setTests(tests.filter((t) => t.id !== testToDelete));
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleteDialogOpen(false);
      setTestToDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Test nomi yoki kod bilan qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-sm text-muted-foreground">Qidiruv natijalari</p>
              <p className="text-2xl font-bold">{filteredTests.length}</p>
            </div>
            <Search className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        ) : filteredTests.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Test topilmadi</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Qidiruv natijasi topilmadi" : "Hozircha testlar yo&apos;q"}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push("/staff/tests/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Birinchi testni yaratish
              </Button>
            )}
          </Card>
        ) : (
          filteredTests.map((test) => (
            <Card key={test.id} className="p-6 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{test.title}</h3>
                    <Badge variant="default">Nashr etilgan</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>Reading: {test.reading?.question_count ?? 0} savol</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>Writing: {test.writing?.question_count ?? 0} savol</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Listening: {test.listening?.duration ?? 0} daqiqa</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 px-4 py-2 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Test kodi</p>
                    <p className="text-lg font-bold text-primary">{test.code}</p>
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
                    O&apos;chirish
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testni o&apos;chirish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Rostdan ham bu testni o&apos;chirmoqchimisiz? Bu amalni bekor qilib bo&apos;lmaydi.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTest}
                className="flex-1"
              >
                O&apos;chirish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


interface Test {
  id: string;
  name: string;
  subject: string;
  testCode: string;
  questionCount: number;
  timeLimit?: number;
  createdAt: string;
  status: "draft" | "published";
  completedCount: number;
  averageScore?: number;
}

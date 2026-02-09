"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  BarChart,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function AdminTestsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  // Mock data
  const [tests, setTests] = useState<Test[]>([
    {
      id: "1",
      name: "Ingliz tili Beginner A1 - Haftalik test",
      subject: "Ingliz tili",
      testCode: "ABC123",
      questionCount: 20,
      timeLimit: 30,
      createdAt: "2026-02-01",
      status: "published",
      completedCount: 15,
      averageScore: 85,
    },
    {
      id: "2",
      name: "Matematika - Algebra 8-sinf",
      subject: "Matematika",
      testCode: "MTH456",
      questionCount: 15,
      createdAt: "2026-02-05",
      status: "draft",
      completedCount: 0,
    },
    {
      id: "3",
      name: "Fizika - Mexanika 10-sinf",
      subject: "Fizika",
      testCode: "PHY789",
      questionCount: 25,
      timeLimit: 45,
      createdAt: "2026-02-08",
      status: "published",
      completedCount: 8,
      averageScore: 72,
    },
  ]);

  const filteredTests = tests.filter(
    (test) =>
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTest = () => {
    router.push("/admin/tests/create");
  };

  const handleEditTest = (testId: string) => {
    router.push(`/admin/tests/${testId}/edit`);
  };

  const handleViewResults = (testId: string) => {
    router.push(`/admin/tests/${testId}/results`);
  };

  const handleDuplicateTest = (test: Test) => {
    const newTest = {
      ...test,
      id: Date.now().toString(),
      name: `${test.name} (nusxa)`,
      testCode: generateTestCode(),
      status: "draft" as const,
      completedCount: 0,
      averageScore: undefined,
    };
    setTests([newTest, ...tests]);
  };

  const handleDeleteTest = () => {
    if (testToDelete) {
      setTests(tests.filter((t) => t.id !== testToDelete));
      setIsDeleteDialogOpen(false);
      setTestToDelete(null);
    }
  };

  const generateTestCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Testlar</h1>
          <p className="text-muted-foreground">
            Testlar yaratish va boshqarish
          </p>
        </div>
        <Button onClick={handleCreateTest} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Yangi test yaratish
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Test nomi, fan yoki kod bilan qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-sm text-muted-foreground">Nashr etilgan</p>
              <p className="text-2xl font-bold">
                {tests.filter((t) => t.status === "published").length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Qoralama</p>
              <p className="text-2xl font-bold">
                {tests.filter((t) => t.status === "draft").length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ishtirokchilar</p>
              <p className="text-2xl font-bold">
                {tests.reduce((acc, t) => acc + t.completedCount, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Test topilmadi</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Qidiruv natijasi topilmadi"
                : "Hozircha testlar yo'q"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateTest}>
                <Plus className="w-4 h-4 mr-2" />
                Birinchi testni yaratish
              </Button>
            )}
          </Card>
        ) : (
          filteredTests.map((test) => (
            <Card key={test.id} className="p-6 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{test.name}</h3>
                        <Badge
                          variant={
                            test.status === "published" ? "default" : "secondary"
                          }
                        >
                          {test.status === "published"
                            ? "Nashr etilgan"
                            : "Qoralama"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
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
                            <span>O'rtacha: {test.averageScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-primary/10 px-4 py-2 rounded-lg">
                      <p className="text-xs text-muted-foreground">Test kodi</p>
                      <p className="text-lg font-bold text-primary">
                        {test.testCode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditTest(test.id)}
                    className="flex-1 lg:flex-none"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Tahrirlash
                  </Button>
                  {test.status === "published" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewResults(test.id)}
                      className="flex-1 lg:flex-none"
                    >
                      <BarChart className="w-4 h-4 mr-2" />
                      Natijalar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicateTest(test)}
                    className="flex-1 lg:flex-none"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Nusxa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setTestToDelete(test.id);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="flex-1 lg:flex-none"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    O'chirish
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
              >
                Bekor qilish
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTest}
                className="flex-1"
              >
                O'chirish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Eye, CheckCircle, Clock, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Test {
  id: string;
  title: string;
  subject: string;
  code: string;
  createdAt: string;
  totalQuestions: number;
  submissionsCount: number;
}

interface Submission {
  id: string;
  studentName: string;
  score: number;
  submittedAt: string;
  status: "checked" | "pending";
}

export default function StaffTestsPage() {
  const [tests, setTests] = useState<Test[]>([
    {
      id: "1",
      title: "Haftalik test #1",
      subject: "Ingliz tili",
      code: "ENG001",
      createdAt: "2026-02-08",
      totalQuestions: 20,
      submissionsCount: 8,
    },
    {
      id: "2",
      title: "Present Simple & Continuous",
      subject: "Ingliz tili",
      code: "ENG002",
      createdAt: "2026-02-01",
      totalQuestions: 15,
      submissionsCount: 12,
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subject: "Ingliz tili",
    questions: "",
  });

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateTest = () => {
    const newTest: Test = {
      id: Date.now().toString(),
      ...formData,
      code: generateCode(),
      createdAt: new Date().toISOString().split("T")[0],
      totalQuestions: 20,
      submissionsCount: 0,
    };
    setTests([newTest, ...tests]);
    setIsAddDialogOpen(false);
    setFormData({ title: "", subject: "Ingliz tili", questions: "" });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Kod nusxalandi!");
  };

  // Mock submissions data
  const submissions: Submission[] = [
    {
      id: "1",
      studentName: "Abdullayev Vali",
      score: 85,
      submittedAt: "2026-02-09 10:30",
      status: "checked",
    },
    {
      id: "2",
      studentName: "Karimov Ali",
      score: 92,
      submittedAt: "2026-02-09 11:15",
      status: "checked",
    },
    {
      id: "3",
      studentName: "Toshmatov Sardor",
      score: 0,
      submittedAt: "2026-02-09 14:20",
      status: "pending",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Haftalik Imtihonlar</h1>
          <p className="text-muted-foreground mt-2">
            Imtihon yaratish va natijalarni ko'rish
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Imtihon yaratish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi imtihon yaratish</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Imtihon nomi</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Haftalik test #1"
                />
              </div>
              <div>
                <Label>Fan</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Ingliz tili"
                />
              </div>
              <div>
                <Label>Savollar</Label>
                <Textarea
                  value={formData.questions}
                  onChange={(e) =>
                    setFormData({ ...formData, questions: e.target.value })
                  }
                  placeholder="Savollarni kiriting..."
                  rows={5}
                />
              </div>
              <Button onClick={handleCreateTest} className="w-full">
                Yaratish
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tests List */}
      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{test.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Fan:</p>
                    <p className="font-medium">{test.subject}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Imtihon kodi:</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-primary text-lg">{test.code}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(test.code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Savollar:</p>
                    <p className="font-medium">{test.totalQuestions} ta</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Topshirganlar:</p>
                    <p className="font-medium">{test.submissionsCount} ta</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Yaratilgan:</p>
                    <p className="font-medium">{test.createdAt}</p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedTest(test);
                  setIsViewDialogOpen(true);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* View Submissions Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTest?.title} - Natijalar
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="results" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Natijalar</TabsTrigger>
              <TabsTrigger value="pending">Tekshirish kerak</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="mt-4">
              <div className="space-y-3">
                {submissions
                  .filter((s) => s.status === "checked")
                  .map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between border rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">{submission.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.submittedAt}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="text-lg px-4 py-2">
                        {submission.score} ball
                      </Badge>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <div className="space-y-3">
                {submissions
                  .filter((s) => s.status === "pending")
                  .map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between border rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">{submission.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.submittedAt}
                          </p>
                        </div>
                      </div>
                      <Button size="sm">Tekshirish</Button>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

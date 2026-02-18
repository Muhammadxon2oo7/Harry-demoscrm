"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Upload,
  FileText,
  Music,
  BookOpen,
  PenLine,
  Headphones,
  Save,
  Loader2,
} from "lucide-react";
import { mockTestsApi } from "@/lib/api";
import { toast } from "sonner";

export default function AdminCreateTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // Reading
  const [readingFile, setReadingFile] = useState<File | null>(null);
  const [readingDuration, setReadingDuration] = useState("");
  const [readingQuestionCount, setReadingQuestionCount] = useState("");
  const readingRef = useRef<HTMLInputElement>(null);

  // Writing
  const [writingFile, setWritingFile] = useState<File | null>(null);
  const [writingDuration, setWritingDuration] = useState("");
  const [writingQuestionCount, setWritingQuestionCount] = useState("");
  const writingRef = useRef<HTMLInputElement>(null);

  // Listening
  const [listeningAudio, setListeningAudio] = useState<File | null>(null);
  const [listeningQuestionFile, setListeningQuestionFile] = useState<File | null>(null);
  const [listeningDuration, setListeningDuration] = useState("");
  const [listeningQuestionCount, setListeningQuestionCount] = useState("");
  const listeningAudioRef = useRef<HTMLInputElement>(null);
  const listeningQuestionRef = useRef<HTMLInputElement>(null);

  const isValid =
    title.trim() &&
    readingFile &&
    readingDuration &&
    readingQuestionCount &&
    writingFile &&
    writingDuration &&
    writingQuestionCount &&
    listeningAudio &&
    listeningQuestionFile &&
    listeningDuration &&
    listeningQuestionCount;

  const handleSave = async () => {
    if (!isValid) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("reading.file", readingFile!);
      formData.append("reading.duration", readingDuration);
      formData.append("reading.question_count", readingQuestionCount);
      formData.append("writing.file", writingFile!);
      formData.append("writing.duration", writingDuration);
      formData.append("writing.question_count", writingQuestionCount);
      formData.append("listening.audio_file", listeningAudio!);
      formData.append("listening.question_file", listeningQuestionFile!);
      formData.append("listening.duration", listeningDuration);
      formData.append("listening.question_count", listeningQuestionCount);
      await mockTestsApi.create(formData);
      toast.success("Test muvaffaqiyatli yaratildi");
      router.push("/admin/tests");
    } catch {
      toast.error("Test yaratishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/tests")} size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Yangi mock test yaratish</h1>
          <p className="text-sm text-muted-foreground">
            IELTS mock test — Reading, Writing va Listening fayllarini yuklang
          </p>
        </div>
      </div>

      {/* Test Title */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Test nomi
        </h2>
        <div className="space-y-2">
          <Label htmlFor="title">
            Test nomi <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Masalan: IELTS Practice Test #5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </Card>

      {/* Reading Section */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
          <BookOpen className="w-5 h-5" />
          Reading
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Reading fayli (PDF) <span className="text-red-500">*</span>
            </Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => readingRef.current?.click()}
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {readingFile ? readingFile.name : "Fayl tanlash"}
              </p>
            </div>
            <input
              ref={readingRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setReadingFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Davomiylik (daqiqa) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="60"
                value={readingDuration}
                onChange={(e) => setReadingDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Savollar soni <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="40"
                value={readingQuestionCount}
                onChange={(e) => setReadingQuestionCount(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Writing Section */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-green-600">
          <PenLine className="w-5 h-5" />
          Writing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Writing fayli (PDF) <span className="text-red-500">*</span>
            </Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-green-400 transition-colors"
              onClick={() => writingRef.current?.click()}
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {writingFile ? writingFile.name : "Fayl tanlash"}
              </p>
            </div>
            <input
              ref={writingRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setWritingFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Davomiylik (daqiqa) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="60"
                value={writingDuration}
                onChange={(e) => setWritingDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Tasklar soni (1 yoki 2) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="2"
                min="1"
                max="2"
                value={writingQuestionCount}
                onChange={(e) => setWritingQuestionCount(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Listening Section */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-purple-600">
          <Headphones className="w-5 h-5" />
          Listening
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Audio fayl <span className="text-red-500">*</span>
              </Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => listeningAudioRef.current?.click()}
              >
                <Music className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {listeningAudio ? listeningAudio.name : "Audio fayl tanlash"}
                </p>
              </div>
              <input
                ref={listeningAudioRef}
                type="file"
                accept="audio/*,.mp3,.mp4,.wav"
                className="hidden"
                onChange={(e) => setListeningAudio(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Savollar fayli (PDF) <span className="text-red-500">*</span>
              </Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => listeningQuestionRef.current?.click()}
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {listeningQuestionFile ? listeningQuestionFile.name : "Fayl tanlash"}
                </p>
              </div>
              <input
                ref={listeningQuestionRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setListeningQuestionFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Davomiylik (daqiqa) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="30"
                value={listeningDuration}
                onChange={(e) => setListeningDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Savollar soni <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="40"
                value={listeningQuestionCount}
                onChange={(e) => setListeningQuestionCount(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/tests")}
          disabled={saving}
        >
          Bekor qilish
        </Button>
        <Button onClick={handleSave} disabled={!isValid || saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Testni saqlash
        </Button>
      </div>
    </div>
  );
}


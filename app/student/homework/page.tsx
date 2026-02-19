"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileDown,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { homeworkApi, type HomeworkRecord } from "@/lib/api";

const API_HOST = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.harry-potter.uz/api/v1"
).replace(/\/api\/v1.*$/, "");

function getFileUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_HOST}${path.startsWith("/") ? "" : "/"}${path}`;
}

function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path);
}

export default function StudentHomeworkPage() {
  const [homeworks, setHomeworks] = useState<HomeworkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    homeworkApi
      .myHomework()
      .then((data) => {
        // Sort newest first
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setHomeworks(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const activeCount = homeworks.filter((h) => isToday(h.created_at)).length;
  const expiredCount = homeworks.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Uyga vazifalar</h1>
        <p className="text-muted-foreground mt-1">
          Berilgan barcha vazifalar ro&apos;yxati
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{homeworks.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Jami</p>
        </div>
        <div className="rounded-xl border bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Faol</p>
        </div>
        <div className="rounded-xl border bg-muted/40 p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{expiredCount}</p>
          <p className="text-xs text-muted-foreground mt-1">O&apos;tgan</p>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <p className="text-muted-foreground animate-pulse">Yuklanmoqda...</p>
      ) : homeworks.length === 0 ? (
        <div className="rounded-xl border p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Hozircha vazifalar yo&apos;q</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-0">
            {homeworks.map((homework) => {
              const isActive = isToday(homework.created_at);
              const fileUrl = homework.file ? getFileUrl(homework.file) : null;
              const isImg = fileUrl ? isImage(fileUrl) : false;

              return (
                <div key={homework.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Timeline dot */}
                  <div className="relative z-10 shrink-0 mt-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        isActive
                          ? "bg-green-50 border-green-500"
                          : "bg-muted border-border"
                      }`}
                    >
                      {isActive ? (
                        <Clock className="w-5 h-5 text-green-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 rounded-xl border p-4 space-y-3 transition-all ${
                      isActive
                        ? "bg-green-50/50 border-green-200 shadow-sm"
                        : "bg-muted/20 opacity-70"
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`font-semibold leading-snug ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {homework.text}
                      </p>
                      {isActive ? (
                        <Badge className="bg-green-500 shrink-0">Faol</Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">
                          O&apos;tgan
                        </Badge>
                      )}
                    </div>

                    {/* File */}
                    {fileUrl && (
                      <div className="flex flex-wrap items-center gap-2">
                        {isImg && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreview(fileUrl)}
                            className="gap-1.5 h-8"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Ko&apos;rish
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="gap-1.5 h-8"
                        >
                          <a
                            href={fileUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            Yuklab olish
                          </a>
                        </Button>
                        <span className="text-xs text-muted-foreground truncate max-w-45">
                          {homework.file?.split("/").pop()}
                        </span>
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{fmtDate(homework.created_at)}</span>
                      {isActive && (
                        <span className="ml-2 text-green-600 font-medium">
                          · Keyingi darsga qadar faol
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setPreview(null)}
            >
              <X className="w-7 h-7" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="preview"
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-3 flex justify-center">
              <Button asChild variant="secondary" size="sm">
                <a href={preview} download target="_blank" rel="noreferrer">
                  <FileDown className="w-4 h-4 mr-2" />
                  Yuklab olish
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

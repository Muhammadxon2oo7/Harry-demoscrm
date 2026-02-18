"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, CheckCircle, Clock } from "lucide-react";
import { homeworkApi, type HomeworkRecord } from "@/lib/api";

export default function StudentHomeworkPage() {
  const [homeworks, setHomeworks] = useState<HomeworkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homeworkApi
      .myHomework()
      .then(setHomeworks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const getStatus = (hw: HomeworkRecord) => {
    // homework doesn't have a deadline field — we use created_at age as indicator
    return "pending" as const;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Bajarilgan</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Faol</Badge>;
      case "overdue":
        return <Badge variant="destructive">Muddati o&apos;tgan</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Uyga vazifalar</h1>
        <p className="text-muted-foreground mt-2">Berilgan barcha vazifalar ro&apos;yxati</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami vazifalar</p>
              <h3 className="text-2xl font-bold mt-2">{homeworks.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">So&apos;nggi 7 kun</p>
              <h3 className="text-2xl font-bold mt-2">
                {
                  homeworks.filter((h) => {
                    const d = new Date(h.created_at);
                    return now.getTime() - d.getTime() < 7 * 24 * 3600 * 1000;
                  }).length
                }
              </h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Homework List */}
      {loading ? (
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      ) : homeworks.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Hozircha vazifalar yo&apos;q</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {homeworks.map((homework) => {
            const status = getStatus(homework);
            return (
              <Card key={homework.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    {getStatusIcon(status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold">{homework.text}</p>
                        {homework.file && (
                          <a
                            href={homework.file}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-primary underline mt-1 block"
                          >
                            Fayl ko&apos;rish
                          </a>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(homework.created_at).toLocaleDateString("uz-UZ")}</span>
                        </div>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

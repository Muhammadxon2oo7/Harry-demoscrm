"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle } from "lucide-react";
import { mockSessionsApi, examsApi, type TestSession } from "@/lib/api";

export default function StudentTestsPage() {
  const [testCode, setTestCode] = useState("");
  const [isEnterCodeOpen, setIsEnterCodeOpen] = useState(false);
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [enteringCode, setEnteringCode] = useState(false);

  useEffect(() => {
    mockSessionsApi
      .me()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleEnterCode = async () => {
    if (!testCode.trim()) return;
    setEnteringCode(true);
    try {
      await examsApi.enterCode(testCode.trim());
      setIsEnterCodeOpen(false);
      setTestCode("");
      const updated = await mockSessionsApi.me();
      setSessions(updated);
    } catch (err) {
      console.error(err);
      alert("Noto'g'ri kod yoki imtihon topilmadi");
    } finally {
      setEnteringCode(false);
    }
  };

  const completedSessions = sessions.filter((s) => s.is_completed || s.is_finished);
  const avgScore =
    completedSessions.length
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.score?.score || 0), 0) /
            completedSessions.length
        )
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Imtihonlar</h1>
          <p className="text-muted-foreground mt-2">Imtihonlar va natijalaringiz</p>
        </div>
        <Dialog open={isEnterCodeOpen} onOpenChange={setIsEnterCodeOpen}>
          <DialogTrigger asChild>
            <Button>
              <ClipboardList className="w-4 h-4 mr-2" />
              Imtihon topshirish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Imtihon kodini kiriting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Imtihon kodi</Label>
                <Input
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                  placeholder="ENG001"
                  className="text-lg font-mono uppercase"
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  O&apos;qituvchi bergan kodni kiriting
                </p>
              </div>
              <Button onClick={handleEnterCode} className="w-full" disabled={enteringCode}>
                {enteringCode ? "Tekshirilmoqda..." : "Imtihonga kirish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami imtihonlar</p>
              <h3 className="text-2xl font-bold mt-2">{sessions.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">O&apos;rtacha ball</p>
              <h3 className="text-2xl font-bold mt-2">{avgScore}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Sessions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Imtihon natijalari</h2>
        {loading ? (
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        ) : sessions.length === 0 ? (
          <p className="text-muted-foreground">Hozircha imtihonlar yo&apos;q</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const score = session.score?.score;
              const testName =
                typeof session.test === "object" && session.test
                  ? session.test.title
                  : session.test || "Imtihon";
              const group =
                typeof session.user === "object" && session.user?.group
                  ? session.user.group.name
                  : "";
              const date = new Date(session.started_at).toLocaleDateString("uz-UZ");
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle
                        className={`w-5 h-5 ${session.is_completed ? "text-green-600" : "text-yellow-600"}`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{String(testName)}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {group && <span>{group}</span>}
                        <span>•</span>
                        <span>{date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {score != null ? (
                      <>
                        <p className="text-2xl font-bold text-primary">{score}</p>
                        {score >= 30 ? (
                          <Badge className="bg-green-500 mt-1">A&apos;lo</Badge>
                        ) : score >= 20 ? (
                          <Badge className="bg-blue-500 mt-1">Yaxshi</Badge>
                        ) : (
                          <Badge className="bg-yellow-500 mt-1">Qoniqarli</Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary">
                        {session.is_finished ? "Baholash kutilmoqda" : "Davom etmoqda"}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}


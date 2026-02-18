"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, BarChart2 } from "lucide-react";
import { scoresApi, attendanceApi, studentsApi, type ScoreRecord, type AttendanceRecord, type UserProfile } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface RankedStudent {
  id: number;
  name: string;
  score: number;
  attendance: number;
}

export default function StudentRatingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ranked, setRanked] = useState<RankedStudent[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [myAttendance, setMyAttendance] = useState(0);
  const [myRank, setMyRank] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [scores, attendance] = await Promise.all([
          scoresApi.list(),
          attendanceApi.list(),
        ]);

        // Aggregate scores per student
        const scoreMap: Record<number, number[]> = {};
        scores.forEach((s: ScoreRecord) => {
          const sid = typeof s.student === "object" ? s.student.id : (s as unknown as { student: number }).student;
          if (!scoreMap[sid]) scoreMap[sid] = [];
          scoreMap[sid].push(s.score);
        });

        // Aggregate attendance per student
        const attMap: Record<number, { total: number; present: number }> = {};
        attendance.forEach((a: AttendanceRecord) => {
          const sid = typeof a.student === "object" ? a.student.id : (a as unknown as { student: number }).student;
          if (!attMap[sid]) attMap[sid] = { total: 0, present: 0 };
          attMap[sid].total++;
          if (a.status === "keldi" || a.status === "kechikdi") attMap[sid].present++;
        });

        // Build ranking from students who have scores
        const allIds = Array.from(new Set([...Object.keys(scoreMap), ...Object.keys(attMap)].map(Number)));

        // Get student profiles
        const students = await studentsApi.list();
        const studentMap: Record<number, UserProfile> = {};
        students.forEach((s) => (studentMap[s.id] = s));

        const records: RankedStudent[] = allIds
          .map((id) => {
            const scrs = scoreMap[id] || [];
            const avg = scrs.length ? Math.round(scrs.reduce((a, b) => a + b, 0) / scrs.length) : 0;
            const att = attMap[id];
            const attPct = att ? Math.round((att.present / att.total) * 100) : 0;
            const profile = studentMap[id];
            return {
              id,
              name: profile ? `${profile.first_name} ${profile.last_name}`.trim() || profile.username : `O'quvchi ${id}`,
              score: avg,
              attendance: attPct,
            };
          })
          .sort((a, b) => b.score - a.score);

        setRanked(records);

        if (user?.id) {
          const myIdx = records.findIndex((r) => r.id === user.id);
          if (myIdx !== -1) {
            setMyScore(records[myIdx].score);
            setMyAttendance(records[myIdx].attendance);
            setMyRank(myIdx + 1);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-semibold">{rank}</span>;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mening reytingim</h1>
        <p className="text-muted-foreground mt-2">Guruhidagi o&apos;rningiz</p>
      </div>

      {/* My Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-2 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mening o&apos;rnim</p>
              <h3 className="text-3xl font-bold mt-2 text-primary">#{myRank || "—"}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">O&apos;rtacha ballim</p>
              <h3 className="text-3xl font-bold mt-2 text-green-600">{myScore}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <BarChart2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Davomatim</p>
              <h3 className="text-3xl font-bold mt-2 text-blue-600">{myAttendance}%</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Full Rating */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Guruh reytingi</h2>
        {loading ? (
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        ) : ranked.length === 0 ? (
          <p className="text-muted-foreground">Ma&apos;lumotlar yo&apos;q</p>
        ) : (
          <div className="space-y-4">
            {ranked.map((student, idx) => {
              const rank = idx + 1;
              const isMe = student.id === user?.id;
              return (
                <div
                  key={student.id}
                  className={`flex items-center justify-between border-b pb-4 last:border-0 ${
                    isMe ? "bg-primary/5 -mx-6 px-6 py-4 rounded-lg" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {student.name}{isMe ? " (Siz)" : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Davomat: {student.attendance}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{student.score}</p>
                    <p className="text-xs text-muted-foreground">ball</p>
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

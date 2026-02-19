"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Medal, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupsApi, studentsApi, scoresApi, attendanceApi, type Group, type UserProfile } from "@/lib/api";

interface GroupRating {
  id: number;
  groupName: string;
  averageScore: number;
  studentsCount: number;
}

interface StudentRating {
  id: number;
  studentName: string;
  score: number;
  attendance: number;
}

export default function StaffRatingPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupRatings, setGroupRatings] = useState<GroupRating[]>([]);
  const [studentRatings, setStudentRatings] = useState<StudentRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [grps, scores, attendance] = await Promise.all([
          groupsApi.list(),
          scoresApi.list(),
          attendanceApi.list(),
        ]);
        setGroups(grps);

        // Build group ratings
        const scoresByGroup: Record<number, number[]> = {};
        scores.forEach((s) => {
          const gid = typeof s.group === "object" ? s.group.id : (s as unknown as { group: number }).group;
          if (!scoresByGroup[gid]) scoresByGroup[gid] = [];
          scoresByGroup[gid].push(s.score);
        });

        const ratings: GroupRating[] = grps.map((g) => ({
          id: g.id,
          groupName: g.name,
          averageScore: scoresByGroup[g.id]?.length
            ? Math.round(scoresByGroup[g.id].reduce((a, b) => a + b, 0) / scoresByGroup[g.id].length)
            : 0,
          studentsCount: g.students_count,
        })).sort((a, b) => b.averageScore - a.averageScore);
        setGroupRatings(ratings);

        if (grps.length > 0) setSelectedGroup(String(grps[0].id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    async function loadStudents() {
      try {
        const [studs, scores, attendance] = await Promise.all([
          studentsApi.list(Number(selectedGroup)),
          scoresApi.list(),
          attendanceApi.list(),
        ]);

        const scoreMap: Record<number, number[]> = {};
        scores.forEach((s) => {
          const gid = typeof s.group === "object" ? s.group.id : (s as unknown as { group: number }).group;
          if (String(gid) !== selectedGroup) return;
          const sid = typeof s.student === "object" ? s.student.id : (s as unknown as { student: number }).student;
          if (!scoreMap[sid]) scoreMap[sid] = [];
          scoreMap[sid].push(s.score);
        });

        const attMap: Record<number, { total: number; present: number }> = {};
        attendance.forEach((a) => {
          const gid = typeof a.group === "object" ? a.group.id : (a as unknown as { group: number }).group;
          if (String(gid) !== selectedGroup) return;
          const sid = typeof a.student === "object" ? a.student.id : (a as unknown as { student: number }).student;
          if (!attMap[sid]) attMap[sid] = { total: 0, present: 0 };
          attMap[sid].total++;
          if (a.status === "keldi" || a.status === "kechikdi") attMap[sid].present++;
        });

        const rated: StudentRating[] = studs.map((s) => {
          const scrs = scoreMap[s.id] || [];
          const avg = scrs.length ? Math.round(scrs.reduce((a, b) => a + b, 0) / scrs.length) : 0;
          const att = attMap[s.id];
          const attPct = att ? Math.round((att.present / att.total) * 100) : 0;
          return {
            id: s.id,
            studentName: `${s.first_name} ${s.last_name}`.trim() || s.username,
            score: avg,
            attendance: attPct,
          };
        }).sort((a, b) => b.score - a.score);

        setStudentRatings(rated);
      } catch (err) {
        console.error(err);
      }
    }
    loadStudents();
  }, [selectedGroup]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-semibold">{rank}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reyting</h1>
        <p className="text-muted-foreground mt-2">Guruhlar va o&apos;quvchilar reytingi</p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Umumiy reyting</TabsTrigger>
          <TabsTrigger value="students">Guruh reytingi</TabsTrigger>
        </TabsList>

        {/* ALL GROUPS RATING */}
        <TabsContent value="groups" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Barcha guruhlar reytingi</h2>
            {loading ? (
              <p className="text-muted-foreground">Yuklanmoqda...</p>
            ) : (
              <div className="space-y-4">
                {groupRatings.map((group, idx) => (
                  <div key={group.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {getRankIcon(idx + 1)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{group.groupName}</h3>
                      <p className="text-sm text-muted-foreground">{group.studentsCount} ta o&apos;quvchi</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{group.averageScore}</p>
                      <p className="text-sm text-muted-foreground">O&apos;rtacha ball</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* STUDENTS IN GROUP RATING */}
        <TabsContent value="students" className="mt-6">
          <Card className="p-4 mb-6">
            <label className="text-sm font-medium mb-2 block">Guruhni tanlang</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {groups.find((g) => String(g.id) === selectedGroup)?.name} — O&apos;quvchilar reytingi
            </h2>
            {studentRatings.length === 0 ? (
              <p className="text-muted-foreground">Ma&apos;lumotlar yo&apos;q</p>
            ) : (
              <div className="space-y-4">
                {studentRatings.map((student, idx) => (
                  <div key={student.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {getRankIcon(idx + 1)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{student.studentName}</h4>
                      </div>
                    </div>
                    <div className="flex gap-8 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Ball</p>
                        <p className="text-lg font-semibold text-primary">{student.score}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Davomat</p>
                        <p className="text-lg font-semibold text-green-600">{student.attendance}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


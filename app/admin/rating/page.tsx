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
import { groupsApi, studentsApi, scoresApi, attendanceApi, subjectsApi, type Group } from "@/lib/api";

interface GroupRating {
  id: number;
  groupName: string;
  subjectName: string;
  averageScore: number;
  studentsCount: number;
  teacherName: string;
}

interface StudentRating {
  id: number;
  studentName: string;
  groupName: string;
  score: number;
  attendance: number;
}

export default function AdminRatingPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupRatings, setGroupRatings] = useState<GroupRating[]>([]);
  const [studentRatings, setStudentRatings] = useState<StudentRating[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [grps, scores, attendance, studs, subs] = await Promise.all([
          groupsApi.list(),
          scoresApi.list(),
          attendanceApi.list(),
          studentsApi.list(),
          subjectsApi.list(),
        ]);

        setGroups(grps);
        setSubjects(subs);

        // Build score map by group
        const scoreMap: Record<number, number[]> = {};
        scores.forEach((s) => {
          const gid = typeof s.group === "object" ? s.group.id : (s as unknown as { group: number }).group;
          if (!scoreMap[gid]) scoreMap[gid] = [];
          scoreMap[gid].push(s.score);
        });

        // Build attendance map by group+student
        const attMap: Record<string, { total: number; present: number }> = {};
        attendance.forEach((a) => {
          const gid = typeof a.group === "object" ? a.group.id : (a as unknown as { group: number }).group;
          const sid = typeof a.student === "object" ? a.student.id : (a as unknown as { student: number }).student;
          const key = `${gid}_${sid}`;
          if (!attMap[key]) attMap[key] = { total: 0, present: 0 };
          attMap[key].total++;
          if (a.status === "keldi" || a.status === "kechikdi") attMap[key].present++;
        });

        const ratings: GroupRating[] = grps.map((g) => ({
          id: g.id,
          groupName: g.name,
          subjectName: g.subject_name || "",
          averageScore: scoreMap[g.id]?.length
            ? Math.round((scoreMap[g.id].reduce((a, b) => a + b, 0) / scoreMap[g.id].length) * 10) / 10
            : 0,
          studentsCount: g.students_count,
          teacherName: (g as unknown as { employee_name?: string }).employee_name || "",
        })).sort((a, b) => b.averageScore - a.averageScore);
        setGroupRatings(ratings);

        // Build student ratings (all students with their group context)
        const scoreByStudent: Record<number, { scores: number[]; groupId: number }> = {};
        scores.forEach((s) => {
          const sid = typeof s.student === "object" ? s.student.id : (s as unknown as { student: number }).student;
          const gid = typeof s.group === "object" ? s.group.id : (s as unknown as { group: number }).group;
          if (!scoreByStudent[sid]) scoreByStudent[sid] = { scores: [], groupId: gid };
          scoreByStudent[sid].scores.push(s.score);
        });

        const studRatings: StudentRating[] = studs.map((s) => {
          const info = scoreByStudent[s.id];
          const avg = info ? Math.round(info.scores.reduce((a, b) => a + b, 0) / info.scores.length) : 0;
          const gid = s.group ? (typeof s.group === "object" ? s.group.id : s.group) : 0;
          const attKey = `${gid}_${s.id}`;
          const att = attMap[attKey];
          const attPct = att ? Math.round((att.present / att.total) * 100) : 0;
          const groupName = grps.find((g) => g.id === gid)?.name || "";
          return {
            id: s.id,
            studentName: `${s.first_name} ${s.last_name}`.trim() || s.username,
            groupName,
            score: avg,
            attendance: attPct,
          };
        }).sort((a, b) => b.score - a.score);
        setStudentRatings(studRatings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredGroupRatings = groupRatings.filter((gr) => {
    if (selectedSubject === "all") return true;
    const sub = subjects.find((s) => String(s.id) === selectedSubject);
    return sub?.name === gr.subjectName;
  });

  const filteredStudentRatings = studentRatings.filter((sr) => {
    if (selectedGroup === "all") return true;
    return String(groups.find((g) => g.name === sr.groupName)?.id) === selectedGroup;
  });

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
        <h1 className="text-3xl font-bold text-foreground">Reyting tizimi</h1>
        <p className="text-muted-foreground mt-2">Guruhlar va o&apos;quvchilar reytingi</p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Guruhlar reytingi</TabsTrigger>
          <TabsTrigger value="students">O&apos;quvchilar reytingi</TabsTrigger>
        </TabsList>

        {/* GROUPS RATING */}
        <TabsContent value="groups" className="mt-6">
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Fan bo&apos;yicha filter</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fanni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha fanlar</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {loading ? (
            <p className="text-muted-foreground">Yuklanmoqda...</p>
          ) : (
            <div className="grid gap-4">
              {filteredGroupRatings.map((group, index) => (
                <Card key={group.id} className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{group.groupName}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fan:</p>
                          <p className="font-medium">{group.subjectName || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">O&apos;qituvchi:</p>
                          <p className="font-medium">{group.teacherName || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">O&apos;quvchilar:</p>
                          <p className="font-medium">{group.studentsCount} ta</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">O&apos;rtacha ball:</p>
                          <p className="font-medium text-lg text-primary">{group.averageScore}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* STUDENTS RATING */}
        <TabsContent value="students" className="mt-6">
          <Card className="p-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Guruh bo&apos;yicha filter</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Guruhni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha guruhlar</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.name} {g.subject_name ? `— ${g.subject_name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-6">
            {loading ? (
              <p className="text-muted-foreground">Yuklanmoqda...</p>
            ) : (
              <div className="space-y-4">
                {filteredStudentRatings.map((student, idx) => (
                  <div key={student.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {getRankIcon(idx + 1)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{student.studentName}</h4>
                        <p className="text-sm text-muted-foreground">{student.groupName}</p>
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


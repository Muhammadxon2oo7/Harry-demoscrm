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
import { Trophy, Medal, Award, Users, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  groupsApi,
  studentsApi,
  subjectsApi,
  type GroupRating,
  type StudentRating,
} from "@/lib/api";

export default function AdminRatingPage() {
  const [groupRatings, setGroupRatings] = useState<GroupRating[]>([]);
  const [studentRatings, setStudentRatings] = useState<StudentRating[]>([]);
  const [groups, setGroups] = useState<{ id: number; name: string; subject_name?: string | null }[]>([]);
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Load group ratings + groups list + subjects list
  useEffect(() => {
    async function load() {
      try {
        const [ratings, grps, subs] = await Promise.all([
          groupsApi.rating(),
          groupsApi.list(),
          subjectsApi.list(),
        ]);
        setGroupRatings(ratings);
        setGroups(grps.map((g) => ({ id: g.id, name: g.name, subject_name: g.subject_name })));
        setSubjects(subs);
        if (grps.length > 0) setSelectedGroup(String(grps[0].id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGroups(false);
      }
    }
    load();
  }, []);

  // Load student ratings when selected group changes
  useEffect(() => {
    if (!selectedGroup) return;
    setLoadingStudents(true);
    studentsApi
      .rating(Number(selectedGroup))
      .then(setStudentRatings)
      .catch(console.error)
      .finally(() => setLoadingStudents(false));
  }, [selectedGroup]);

  const filteredGroupRatings = groupRatings.filter((g) => {
    if (selectedSubject === "all") return true;
    const sub = subjects.find((s) => String(s.id) === selectedSubject);
    return sub ? g.subject_name === sub.name : true;
  });

  const maxGroupScore = filteredGroupRatings[0]?.total_score || 1;
  const maxStudentScore = studentRatings[0]?.total_score || 1;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return (
      <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    );
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800";
    if (rank === 2) return "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700";
    if (rank === 3) return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800";
    return "bg-card border-border";
  };

  const selectedGroupName = groups.find((g) => String(g.id) === selectedGroup)?.name || "";

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reyting tizimi</h1>
        <p className="text-muted-foreground mt-2">Guruhlar va o&apos;quvchilar reytingi</p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Guruhlar reytingi</TabsTrigger>
          <TabsTrigger value="students">O&apos;quvchilar reytingi</TabsTrigger>
        </TabsList>

        {/* ── GROUPS RATING ── */}
        <TabsContent value="groups" className="mt-6 space-y-4">
          {/* Filter */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
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
              <div className="text-sm text-muted-foreground mt-5">
                {filteredGroupRatings.length} ta guruh
              </div>
            </div>
          </Card>

          {/* List */}
          {loadingGroups ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredGroupRatings.length === 0 ? (
            <Card className="p-12 text-center">
              <Star className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Reyting ma&apos;lumotlari yo&apos;q</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredGroupRatings.map((group) => (
                <Card
                  key={group.id}
                  className={`p-5 border ${getRankBg(group.rank)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-background border flex items-center justify-center shrink-0">
                      {getRankIcon(group.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-foreground">{group.name}</h3>
                        {group.subject_name && (
                          <Badge variant="secondary" className="text-xs">
                            {group.subject_name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress
                          value={(group.total_score / maxGroupScore) * 100}
                          className="h-2 flex-1"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {group.total_score} ball
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-primary">{group.total_score}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end mt-0.5">
                        <Users className="w-3 h-3" />
                        {group.students_count} ta
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── STUDENTS RATING ── */}
        <TabsContent value="students" className="mt-6 space-y-4">
          {/* Group selector */}
          <Card className="p-4">
            <label className="text-sm font-medium mb-2 block">Guruh bo&apos;yicha filter</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Guruhni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name}
                    {g.subject_name ? ` — ${g.subject_name}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* List */}
          <Card className="p-6">
            {selectedGroupName && (
              <h2 className="text-lg font-semibold mb-4">
                {selectedGroupName} — O&apos;quvchilar reytingi
              </h2>
            )}
            {loadingStudents ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : studentRatings.length === 0 ? (
              <div className="text-center py-10">
                <Star className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">Bu guruhda reyting ma&apos;lumotlari yo&apos;q</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentRatings.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${getRankBg(student.rank)}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center shrink-0">
                      {getRankIcon(student.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {student.first_name || student.last_name
                          ? `${student.first_name} ${student.last_name}`.trim()
                          : student.username}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Progress
                          value={(student.total_score / maxStudentScore) * 100}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {student.total_score} ball
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-primary">{student.total_score}</p>
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

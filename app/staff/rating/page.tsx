"use client";

import React, { useState } from "react";
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

interface GroupRating {
  id: string;
  groupName: string;
  averageScore: number;
  studentsCount: number;
  rank: number;
}

interface StudentRating {
  id: string;
  studentName: string;
  score: number;
  attendance: number;
  rank: number;
}

export default function StaffRatingPage() {
  const [selectedGroup, setSelectedGroup] = useState("1");

  const myGroups = [
    { id: "1", name: "Beginner A1" },
    { id: "2", name: "Advanced C1" },
  ];

  // All groups rating (subject-wide)
  const allGroupsRating: GroupRating[] = [
    { id: "1", groupName: "Beginner A1", averageScore: 87.5, studentsCount: 12, rank: 2 },
    { id: "2", groupName: "Advanced C1", averageScore: 92.3, studentsCount: 8, rank: 1 },
    { id: "3", groupName: "Intermediate B1", averageScore: 85.0, studentsCount: 15, rank: 3 },
  ];

  // Students in selected group
  const studentsInGroup: { [key: string]: StudentRating[] } = {
    "1": [
      { id: "1", studentName: "Abdullayev Vali", score: 95, attendance: 98, rank: 1 },
      { id: "2", studentName: "Karimov Ali", score: 88, attendance: 92, rank: 2 },
      { id: "3", studentName: "Toshmatov Sardor", score: 82, attendance: 89, rank: 3 },
      { id: "4", studentName: "Usmanova Nigora", score: 78, attendance: 85, rank: 4 },
      { id: "5", studentName: "Rahimov Akmal", score: 74, attendance: 80, rank: 5 },
    ],
    "2": [
      { id: "1", studentName: "Saidov Timur", score: 96, attendance: 100, rank: 1 },
      { id: "2", studentName: "Nazarova Madina", score: 90, attendance: 95, rank: 2 },
      { id: "3", studentName: "Qodirov Jasur", score: 88, attendance: 92, rank: 3 },
    ],
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-semibold">
            {rank}
          </span>
        );
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reyting</h1>
        <p className="text-muted-foreground mt-2">
          Guruhlar va o'quvchilar reytingi
        </p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Umumiy reyting</TabsTrigger>
          <TabsTrigger value="students">Guruh reytingi</TabsTrigger>
        </TabsList>

        {/* ALL GROUPS RATING */}
        <TabsContent value="groups" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ingliz tili bo'yicha barcha guruhlar</h2>
            <div className="space-y-4">
              {allGroupsRating.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center gap-4 border-b pb-4 last:border-0"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {getRankIcon(group.rank)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{group.groupName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {group.studentsCount} ta o'quvchi
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {group.averageScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">O'rtacha ball</p>
                  </div>
                </div>
              ))}
            </div>
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
                {myGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {myGroups.find((g) => g.id === selectedGroup)?.name} - O'quvchilar reytingi
            </h2>
            <div className="space-y-4">
              {studentsInGroup[selectedGroup]?.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getRankIcon(student.rank)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{student.studentName}</h4>
                    </div>
                  </div>
                  <div className="flex gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Ball</p>
                      <p className="text-lg font-semibold text-primary">{student.score}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Davomat</p>
                      <p className="text-lg font-semibold text-green-600">
                        {student.attendance}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
  subjectName: string;
  averageScore: number;
  studentsCount: number;
  teacherName: string;
}

interface StudentRating {
  id: string;
  studentName: string;
  groupName: string;
  score: number;
  attendance: number;
  rank: number;
}

export default function AdminRatingPage() {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");

  // Mock data
  const subjects = [
    { id: "1", name: "Ingliz tili" },
    { id: "2", name: "Matematika" },
    { id: "3", name: "Fizika" },
  ];

  const groupRatings: GroupRating[] = [
    {
      id: "1",
      groupName: "Beginner A1",
      subjectName: "Ingliz tili",
      averageScore: 87.5,
      studentsCount: 12,
      teacherName: "Aliyev Jasur",
    },
    {
      id: "2",
      groupName: "Advanced C1",
      subjectName: "Ingliz tili",
      averageScore: 92.3,
      studentsCount: 8,
      teacherName: "Aliyev Jasur",
    },
    {
      id: "3",
      groupName: "Boshlang'ich",
      subjectName: "Matematika",
      averageScore: 85.0,
      studentsCount: 15,
      teacherName: "Karimova Dilnoza",
    },
  ];

  const studentRatings: StudentRating[] = [
    {
      id: "1",
      studentName: "Abdullayev Vali",
      groupName: "Beginner A1",
      score: 95,
      attendance: 98,
      rank: 1,
    },
    {
      id: "2",
      studentName: "Karimov Ali",
      groupName: "Beginner A1",
      score: 88,
      attendance: 92,
      rank: 2,
    },
    {
      id: "3",
      studentName: "Toshmatov Sardor",
      groupName: "Beginner A1",
      score: 82,
      attendance: 89,
      rank: 3,
    },
    {
      id: "4",
      studentName: "Usmanova Nigora",
      groupName: "Advanced C1",
      score: 96,
      attendance: 100,
      rank: 1,
    },
    {
      id: "5",
      studentName: "Rahimov Akmal",
      groupName: "Advanced C1",
      score: 90,
      attendance: 95,
      rank: 2,
    },
  ];

  const filteredGroupRatings = groupRatings.filter((gr) => {
    if (selectedSubject === "all") return true;
    return subjects.find((s) => s.id === selectedSubject)?.name === gr.subjectName;
  });

  const filteredStudentRatings = studentRatings.filter((sr) => {
    if (selectedGroup === "all") return true;
    return sr.groupName === selectedGroup;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-semibold">{rank}</span>;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reyting tizimi</h1>
        <p className="text-muted-foreground mt-2">
          Guruhlar va o'quvchilar reytingi
        </p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Guruhlar reytingi</TabsTrigger>
          <TabsTrigger value="students">O'quvchilar reytingi</TabsTrigger>
        </TabsList>

        {/* GROUPS RATING */}
        <TabsContent value="groups" className="mt-6">
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Fan bo'yicha filter</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fanni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha fanlar</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            {filteredGroupRatings
              .sort((a, b) => b.averageScore - a.averageScore)
              .map((group, index) => (
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
                          <p className="font-medium">{group.subjectName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">O'qituvchi:</p>
                          <p className="font-medium">{group.teacherName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">O'quvchilar:</p>
                          <p className="font-medium">{group.studentsCount} ta</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">O'rtacha ball:</p>
                          <p className="font-medium text-lg text-primary">
                            {group.averageScore}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* STUDENTS RATING */}
        <TabsContent value="students" className="mt-6">
          <Card className="p-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Guruh bo'yicha filter</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Guruhni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha guruhlar</SelectItem>
                  {groupRatings.map((group) => (
                    <SelectItem key={group.id} value={group.groupName}>
                      {group.groupName} - {group.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              {filteredStudentRatings.map((student) => (
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
                      <p className="text-sm text-muted-foreground">{student.groupName}</p>
                    </div>
                  </div>
                  <div className="flex gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Ball</p>
                      <p className="text-lg font-semibold text-primary">{student.score}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Davomat</p>
                      <p className="text-lg font-semibold text-green-600">{student.attendance}%</p>
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

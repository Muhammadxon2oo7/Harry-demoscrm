"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock, Calendar, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subject {
  id: string;
  name: string;
  description: string;
  groupsCount: number;
}

interface Group {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  days: string[];
  startTime: string;
  endTime: string;
  studentsCount: number;
}

const weekDays = [
  { value: "Mon", label: "Dush", icon: "D" },
  { value: "Tue", label: "Sesh", icon: "S" },
  { value: "Wed", label: "Chor", icon: "C" },
  { value: "Thu", label: "Pay", icon: "P" },
  { value: "Fri", label: "Juma", icon: "J" },
  { value: "Sat", label: "Shan", icon: "Sh" },
  { value: "Sun", label: "Yak", icon: "Y" },
];

export default function StaffSubjectsPage() {
  const router = useRouter();

  const [subjects] = useState<Subject[]>([
    { id: "1", name: "Ingliz tili", description: "English language courses", groupsCount: 3 },
    { id: "2", name: "Matematika", description: "Mathematics courses", groupsCount: 2 },
    { id: "3", name: "Fizika", description: "Physics courses", groupsCount: 1 },
  ]);

  const [groups] = useState<Group[]>([
    {
      id: "1",
      name: "Beginner A1",
      subjectId: "1",
      subjectName: "Ingliz tili",
      teacherId: "1",
      teacherName: "Aliyev Jasur",
      days: ["Mon", "Wed", "Fri"],
      startTime: "09:00",
      endTime: "11:00",
      studentsCount: 12,
    },
    {
      id: "2",
      name: "Advanced C1",
      subjectId: "1",
      subjectName: "Ingliz tili",
      teacherId: "2",
      teacherName: "Karimova Malika",
      days: ["Tue", "Thu", "Sat"],
      startTime: "14:00",
      endTime: "16:00",
      studentsCount: 8,
    },
  ]);

  return (
    <div className="p-4 md:p-8 w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Fanlar va Guruhlar</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Barcha fanlar va guruhlar ro'yxati
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full md:w-100 grid-cols-2">
          <TabsTrigger value="subjects">Fanlar</TabsTrigger>
          <TabsTrigger value="groups">Guruhlar</TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <Card key={subject.id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{subject.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {subject.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{subject.groupsCount} ta guruh</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card
                key={group.id}
                onClick={() => router.push(`/staff/${group.id}`)}
                className="p-6 hover:shadow-lg hover:border-primary/50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">{group.name}</h3>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {group.subjectName}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{group.teacherName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <div className="flex gap-1">
                      {group.days.map((day) => {
                        const dayInfo = weekDays.find((d) => d.value === day);
                        return (
                          <span
                            key={day}
                            className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium"
                          >
                            {dayInfo?.icon}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{group.startTime} - {group.endTime}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Users className="w-4 h-4" />
                    <span>{group.studentsCount} ta o'quvchi</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

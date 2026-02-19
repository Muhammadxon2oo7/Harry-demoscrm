"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subjectsApi, groupsApi, type Subject, type Group } from "@/lib/api";

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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [subjs, grps] = await Promise.all([
        subjectsApi.list(),
        groupsApi.list(),
      ]);
      setSubjects(subjs);
      setGroups(grps);
    } catch {
      // errors handled by api client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="p-4 md:p-8 w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          Fanlar va Guruhlar
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Barcha fanlar va guruhlar ro'yxati
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-5 h-40 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="subjects" className="w-full">
          <TabsList className="grid w-full md:w-100 grid-cols-2">
            <TabsTrigger value="subjects">Fanlar</TabsTrigger>
            <TabsTrigger value="groups">Guruhlar</TabsTrigger>
          </TabsList>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground">{subjects.length} ta fan</p>

            {subjects.length === 0 ? (
              <Card className="p-10 text-center">
                <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Fan mavjud emas</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <Card key={subject.id} className="p-5 hover:shadow-md transition">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {subject.created_at
                        ? new Date(subject.created_at).toLocaleDateString("uz-UZ")
                        : "—"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        {groups.filter((g) => g.subject === subject.id).length} ta guruh
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground">{groups.length} ta guruh</p>

            {groups.length === 0 ? (
              <Card className="p-10 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Guruh mavjud emas</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <Card
                    key={group.id}
                    className="p-5 hover:shadow-md transition cursor-pointer hover:border-primary/50"
                    onClick={() => router.push(`/staff/${group.id}`)}
                  >
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                    <Badge variant="secondary" className="mb-3">
                      {group.subject_name}
                    </Badge>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <div className="flex gap-1 flex-wrap">
                          {(group.days || "")
                            .split(",")
                            .filter(Boolean)
                            .map((day) => (
                              <span
                                key={day}
                                className="px-2 py-0.5 bg-muted rounded text-xs"
                              >
                                {weekDays.find((d) => d.value === day.trim())?.icon ?? day}
                              </span>
                            ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {group.start_time?.slice(0, 5)} – {group.end_time?.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t">
                        <Users className="w-4 h-4" />
                        <span>{group.students_count} ta o'quvchi</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

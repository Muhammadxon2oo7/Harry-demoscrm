"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { fmtDate } from "@/lib/utils";
import { Users, BookOpen, Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(null);

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Fanlar</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Fanni bosing — unga tegishli guruhlar ko&apos;rinadi
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5 h-16 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <p className="font-medium text-muted-foreground">Fan mavjud emas</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => {
            const subjectGroups = groups.filter((g) => g.subject === subject.id);
            const expanded = expandedSubjectId === subject.id;
            return (
              <Card key={subject.id} className="overflow-hidden">
                <button
                  className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors text-left"
                  onClick={() => setExpandedSubjectId(expanded ? null : subject.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {subject.created_at ? fmtDate(subject.created_at) : "—"} · {subjectGroups.length} ta guruh
                      </p>
                    </div>
                  </div>
                  {expanded
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>

                {expanded && (
                  <div className="border-t bg-muted/10 p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">{subjectGroups.length} ta guruh</p>
                    {subjectGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Bu fanga guruh qo&apos;shilmagan
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subjectGroups.map((group) => (
                          <Card
                            key={group.id}
                            className="p-4 hover:shadow-md transition cursor-pointer"
                            onClick={() => router.push(`/staff/${group.id}`)}
                          >
                            <h3 className="font-semibold mb-2">{group.name}</h3>
                            <div className="space-y-1.5 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                <div className="flex gap-1 flex-wrap">
                                  {(group.days || "")
                                    .split(",")
                                    .filter(Boolean)
                                    .map((day) => (
                                      <span key={day} className="px-1.5 py-0.5 bg-muted rounded text-xs">
                                        {weekDays.find((d) => d.value === day.trim())?.icon ?? day}
                                      </span>
                                    ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>{group.start_time?.slice(0, 5)} – {group.end_time?.slice(0, 5)}</span>
                              </div>
                              <div className="flex items-center gap-2 pt-1 border-t">
                                <Users className="w-3.5 h-3.5 shrink-0" />
                                <span>{group.students_count} ta o&apos;quvchi</span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

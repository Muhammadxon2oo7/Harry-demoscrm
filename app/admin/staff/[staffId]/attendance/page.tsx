"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffAttendanceCalendar } from "@/components/admin/staff-attendance-calendar";
import { workersApi, workLogsApi, type UserProfile, type WorkLog } from "@/lib/api";

export default function StaffAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const staffId = Number(params.staffId);

  const [staff, setStaff] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [staffData, logs] = await Promise.all([
          workersApi.get(staffId),
          workLogsApi.list({ employee: staffId }),
        ]);
        setStaff(staffData);
        setSessions(logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (staffId) load();
  }, [staffId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Xodim topilmadi</h2>
          <Button onClick={() => router.push("/admin/staff")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga qaytish
          </Button>
        </div>
      </div>
    );
  }

  const staffName = `${staff.first_name} ${staff.last_name}`.trim() || staff.username;

  // Map WorkLog records to the shape StaffAttendanceCalendar expects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarSessions = sessions.map((log): any => ({
    id: String(log.id),
    staffId: String(log.employee),
    staffName,
    groupName: log.note || "",
    date: log.date,
    time: "",
    status: log.status ? ("attended" as const) : ("absent" as const),
  }));

  return (
    <div className="md:px-6 space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/staff")}
        className="flex items-center gap-2 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Xodimlar</span>
      </Button>

      <StaffAttendanceCalendar
        staffId={String(staffId)}
        staffName={staffName}
        sessions={calendarSessions}
      />
    </div>
  );
}

"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffAttendanceCalendar } from "@/components/admin/staff-attendance-calendar";

// Mock data - replace with real API call
const mockStaffData = {
  "1": { name: "Aliyev Jasur", sessions: [] },
  "2": { name: "Karimova Dilnoza", sessions: [] },
  "3": { name: "Rahimov Bobur", sessions: [] },
};

const classSessions = [
  {
    id: "1",
    staffId: "1",
    staffName: "Aliyev Jasur",
    groupName: "Beginner A1",
    date: "2026-02-09",
    time: "09:00 - 11:00",
    status: "attended" as const,
  },
  {
    id: "2",
    staffId: "1",
    staffName: "Aliyev Jasur",
    groupName: "Intermediate B1",
    date: "2026-02-09",
    time: "14:00 - 16:00",
    status: "attended" as const,
  },
  {
    id: "3",
    staffId: "1",
    staffName: "Aliyev Jasur",
    groupName: "Advanced C1",
    date: "2026-02-08",
    time: "10:00 - 12:00",
    status: "absent" as const,
  },
  {
    id: "4",
    staffId: "1",
    staffName: "Aliyev Jasur",
    groupName: "Beginner A1",
    date: "2026-02-07",
    time: "09:00 - 11:00",
    status: "replaced" as const,
    replacedBy: "2",
    replacedByName: "Karimova Dilnoza",
  },
  {
    id: "5",
    staffId: "2",
    staffName: "Karimova Dilnoza",
    groupName: "Kids Level 1",
    date: "2026-02-09",
    time: "11:00 - 13:00",
    status: "attended" as const,
  },
  {
    id: "6",
    staffId: "2",
    staffName: "Karimova Dilnoza",
    groupName: "Kids Level 2",
    date: "2026-02-08",
    time: "11:00 - 13:00",
    status: "attended" as const,
  },
  {
    id: "7",
    staffId: "3",
    staffName: "Rahimov Bobur",
    groupName: "IELTS Preparation",
    date: "2026-02-09",
    time: "15:00 - 17:00",
    status: "attended" as const,
  },
  {
    id: "8",
    staffId: "3",
    staffName: "Rahimov Bobur",
    groupName: "Business English",
    date: "2026-02-08",
    time: "16:00 - 18:00",
    status: "absent" as const,
  },
];

export default function StaffAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.staffId as string;

  const staffData = mockStaffData[staffId as keyof typeof mockStaffData];
  const staffSessions = classSessions.filter(
    (session) => session.staffId === staffId
  );

  if (!staffData) {
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

  return (
    <div className="p-6 space-y-6">
      <StaffAttendanceCalendar
        staffId={staffId}
        staffName={staffData.name}
        sessions={staffSessions}
      />
    </div>
  );
}

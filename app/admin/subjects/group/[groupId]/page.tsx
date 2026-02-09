"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, Clock, BookOpen, User, Plus, Trophy, Edit2, Trash2 } from "lucide-react";
import { HomeworkDrawer } from "@/components/staff/homework-drawer";
import { AttendanceModal } from "@/components/staff/attendance-modal";
import { ScoreModal } from "@/components/staff/score-modal";
import { AddStudentModal } from "@/components/staff/add-student-modal";
import { EditStudentModal } from "@/components/staff/edit-student-modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";

interface Student {
  id: string;
  fullName: string;
  phone: string;
  status: "active" | "inactive";
}

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const router = useRouter();

  const [showHomework, setShowHomework] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id?: string;
  }>({ open: false });

  const [homeworks] = useState([
    {
      id: 1,
      title: "Present Simple - 10 mashq",
      text: "Kitobdagi 25-betni bajaring",
      description: "Kitobdagi 25-betni bajaring",
      document: "",
      deadline: "2024-12-25",
      created_at: new Date().toISOString(),
    },
  ]);

  // Mock data
  const [group] = useState({
    id: groupId,
    name: "Beginner A1",
    subjectName: "Ingliz tili",
    teacherName: "Aliyev Jasur",
    days: ["Mon", "Wed", "Fri"],
    startTime: "09:00",
    endTime: "11:00",
    studentsCount: 12,
  });

  const [students] = useState<Student[]>([
    { id: "1", fullName: "Abdullayev Vali", phone: "+998901234567", status: "active" },
    { id: "2", fullName: "Karimova Malika", phone: "+998901234568", status: "active" },
    { id: "3", fullName: "Rahimov Jasur", phone: "+998901234569", status: "active" },
    { id: "4", fullName: "Azimova Dilnoza", phone: "+998901234570", status: "inactive" },
  ]);

  const weekDays = [
    { value: "Mon", label: "Dushanba", icon: "D" },
    { value: "Tue", label: "Seshanba", icon: "S" },
    { value: "Wed", label: "Chorshanba", icon: "C" },
    { value: "Thu", label: "Payshanba", icon: "P" },
    { value: "Fri", label: "Juma", icon: "J" },
    { value: "Sat", label: "Shanba", icon: "Sh" },
    { value: "Sun", label: "Yakshanba", icon: "Y" },
  ];

  return (
    <div className="p-4 md:p-8 w-full space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">{group.name}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {group.subjectName}
          </p>
        </div>
      </div>

      {/* Group Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">O'qituvchi</p>
              <p className="font-semibold text-sm">{group.teacherName}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dars kunlari</p>
              <div className="flex gap-1 mt-1">
                {group.days.map((day) => (
                  <span
                    key={day}
                    className="px-2 py-0.5 bg-muted rounded text-xs font-medium"
                  >
                    {weekDays.find((d) => d.value === day)?.icon}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dars vaqti</p>
              <p className="font-semibold text-sm">{group.startTime} - {group.endTime}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">O'quvchilar</p>
              <p className="font-semibold text-sm">{group.studentsCount} ta</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowScoreModal(true)}
          className="h-9 text-xs font-medium"
        >
          <Trophy className="w-3.5 h-3.5 mr-1.5" /> Baho
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAttendanceModal(true)}
          className="h-9 text-xs font-medium"
        >
          <Calendar className="w-3.5 h-3.5 mr-1.5" /> Davomat
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHomework(true)}
          className="h-9 text-xs font-medium relative"
        >
          <BookOpen className="w-4 h-3.5 mr-1.5" /> Vazifa
          {homeworks.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {homeworks.length}
            </span>
          )}
        </Button>
        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="h-9 text-xs font-medium ml-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Yangi o'quvchi
        </Button>
      </div>

      {/* Students Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">O'quvchilar</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {students.length} ta o'quvchi
            </p>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold text-sm">
                      #
                    </th>
                    <th className="text-left p-4 font-semibold text-sm">
                      F.I.O
                    </th>
                    <th className="text-left p-4 font-semibold text-sm">
                      Telefon
                    </th>
                    <th className="text-left p-4 font-semibold text-sm">
                      Status
                    </th>
                    <th className="text-right p-4 font-semibold text-sm">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition"
                    >
                      <td className="p-4 text-sm text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{student.fullName}</p>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {student.phone}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            student.status === "active" ? "default" : "secondary"
                          }
                        >
                          {student.status === "active" ? "Faol" : "Nofaol"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingStudent(student)}
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setDeleteModal({ open: true, id: student.id })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {students.map((student, index) => (
            <Card key={student.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.phone}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    student.status === "active" ? "default" : "secondary"
                  }
                >
                  {student.status === "active" ? "Faol" : "Nofaol"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingStudent(student)}
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4 text-blue-500" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setDeleteModal({ open: true, id: student.id })
                  }
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddStudentModal
        groupId={Number(groupId)}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async () => {}}
      />
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onUpdate={async () => {}}
        />
      )}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={() => setDeleteModal({ open: false })}
        title="O'quvchini o'chirish"
        message="Bu amalni ortga qaytarib bo'lmaydi."
      />
      <HomeworkDrawer
        homeworks={homeworks}
        groupId={Number(groupId)}
        isOpen={showHomework}
        onClose={() => setShowHomework(false)}
        onHomeworkAdded={(hw) => {}}
        onHomeworkDeleted={(id) => {}}
      />
      <AttendanceModal
        groupId={Number(groupId)}
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
      />
      <ScoreModal
        groupId={Number(groupId)}
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
      />
    </div>
  );
}

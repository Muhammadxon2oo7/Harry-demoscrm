"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
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
import {
  groupsApi,
  studentsApi,
  homeworkApi,
  type Group,
  type UserProfile,
} from "@/lib/api";

interface Homework {
  id: number;
  text: string;
  file: string | null;
  created_at: string;
}

const weekDaysMap: Record<string, string> = {
  Mon: "Dushanba",
  Tue: "Seshanba",
  Wed: "Chorshanba",
  Thu: "Payshanba",
  Fri: "Juma",
  Sat: "Shanba",
  Sun: "Yakshanba",
};

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const gid = Number(groupId);

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);

  const [showHomework, setShowHomework] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({ open: false });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [grp, studs, hws] = await Promise.all([
        groupsApi.get(gid),
        studentsApi.list(gid),
        homeworkApi.list(),
      ]);
      setGroup(grp);
      setStudents(studs);
      const filtered = hws
        .filter((h) => h.group === gid)
        .map((h) => ({ id: h.id, text: h.text, file: h.file ?? null, created_at: h.created_at }));
      setHomeworks(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [gid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async (data: Record<string, unknown>) => {
    const newStudent = await studentsApi.create(data as unknown as Parameters<typeof studentsApi.create>[0]);
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleUpdate = async (changes: Partial<UserProfile> & { id: number }) => {
    const patched = await studentsApi.patch(changes.id, changes as Parameters<typeof studentsApi.patch>[1]);
    setStudents((prev) => prev.map((s) => (s.id === patched.id ? patched : s)));
    setEditingStudent(null);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await studentsApi.delete(deleteModal.id);
      setStudents((prev) => prev.filter((s) => s.id !== deleteModal.id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModal({ open: false });
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 w-full flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-4 md:p-8 w-full flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Guruh topilmadi</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Orqaga
          </Button>
        </div>
      </div>
    );
  }

  const days = group.days ? group.days.split(",") : [];

  return (
    <div className="space-y-6">
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
            {group.subject_name}
          </p>
        </div>
      </div>

      {/* Group Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dars kunlari</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {days.map((day) => (
                  <span
                    key={day}
                    className="px-2 py-0.5 bg-muted rounded text-xs font-medium"
                  >
                    {weekDaysMap[day.trim()] || day}
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
              <p className="font-semibold text-sm">
                {group.start_time?.slice(0, 5)} - {group.end_time?.slice(0, 5)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">O&apos;quvchilar</p>
              <p className="font-semibold text-sm">{group.students_count} ta</p>
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
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Yangi o&apos;quvchi
        </Button>
      </div>

      {/* Students Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">O&apos;quvchilar</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {students.length} ta o&apos;quvchi
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
                    <th className="text-left p-4 font-semibold text-sm">#</th>
                    <th className="text-left p-4 font-semibold text-sm">F.I.O</th>
                    <th className="text-left p-4 font-semibold text-sm">Telefon</th>
                    <th className="text-left p-4 font-semibold text-sm">Status</th>
                    <th className="text-right p-4 font-semibold text-sm">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition"
                    >
                      <td className="p-4 text-sm text-muted-foreground">{index + 1}</td>
                      <td className="p-4">
                        <p className="font-medium">
                          {student.first_name} {student.last_name}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{student.phone}</td>
                      <td className="p-4">
                        <Badge variant={student.is_active ? "default" : "secondary"}>
                          {student.is_active ? "Faol" : "Nofaol"}
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
                            onClick={() => setDeleteModal({ open: true, id: student.id })}
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
          {students.map((student) => (
            <Card key={student.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{student.phone}</p>
                  </div>
                </div>
                <Badge variant={student.is_active ? "default" : "secondary"}>
                  {student.is_active ? "Faol" : "Nofaol"}
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
                  onClick={() => setDeleteModal({ open: true, id: student.id })}
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
        groupId={gid}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
      />
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onUpdate={handleUpdate}
        />
      )}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleDelete}
        title="O'quvchini o'chirish"
        message="Bu amalni ortga qaytarib bo'lmaydi."
      />
      <HomeworkDrawer
        homeworks={homeworks}
        groupId={gid}
        isOpen={showHomework}
        onClose={() => setShowHomework(false)}
        onHomeworkAdded={(hw) => setHomeworks((prev) => [hw, ...prev])}
        onHomeworkDeleted={(id) => setHomeworks((prev) => prev.filter((h) => h.id !== id))}
      />
      <AttendanceModal
        groupId={gid}
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
      />
      <ScoreModal
        groupId={gid}
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
      />
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Trophy,
  Users,
  Clock,
  User,
  Send,
  ShareIcon,
} from "lucide-react";
import { AddStudentModal } from "@/components/staff/add-student-modal";
import { EditStudentModal } from "@/components/staff/edit-student-modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { HomeworkDrawer } from "@/components/staff/homework-drawer";
import { AttendanceModal } from "@/components/staff/attendance-modal";
import { ScoreModal } from "@/components/staff/score-modal";

// Mock data - later replace with API
const mockGroup = {
  id: "1",
  name: "Beginner A1",
  subject: "Ingliz tili",
  teacher: "Aliyev Jasur",
  days: ["Dushanba", "Chorshanba", "Juma"],
  startTime: "09:00",
  endTime: "11:00",
  studentsCount: 12,
};

const mockStudents = [
  {
    id: 1,
    firstName: "Ali",
    lastName: "Valiyev",
    username: "alivaliyev",
    phone: "+998901234567",
    parentPhone: "+998901234568",
    status: "Faol",
  },
  {
    id: 2,
    firstName: "Malika",
    lastName: "Toshmatova",
    username: "malikatok",
    phone: "+998901234569",
    parentPhone: "+998901234570",
    status: "Faol",
  },
  {
    id: 3,
    firstName: "Sardor",
    lastName: "Karimov",
    username: "sardork",
    phone: "+998901234571",
    parentPhone: "+998901234572",
    status: "Nofaol",
  },
];

const weekDays = [
  { value: "Dushanba", icon: "D" },
  { value: "Seshanba", icon: "S" },
  { value: "Chorshanba", icon: "C" },
  { value: "Payshanba", icon: "P" },
  { value: "Juma", icon: "J" },
  { value: "Shanba", icon: "Sh" },
  { value: "Yakshanba", icon: "Y" },
];

export default function StaffGroupDetailPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const [group] = useState(mockGroup);
  const [students, setStudents] = useState(mockStudents);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id?: number;
  }>({ open: false });
  const [showHomework, setShowHomework] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
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

  const handleAdd = async (data: any) => {
    const newStudent = {
      id: students.length + 1,
      ...data,
      status: "Faol",
    };
    setStudents([...students, newStudent]);
    setShowAddModal(false);
  };

  const handleUpdate = async (changes: any) => {
    setStudents(
      students.map((s) => (s.id === changes.id ? { ...s, ...changes } : s))
    );
    setEditingStudent(null);
  };

  const openDelete = (id: number) => setDeleteModal({ open: true, id });
  const closeDelete = () => setDeleteModal({ open: false });

  const handleDelete = () => {
    if (!deleteModal.id) return;
    setStudents(students.filter((s) => s.id !== deleteModal.id));
    closeDelete();
  };

  const toggleStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 md:p-8 w-full space-y-6">
      {/* Header with Back Button */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{group.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {group.studentsCount} o'quvchi
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">O'qituvchi</p>
                <p className="font-medium text-sm">{group.teacher}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dars kunlari</p>
                <div className="flex gap-1 mt-1">
                  {group.days.map((day) => {
                    const dayInfo = weekDays.find((d) => d.value === day);
                    return (
                      <span
                        key={day}
                        className="text-xs font-medium text-blue-600"
                      >
                        {dayInfo?.icon}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vaqt</p>
                <p className="font-medium text-sm">{group.startTime} - {group.endTime}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">O'quvchilar</p>
                <p className="font-medium text-sm">{students.length} ta</p>
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

          {selectedStudents.length > 0 ? (
            <Button
              size="sm"
              className="h-9 text-xs font-medium bg-green-600 hover:bg-green-700"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Xabar yuborish (
              {selectedStudents.length})
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelectedStudents(students.map((s: any) => s.id))
              }
              className="h-9 text-xs"
            >
              Hammasini belgilash
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="h-9 text-xs font-medium ml-auto"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Yangi o'quvchi
          </Button>
        </div>

        <div className="block md:hidden">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> O'quvchilar
          </h2>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">•</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Ism
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Login
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Ota-ona
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Bu guruhda hali o'quvchi yo'q
                  </td>
                </tr>
              ) : (
                students.map((s: any) => (
                  <tr
                    key={s.id}
                    className="border-b hover:bg-muted/30 transition"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s.id)}
                        onChange={() => toggleStudent(s.id)}
                        className="w-4 h-4 rounded border-muted-foreground/30 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      @{s.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {s.phone || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {s.parentPhone || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          s.status === "Faol" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingStudent(s)}
                          className="p-2 hover:bg-muted rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => openDelete(s.id)}
                          className="p-2 hover:bg-muted rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {students.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              Bu guruhda hali o'quvchi yo'q
            </p>
          </Card>
        ) : (
          students.map((s: any) => (
            <Card key={s.id} className="p-4 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-3">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(s.id)}
                  onChange={() => toggleStudent(s.id)}
                  className="w-5 h-5 rounded border-muted-foreground/30 text-primary mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {s.firstName} {s.lastName}
                    </p>
                    <Badge
                      variant={s.status === "Faol" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    @{s.username}
                  </p>
                  <div className="space-y-1 text-xs">
                    {s.phone && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Tel:</span> {s.phone}
                      </p>
                    )}
                    {s.parentPhone && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Ota-ona:</span>{" "}
                        {s.parentPhone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 flex-col">
                  <button
                    onClick={() => setEditingStudent(s)}
                    className="p-2 hover:bg-muted rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => openDelete(s.id)}
                    className="p-2 hover:bg-muted rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      <AddStudentModal
        groupId={Number(groupId)}
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
        onClose={closeDelete}
        onConfirm={handleDelete}
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

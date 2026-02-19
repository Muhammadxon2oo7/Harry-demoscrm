"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { fmtDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Clock,
  Calendar,
  User,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  subjectsApi,
  groupsApi,
  workersApi,
  type Subject,
  type Group,
  type UserProfile,
} from "@/lib/api";

const weekDays = [
  { value: "Mon", label: "Dush", icon: "D" },
  { value: "Tue", label: "Sesh", icon: "S" },
  { value: "Wed", label: "Chor", icon: "C" },
  { value: "Thu", label: "Pay", icon: "P" },
  { value: "Fri", label: "Juma", icon: "J" },
  { value: "Sat", label: "Shan", icon: "Sh" },
  { value: "Sun", label: "Yak", icon: "Y" },
];

export default function AdminSubjectsPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [subjs, workers, grps] = await Promise.all([
        subjectsApi.list(),
        workersApi.list(),
        groupsApi.list(),
      ]);
      setSubjects(subjs);
      setStaff(workers);
      setGroups(grps);
    } catch {
      // errors handled by api client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Subject modals
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");

  // Group modals
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [groupStartTime, setGroupStartTime] = useState("");
  const [groupEndTime, setGroupEndTime] = useState("");

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: "subject" | "group" | null;
    id: string | null;
  }>({ open: false, type: null, id: null });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Subject handlers
  const handleAddSubject = async () => {
    if (!subjectName.trim()) return;
    try {
      await subjectsApi.create(subjectName);
      await loadData();
      resetSubjectForm();
      setShowAddSubject(false);
      showMessage("success", "Fan qo'shildi");
    } catch {
      showMessage("error", "Xatolik yuz berdi");
    }
  };

  const handleEditSubject = async () => {
    if (!editingSubject || !subjectName.trim()) return;
    try {
      await subjectsApi.update(editingSubject.id, subjectName);
      await loadData();
      resetSubjectForm();
      setEditingSubject(null);
      showMessage("success", "Fan tahrirlandi");
    } catch {
      showMessage("error", "Xatolik yuz berdi");
    }
  };

  const openEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setSubjectDescription("");
  };

  const resetSubjectForm = () => {
    setSubjectName("");
    setSubjectDescription("");
  };

  // Group handlers
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddGroup = async () => {
    if (!groupName.trim() || !selectedSubject || selectedDays.length === 0 || !groupStartTime || !groupEndTime) {
      showMessage("error", "Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    try {
      await groupsApi.create({
        name: groupName,
        subject: Number(selectedSubject),
        days: selectedDays.join(","),
        start_time: groupStartTime + ":00",
        end_time: groupEndTime + ":00",
        is_active: true,
      });
      await loadData();
      resetGroupForm();
      setShowAddGroup(false);
      showMessage("success", "Guruh qo'shildi");
    } catch {
      showMessage("error", "Xatolik yuz berdi");
    }
  };

  const handleEditGroup = async () => {
    if (!editingGroup || !groupName.trim() || !selectedSubject || selectedDays.length === 0 || !groupStartTime || !groupEndTime) {
      showMessage("error", "Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    try {
      await groupsApi.patch(editingGroup.id, {
        name: groupName,
        subject: Number(selectedSubject),
        days: selectedDays.join(","),
        start_time: groupStartTime + ":00",
        end_time: groupEndTime + ":00",
      });
      await loadData();
      resetGroupForm();
      setEditingGroup(null);
      showMessage("success", "Guruh tahrirlandi");
    } catch {
      showMessage("error", "Xatolik yuz berdi");
    }
  };

  const openEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setSelectedSubject(String(group.subject));
    setSelectedDays(group.days ? group.days.split(",") : []);
    setGroupStartTime(group.start_time?.slice(0, 5) ?? "");
    setGroupEndTime(group.end_time?.slice(0, 5) ?? "");
  };

  const resetGroupForm = () => {
    setGroupName("");
    setSelectedSubject("");
    setSelectedTeacher("");
    setSelectedDays([]);
    setGroupStartTime("");
    setGroupEndTime("");
  };

  const handleDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;
    try {
      if (deleteModal.type === "subject") {
        await subjectsApi.delete(Number(deleteModal.id));
        showMessage("success", "Fan o'chirildi");
      } else {
        await groupsApi.delete(Number(deleteModal.id));
        showMessage("success", "Guruh o'chirildi");
      }
      await loadData();
    } catch {
      showMessage("error", "O'chirishda xatolik");
    }
    setDeleteModal({ open: false, type: null, id: null });
  };

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm border w-full ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-500"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Fanlar va Guruhlar
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            O'quv fanlar va guruhlar boshqaruvi
          </p>
        </div>
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
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {subjects.length} ta fan
              </p>
              <Button onClick={() => setShowAddSubject(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Fan qo'shish
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card key={subject.id} className="p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEditSubject(subject)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() =>
                          setDeleteModal({ open: true, type: "subject", id: String(subject.id) })
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {subject.created_at ? fmtDate(subject.created_at) : "—"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{groups.filter((g) => g.subject === subject.id).length} ta guruh</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {groups.length} ta guruh
              </p>
              <Button onClick={() => setShowAddGroup(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Guruh qo'shish
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="p-5 hover:shadow-md transition cursor-pointer group"
                  onClick={() => router.push(`/admin/subjects/group/${group.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditGroup(group);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModal({ open: true, type: "group", id: String(group.id) });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                  <Badge variant="secondary" className="mb-3">
                    {group.subject_name}
                  </Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <div className="flex gap-1 flex-wrap">
                        {(group.days || "").split(",").filter(Boolean).map((day) => (
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
                      <span>{group.start_time?.slice(0, 5)} - {group.end_time?.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t">
                      <Users className="w-4 h-4" />
                      <span>{group.students_count} ta o'quvchi</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Add/Edit Subject Modal */}
      <Dialog
        open={showAddSubject || editingSubject !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddSubject(false);
            setEditingSubject(null);
            resetSubjectForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Fanni tahrirlash" : "Yangi fan qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="subjectName">Fan nomi</Label>
              <Input
                id="subjectName"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Ingliz tili"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subjectDesc">Tavsif</Label>
              <Textarea
                id="subjectDesc"
                value={subjectDescription}
                onChange={(e) => setSubjectDescription(e.target.value)}
                placeholder="Fan haqida qisqacha ma'lumot..."
                className="mt-1 min-h-20"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddSubject(false);
                  setEditingSubject(null);
                  resetSubjectForm();
                }}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={editingSubject ? handleEditSubject : handleAddSubject}
                className="flex-1"
              >
                {editingSubject ? "Saqlash" : "Qo'shish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Group Modal */}
      <Dialog
        open={showAddGroup || editingGroup !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddGroup(false);
            setEditingGroup(null);
            resetGroupForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Guruhni tahrirlash" : "Yangi guruh qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="groupName">Guruh nomi</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Beginner A1"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Fan</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Fanni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={String(subject.id)}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>O'qituvchi (ixtiyoriy)</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="O'qituvchini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.first_name} {teacher.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Dars kunlari</Label>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-medium transition-all ${
                      selectedDays.includes(day.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-muted hover:bg-muted hover:border-muted-foreground/20"
                    }`}
                  >
                    <span className="font-bold text-base">{day.icon}</span>
                    <span className="text-[10px] mt-0.5">{day.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tanlangan: {selectedDays.length} kun
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groupStartTime">Boshlanish vaqti</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="groupStartTime"
                    type="time"
                    value={groupStartTime}
                    onChange={(e) => setGroupStartTime(e.target.value)}
                    className="pl-10"
                    placeholder="09:00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="groupEndTime">Tugash vaqti</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="groupEndTime"
                    type="time"
                    value={groupEndTime}
                    onChange={(e) => setGroupEndTime(e.target.value)}
                    className="pl-10"
                    placeholder="11:00"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddGroup(false);
                  setEditingGroup(null);
                  resetGroupForm();
                }}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={editingGroup ? handleEditGroup : handleAddGroup}
                className="flex-1"
              >
                {editingGroup ? "Saqlash" : "Qo'shish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => !open && setDeleteModal({ open: false, type: null, id: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteModal.type === "subject" ? "Fanni" : "Guruhni"} o'chirish
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Bu amalni ortga qaytarib bo'lmaydi. {deleteModal.type === "subject" ? "Fan" : "Guruh"} butunlay o'chib ketadi.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ open: false, type: null, id: null })}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
              >
                O'chirish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

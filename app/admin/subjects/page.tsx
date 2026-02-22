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
  User,
  BookOpen,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(null);

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

  const openAddGroupForSubject = (subjectId: number) => {
    setSelectedSubject(String(subjectId));
    setShowAddGroup(true);
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
        teacher: selectedTeacher ? Number(selectedTeacher) : null,
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
        teacher: selectedTeacher ? Number(selectedTeacher) : null,
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
    setSelectedTeacher(group.teacher ? String(group.teacher) : "");
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
          <h1 className="text-2xl md:text-3xl font-bold">Fanlar</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Fanni bosing — unga tegishli guruhlar ko&apos;rinadi
          </p>
        </div>
        <Button onClick={() => setShowAddSubject(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Fan qo&apos;shish
        </Button>
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
          <Button className="mt-4" onClick={() => setShowAddSubject(true)}>
            <Plus className="w-4 h-4 mr-2" />Fan qo&apos;shish
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => {
            const subjectGroups = groups.filter((g) => g.subject === subject.id);
            const expanded = expandedSubjectId === subject.id;
            return (
              <Card key={subject.id} className="overflow-hidden">
                {/* Subject header row */}
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
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); openEditSubject(subject); }}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ open: true, type: "subject", id: String(subject.id) });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    {expanded
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />}
                  </div>
                </button>

                {/* Expanded: groups */}
                {expanded && (
                  <div className="border-t bg-muted/10 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{subjectGroups.length} ta guruh</p>
                      <Button size="sm" onClick={() => openAddGroupForSubject(subject.id)}>
                        <Plus className="w-3.5 h-3.5 mr-1" />Guruh qo&apos;shish
                      </Button>
                    </div>

                    {subjectGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Bu fanga guruh qo&apos;shilmagan
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subjectGroups.map((group) => (
                          <Card
                            key={group.id}
                            className="p-4 hover:shadow-md transition cursor-pointer group/card"
                            onClick={() => router.push(`/admin/subjects/group/${group.id}`)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold">{group.name}</h3>
                              <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={(e) => { e.stopPropagation(); openEditGroup(group); }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteModal({ open: true, type: "group", id: String(group.id) });
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1.5 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                <div className="flex gap-1 flex-wrap">
                                  {(group.days || "").split(",").filter(Boolean).map((day) => (
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
                              {group.teacher_name && (
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 shrink-0" />
                                  <span>{group.teacher_name}</span>
                                </div>
                              )}
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

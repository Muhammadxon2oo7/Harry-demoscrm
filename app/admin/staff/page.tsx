"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  UserX,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Staff {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  salary: string;
  workDays: number;
  totalDays: number;
}

interface ClassSession {
  id: string;
  staffId: string;
  staffName: string;
  groupName: string;
  date: string;
  time: string;
  status: "attended" | "absent" | "replaced";
  replacedBy?: string;
  replacedByName?: string;
}

export default function AdminStaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([
    {
      id: "1",
      fullName: "Aliyev Jasur",
      email: "jasur@hp.com",
      phone: "+998901234567",
      subject: "Ingliz tili",
      salary: "3000000",
      workDays: 20,
      totalDays: 22,
    },
    {
      id: "2",
      fullName: "Karimova Dilnoza",
      email: "dilnoza@hp.com",
      phone: "+998901234568",
      subject: "Matematika",
      salary: "3500000",
      workDays: 22,
      totalDays: 22,
    },
    {
      id: "3",
      fullName: "Rahimov Bobur",
      email: "bobur@hp.com",
      phone: "+998901234569",
      subject: "Fizika",
      salary: "3200000",
      workDays: 18,
      totalDays: 22,
    },
  ]);

  const [classSessions] = useState<ClassSession[]>([
    {
      id: "1",
      staffId: "1",
      staffName: "Aliyev Jasur",
      groupName: "Beginner A1",
      date: "2026-02-09",
      time: "14:00 - 16:00",
      status: "attended",
    },
    {
      id: "2",
      staffId: "1",
      staffName: "Aliyev Jasur",
      groupName: "Advanced C1",
      date: "2026-02-08",
      time: "16:00 - 18:00",
      status: "attended",
    },
    {
      id: "3",
      staffId: "1",
      staffName: "Aliyev Jasur",
      groupName: "Beginner A1",
      date: "2026-02-07",
      time: "14:00 - 16:00",
      status: "absent",
      replacedBy: "3",
      replacedByName: "Rahimov Bobur",
    },
    {
      id: "4",
      staffId: "2",
      staffName: "Karimova Dilnoza",
      groupName: "Boshlang'ich",
      date: "2026-02-09",
      time: "10:00 - 12:00",
      status: "attended",
    },
    {
      id: "5",
      staffId: "2",
      staffName: "Karimova Dilnoza",
      groupName: "Boshlang'ich",
      date: "2026-02-06",
      time: "10:00 - 12:00",
      status: "attended",
    },
    {
      id: "6",
      staffId: "3",
      staffName: "Rahimov Bobur",
      groupName: "Fizika 10-sinf",
      date: "2026-02-09",
      time: "09:00 - 11:00",
      status: "attended",
    },
    {
      id: "7",
      staffId: "3",
      staffName: "Rahimov Bobur",
      groupName: "Fizika 11-sinf",
      date: "2026-02-05",
      time: "11:00 - 13:00",
      status: "absent",
    },
    {
      id: "8",
      staffId: "3",
      staffName: "Rahimov Bobur",
      groupName: "Beginner A1",
      date: "2026-02-07",
      time: "14:00 - 16:00",
      status: "replaced",
      replacedBy: "1",
      replacedByName: "Aliyev Jasur",
    },
    {
      id: "9",
      staffId: "1",
      staffName: "Aliyev Jasur",
      groupName: "Kids A0",
      date: "2026-02-09",
      time: "10:00 - 12:00",
      status: "attended",
    },
    {
      id: "10",
      staffId: "1",
      staffName: "Aliyev Jasur",
      groupName: "Speaking Club",
      date: "2026-02-09",
      time: "18:00 - 20:00",
      status: "absent",
      replacedBy: "2",
      replacedByName: "Karimova Dilnoza",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    salary: "",
  });

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAdd = () => {
    const newStaff: Staff = {
      id: Date.now().toString(),
      ...formData,
      workDays: 0,
      totalDays: 0,
    };
    setStaff([...staff, newStaff]);
    setIsAddDialogOpen(false);
    setFormData({ fullName: "", email: "", phone: "", subject: "", salary: "" });
    showMessage("success", "Yangi xodim qo'shildi");
  };

  const handleEdit = () => {
    if (!selectedStaff) return;
    setStaff(
      staff.map((s) =>
        s.id === selectedStaff.id ? { ...selectedStaff, ...formData } : s
      )
    );
    setIsEditDialogOpen(false);
    setSelectedStaff(null);
    setFormData({ fullName: "", email: "", phone: "", subject: "", salary: "" });
    showMessage("success", "Xodim ma'lumotlari yangilandi");
  };

  const openDeleteModal = (id: string) => {
    setStaffToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteModal = () => {
    setStaffToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDelete = () => {
    if (!staffToDelete) return;
    setStaff(staff.filter((s) => s.id !== staffToDelete));
    closeDeleteModal();
    showMessage("success", "Xodim o'chirildi");
  };

  const handleViewAttendance = (staffMember: Staff) => {
    router.push(`/admin/staff/${staffMember.id}/attendance`);
  };

  const filteredStaff = staff.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStaffSessions = (staffId: string) => {
    return classSessions
      .filter((session) => session.staffId === staffId || session.replacedBy === staffId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getStatusBadge = (status: string, size: "sm" | "default" = "default") => {
    const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "";
    switch (status) {
      case "attended":
        return (
          <Badge className={`bg-green-500 hover:bg-green-600 flex items-center gap-1 ${sizeClass}`}>
            <CheckCircle className="w-3 h-3" /> O'tdi
          </Badge>
        );
      case "absent":
        return (
          <Badge variant="destructive" className={`flex items-center gap-1 ${sizeClass}`}>
            <XCircle className="w-3 h-3" /> Kelmadi
          </Badge>
        );
      case "replaced":
        return (
          <Badge className={`bg-blue-500 hover:bg-blue-600 flex items-center gap-1 ${sizeClass}`}>
            <UserX className="w-3 h-3" /> Almashdi
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 w-full space-y-6">
      {/* XABAR */}
      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm border w-full ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-500"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            Xodimlar Boshqaruvi
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Xodimlarni boshqarish va davomat kuzatish
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Xodim qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border h-11 text-sm"
            />
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 h-11 gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yangi Xodim Qo'shish</span>
            <span className="sm:hidden">Yangi Qo'shish</span>
          </Button>
        </div>
      </div>

      {/* Staff Table */}
      <Card className="overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ism</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Telefon</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Fan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Maosh</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Davomat</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staffMember) => {
                const staffSessions = getStaffSessions(staffMember.id);
                const attendedCount = staffSessions.filter(
                  (s) => s.staffId === staffMember.id && s.status === "attended"
                ).length;
                const absentCount = staffSessions.filter(
                  (s) => s.staffId === staffMember.id && s.status === "absent"
                ).length;
                const replacedCount = staffSessions.filter(
                  (s) => s.replacedBy === staffMember.id && s.status === "replaced"
                ).length;

                return (
                  <tr
                    key={staffMember.id}
                    className="border-b border-border hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {staffMember.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {staffMember.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {staffMember.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {staffMember.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {Number(staffMember.salary).toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {attendedCount > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {attendedCount}
                          </span>
                        )}
                        {absentCount > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {absentCount}
                          </span>
                        )}
                        {replacedCount > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                            <UserX className="w-3 h-3" />
                            {replacedCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewAttendance(staffMember)}
                          className="p-2 hover:bg-muted rounded-lg transition group"
                          title="Davomat kalendari"
                        >
                          <CalendarIcon className="w-4 h-4 text-purple-500 group-hover:scale-110 transition" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaff(staffMember);
                            setFormData({
                              fullName: staffMember.fullName,
                              email: staffMember.email,
                              phone: staffMember.phone,
                              subject: staffMember.subject,
                              salary: staffMember.salary,
                            });
                            setIsEditDialogOpen(true);
                          }}
                          className="p-2 hover:bg-muted rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(staffMember.id)}
                          className="p-2 hover:bg-muted rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="block md:hidden p-4 space-y-4">
          {filteredStaff.map((staffMember) => {
            const staffSessions = getStaffSessions(staffMember.id);
            const attendedCount = staffSessions.filter(
              (s) => s.staffId === staffMember.id && s.status === "attended"
            ).length;
            const absentCount = staffSessions.filter(
              (s) => s.staffId === staffMember.id && s.status === "absent"
            ).length;
            const replacedCount = staffSessions.filter(
              (s) => s.replacedBy === staffMember.id && s.status === "replaced"
            ).length;

            return (
              <Card key={staffMember.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {staffMember.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">{staffMember.email}</p>
                    </div>
                    <div className="flex gap-1">
                      {attendedCount > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {attendedCount}
                        </span>
                      )}
                      {absentCount > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {absentCount}
                        </span>
                      )}
                      {replacedCount > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {replacedCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Telefon</p>
                      <p className="font-medium">{staffMember.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fan</p>
                      <p className="font-medium">{staffMember.subject}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Maosh</p>
                      <p className="font-medium">
                        {Number(staffMember.salary).toLocaleString()} so'm
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <button
                      onClick={() => handleViewAttendance(staffMember)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition text-purple-600 text-xs font-medium"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span>Davomat</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedStaff(staffMember);
                          setFormData({
                            fullName: staffMember.fullName,
                            email: staffMember.email,
                            phone: staffMember.phone,
                            subject: staffMember.subject,
                            salary: staffMember.salary,
                          });
                          setIsEditDialogOpen(true);
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(staffMember.id)}
                        className="p-2 hover:bg-muted rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi xodim qo'shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>To'liq ism</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Aliyev Jasur"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jasur@hp.com"
                type="email"
              />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998901234567"
              />
            </div>
            <div>
              <Label>Fan</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fanni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingliz tili">Ingliz tili</SelectItem>
                  <SelectItem value="Matematika">Matematika</SelectItem>
                  <SelectItem value="Fizika">Fizika</SelectItem>
                  <SelectItem value="Kimyo">Kimyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Maosh (so'm)</Label>
              <Input
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="3000000"
                type="number"
              />
            </div>
            <Button onClick={handleAdd} className="w-full">
              Qo'shish
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xodimni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>To'liq ism</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                type="email"
              />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Fan</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingliz tili">Ingliz tili</SelectItem>
                  <SelectItem value="Matematika">Matematika</SelectItem>
                  <SelectItem value="Fizika">Fizika</SelectItem>
                  <SelectItem value="Kimyo">Kimyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Maosh (so'm)</Label>
              <Input
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                type="number"
              />
            </div>
            <Button onClick={handleEdit} className="w-full">
              Saqlash
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xodimni o'chirish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Ushbu xodimni o'chirishni xohlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={closeDeleteModal} className="flex-1">
                Bekor qilish
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                O'chirish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

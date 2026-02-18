"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { workersApi, type UserProfile } from "@/lib/api";

export default function AdminStaffPage() {
  const router = useRouter();

  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<UserProfile | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const workers = await workersApi.list();
      setStaff(workers);
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setFormData({ username: "", password: "", first_name: "", last_name: "", phone: "" });
  };

  const handleAdd = async () => {
    if (!formData.username || !formData.password || !formData.first_name || !formData.last_name) {
      showMessage("error", "Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    try {
      await workersApi.create(formData);
      await loadData();
      resetForm();
      setIsAddDialogOpen(false);
      showMessage("success", "Yangi xodim qo'shildi");
    } catch {
      showMessage("error", "Xatolik yuz berdi");
    }
  };

  const handleEdit = async () => {
    if (!selectedStaff) return;
    try {
      const patch: Partial<typeof formData> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      };
      if (formData.password) patch.password = formData.password;
      await workersApi.patch(selectedStaff.id, patch);
      await loadData();
      resetForm();
      setSelectedStaff(null);
      setIsEditDialogOpen(false);
      showMessage("success", "Xodim ma'lumotlari yangilandi");
    } catch {
      showMessage("error", "Xatolik yuz berdi");
    }
  };

  const openDeleteModal = (id: number) => {
    setStaffToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;
    try {
      await workersApi.delete(staffToDelete);
      setStaff((prev) => prev.filter((s) => s.id !== staffToDelete));
      showMessage("success", "Xodim o'chirildi");
    } catch {
      showMessage("error", "O'chirishda xatolik");
    }
    setStaffToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const filteredStaff = staff.filter((s) => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || s.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-4 md:p-8 w-full space-y-6">
      {/* Message */}
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
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-muted/30 rounded" />
            ))}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-175">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ism</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Username</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Telefon</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Rol</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="border-b border-border hover:bg-muted/50 transition">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {member.first_name} {member.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {member.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {member.phone || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="text-xs">
                          {member.role === "owner" ? "Admin" : "Xodim"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/admin/staff/${member.id}/attendance`)}
                            className="p-2 hover:bg-muted rounded-lg transition group"
                            title="Davomat kalendari"
                          >
                            <CalendarIcon className="w-4 h-4 text-purple-500 group-hover:scale-110 transition" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStaff(member);
                              setFormData({
                                username: member.username,
                                password: "",
                                first_name: member.first_name || "",
                                last_name: member.last_name || "",
                                phone: member.phone || "",
                              });
                              setIsEditDialogOpen(true);
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(member.id)}
                            className="p-2 hover:bg-muted rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden p-4 space-y-4">
              {filteredStaff.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">@{member.username}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {member.role === "owner" ? "Admin" : "Xodim"}
                      </Badge>
                    </div>

                    {member.phone && (
                      <p className="text-sm text-muted-foreground">{member.phone}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <button
                        onClick={() => router.push(`/admin/staff/${member.id}/attendance`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition text-purple-600 text-xs font-medium"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        <span>Davomat</span>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStaff(member);
                            setFormData({
                              username: member.username,
                              password: "",
                              first_name: member.first_name || "",
                              last_name: member.last_name || "",
                              phone: member.phone || "",
                            });
                            setIsEditDialogOpen(true);
                          }}
                          className="p-2 hover:bg-muted rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(member.id)}
                          className="p-2 hover:bg-muted rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi xodim qo'shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Username *</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="jasur123"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Parol *</Label>
              <Input
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                type="password"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ism *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Jasur"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Familiya *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Aliyev"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998901234567"
                className="mt-1"
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ism</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Familiya</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Yangi parol (ixtiyoriy)</Label>
              <Input
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Bo'sh qoldirsangiz o'zgarmaydi"
                type="password"
                className="mt-1"
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
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1">
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

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtDate } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  KeyRound,
  Pencil,
 
  Phone,
 
  Plus,
  Save,

  Shield,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { ownersApi, type UserProfile } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const EMPTY_NEW_ADMIN = { username: "", password: "", first_name: "", last_name: "", phone: "" };

export default function AdminProfilePage() {
  const { user } = useAuth();

  /* ── My profile ── */
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ first_name: "", last_name: "", phone: "", telegram_id: "" });
  const [savingInfo, setSavingInfo] = useState(false);
  const [editingPass, setEditingPass] = useState(false);
  const [passForm, setPassForm] = useState({ password: "", confirm: "" });
  const [savingPass, setSavingPass] = useState(false);

  /* ── Admins list ── */
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState(EMPTY_NEW_ADMIN);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Loaders ── */
  const loadAdmins = useCallback(() => {
    ownersApi.list().then(setAdmins).catch(console.error).finally(() => setAdminsLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    ownersApi
      .get(user.id)
      .then((data) => {
        setProfile(data);
        setInfoForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone: data.phone ?? "",
          telegram_id: data.telegram_id ?? "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  /* ── Handlers ── */
  const handleInfoSave = async () => {
    if (!user?.id) return;
    setSavingInfo(true);
    try {
      const updated = await ownersApi.patch(user.id, {
        first_name: infoForm.first_name,
        last_name: infoForm.last_name,
        phone: infoForm.phone,
        telegram_id: infoForm.telegram_id || null,
      });
      setProfile(updated);
      setEditingInfo(false);
      toast.success("Ma'lumotlar saqlandi");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setSavingInfo(false);
    }
  };

  const cancelInfo = () => {
    if (!profile) return;
    setInfoForm({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone: profile.phone ?? "",
      telegram_id: profile.telegram_id ?? "",
    });
    setEditingInfo(false);
  };

  const handlePassSave = async () => {
    if (!user?.id) return;
    if (passForm.password.length < 8) { toast.error("Parol kamida 8 ta belgidan iborat bo'lishi kerak"); return; }
    if (passForm.password !== passForm.confirm) { toast.error("Parollar mos kelmadi"); return; }
    setSavingPass(true);
    try {
      await ownersApi.patch(user.id, { password: passForm.password });
      setEditingPass(false);
      setPassForm({ password: "", confirm: "" });
      toast.success("Parol yangilandi");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setSavingPass(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password || !newAdmin.first_name || !newAdmin.last_name) {
      toast.error("Barcha majburiy maydonlarni to'ldiring"); return;
    }
    if (newAdmin.username.length < 6) { toast.error("Username kamida 6 ta belgi bo'lishi kerak"); return; }
    if (newAdmin.password.length < 8) { toast.error("Parol kamida 8 ta belgi bo'lishi kerak"); return; }
    setCreating(true);
    try {
      await ownersApi.create(newAdmin);
      loadAdmins();
      setNewAdmin(EMPTY_NEW_ADMIN);
      setAddOpen(false);
      toast.success("Yangi admin yaratildi");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await ownersApi.delete(deleteId);
      loadAdmins();
      setDeleteId(null);
      toast.success("Admin o'chirildi");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  const displayName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : profile?.username ?? "—";

  const initials = displayName
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profil</h1>
        <p className="text-muted-foreground mt-1">
          Shaxsiy ma&apos;lumotlaringizni ko&apos;ring va tahrirlang
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Yuklanmoqda...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: avatar card ── */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-6 flex flex-col items-center text-center gap-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {initials || <User className="w-10 h-10 text-primary" />}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground">@{profile?.username}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className="bg-purple-500">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin (Owner)
                </Badge>
                {profile?.is_active && (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Faol
                  </Badge>
                )}
              </div>
              {(profile?.created_at || profile?.last_login) && (
                <div className="w-full space-y-1 pt-2 border-t text-xs text-muted-foreground text-left">
                  {profile?.created_at && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      Qo&apos;shilgan: {fmtDate(profile.date_joined ?? profile.created_at)}
                    </span>
                  )}
                  {profile?.last_login && (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      So&apos;nggi kirish: {fmtDate(profile.last_login)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: info + password ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Personal info */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold">Shaxsiy ma&apos;lumotlar</h3>
                </div>
                {!editingInfo && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditingInfo(true)}>
                    {/* <Pencil className="w-3.5 h-3.5" /> */}
                    Tahrirlash
                  </Button>
                )}
              </div>
              <div className="p-5">
                {!editingInfo ? (
                  <div className="space-y-0">
                    <InfoRow label="Ism" value={profile?.first_name || "—"} />
                    <InfoRow label="Familiya" value={profile?.last_name || "—"} />
                    <InfoRow label="Telefon" value={profile?.phone || "—"}  />
                    <InfoRow label="Telegram ID" value={profile?.telegram_id || "—"} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="first_name">Ism</Label>
                        <Input id="first_name" value={infoForm.first_name}
                          onChange={(e) => setInfoForm((f) => ({ ...f, first_name: e.target.value }))}
                          placeholder="Ism" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="last_name">Familiya</Label>
                        <Input id="last_name" value={infoForm.last_name}
                          onChange={(e) => setInfoForm((f) => ({ ...f, last_name: e.target.value }))}
                          placeholder="Familiya" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Telefon raqam</Label>
                      <Input id="phone" value={infoForm.phone}
                        onChange={(e) => setInfoForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+998901234567" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="telegram_id">Telegram ID</Label>
                      <Input id="telegram_id" value={infoForm.telegram_id}
                        onChange={(e) => setInfoForm((f) => ({ ...f, telegram_id: e.target.value }))}
                        placeholder="123456789" />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button onClick={handleInfoSave} disabled={savingInfo} className="gap-2">
                        <Save className="w-4 h-4" />
                        {savingInfo ? "Saqlanmoqda..." : "Saqlash"}
                      </Button>
                      <Button variant="outline" onClick={cancelInfo} className="gap-2">
                        <X className="w-4 h-4" />
                        Bekor qilish
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold">Parol</h3>
                </div>
                {!editingPass && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditingPass(true)}>
                    {/* <Pencil className="w-3.5 h-3.5" /> */}
                    O&apos;zgartirish
                  </Button>
                )}
              </div>
              <div className="p-5">
                {!editingPass ? (
                  <p className="text-sm text-muted-foreground">
                    Xavfsizlik maqsadida parolingizni muntazam o&apos;zgartirib turing
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="new_pass">Yangi parol</Label>
                        <Input id="new_pass" type="password" value={passForm.password}
                          onChange={(e) => setPassForm((f) => ({ ...f, password: e.target.value }))}
                          placeholder="Kamida 8 ta belgi" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirm_pass">Tasdiqlash</Label>
                        <Input id="confirm_pass" type="password" value={passForm.confirm}
                          onChange={(e) => setPassForm((f) => ({ ...f, confirm: e.target.value }))}
                          placeholder="Parolni qayta kiriting" />
                      </div>
                    </div>
                    {passForm.password && passForm.confirm && passForm.password !== passForm.confirm && (
                      <p className="text-xs text-red-500">Parollar mos kelmadi</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handlePassSave} disabled={savingPass} className="gap-2">
                        <Save className="w-4 h-4" />
                        {savingPass ? "Saqlanmoqda..." : "Saqlash"}
                      </Button>
                      <Button variant="outline" className="gap-2"
                        onClick={() => { setEditingPass(false); setPassForm({ password: "", confirm: "" }); }}>
                        <X className="w-4 h-4" />
                        Bekor qilish
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Admins section ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Adminlar</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Tizim egalarini boshqaring</p>
          </div>
          <Button className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yangi admin</span>
            <span className="sm:hidden">Qo&apos;shish</span>
          </Button>
        </div>

        {adminsLoading ? (
          <p className="text-muted-foreground animate-pulse">Yuklanmoqda...</p>
        ) : admins.length === 0 ? (
          <div className="rounded-xl border p-10 text-center text-muted-foreground">
            Adminlar topilmadi
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {admins.map((admin) => {
              const name =
                admin.first_name || admin.last_name
                  ? `${admin.first_name} ${admin.last_name}`.trim()
                  : admin.username;
              const ini = name.split(" ").map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase();
              const isMe = admin.id === user?.id;
              return (
                <div key={admin.id}
                  className={`rounded-xl border bg-card p-5 flex items-start gap-4 ${isMe ? "ring-2 ring-primary/30" : ""}`}>
                  <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-purple-700">{ini || "A"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold truncate">{name}</p>
                      {isMe && <Badge variant="outline" className="text-xs text-primary border-primary/40">Men</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{admin.username}</p>
                    {admin.phone && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" />{admin.phone}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />{fmtDate(admin.created_at)}
                    </p>
                  </div>
                  {!isMe && (
                    <button onClick={() => setDeleteId(admin.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create admin dialog ── */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setNewAdmin(EMPTY_NEW_ADMIN); }}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Yangi admin qo&apos;shish
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="a_first">Ism <span className="text-red-500">*</span></Label>
                <Input id="a_first" value={newAdmin.first_name}
                  onChange={(e) => setNewAdmin((f) => ({ ...f, first_name: e.target.value }))}
                  placeholder="Ism" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a_last">Familiya <span className="text-red-500">*</span></Label>
                <Input id="a_last" value={newAdmin.last_name}
                  onChange={(e) => setNewAdmin((f) => ({ ...f, last_name: e.target.value }))}
                  placeholder="Familiya" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a_user">Username <span className="text-red-500">*</span></Label>
              <Input id="a_user" value={newAdmin.username}
                onChange={(e) => setNewAdmin((f) => ({ ...f, username: e.target.value }))}
                placeholder="Kamida 6 ta belgi" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a_pass">Parol<span className="text-red-500">*</span></Label>
              <Input id="a_pass" type="password" value={newAdmin.password}
                onChange={(e) => setNewAdmin((f) => ({ ...f, password: e.target.value }))}
                placeholder="Kamida 8 ta belgi" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a_phone">Telefon</Label>
              <Input id="a_phone" value={newAdmin.phone}
                onChange={(e) => setNewAdmin((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+998901234567" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleCreateAdmin} disabled={creating} className="flex-1 gap-2">
                <Save className="w-4 h-4" />
                {creating ? "Yaratilmoqda..." : "Yaratish"}
              </Button>
              <Button variant="outline" onClick={() => setAddOpen(false)} className="gap-2">
                <X className="w-4 h-4" />
                Bekor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ── */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent className="max-w-sm w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Adminni o&apos;chirish
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bu adminni tizimdan o&apos;chirishni xohlaysizmi? Bu amalni qaytarib bo&apos;lmaydi.
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="destructive" onClick={handleDeleteAdmin} disabled={deleting} className="flex-1 gap-2">
              <Trash2 className="w-4 h-4" />
              {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="gap-2">
              <X className="w-4 h-4" />
              Bekor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 w-28">{label}</span>
      <span className="flex items-center gap-1.5 text-sm font-medium text-right">
        {icon}
        {value}
      </span>
    </div>
  );
}

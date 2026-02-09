import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  X } from "lucide-react";
import { Student } from "@/lib/api";

interface Props {
  student: Student;
  onClose: () => void;
  onUpdate: (changes: Partial<Student> & { id: number }) => Promise<void>;
}

export function EditStudentModal({ student, onClose, onUpdate }: Props) {
  const original = {
    username: student.username,
    first_name: student.first_name,
    last_name: student.last_name,
    phone: student.phone,
    parent_phone: student.parent_phone,
    telegram_id:student.telegram_id || ''
  };

  const [form, setForm] = useState({
  ...original,
  telegram_id: student.telegram_id || "",
});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const hasChanges = () => {
    return (
      form.username !== original.username ||
      form.first_name !== original.first_name ||
      form.last_name !== original.last_name ||
      form.phone !== original.phone ||
      form.parent_phone !== original.parent_phone ||
      form.telegram_id !== original.telegram_id ||
      password !== ""
    );
  };

  const handleSave = async () => {
    setError("");

    if (password && password !== confirmPassword) {
      setError("Parollar mos emas");
      return;
    }

    if (password && password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak");
      return;
    }

    const changes: any = { id: student.id };

    if (form.username !== original.username) changes.username = form.username;
    if (form.first_name !== original.first_name) changes.first_name = form.first_name;
    if (form.last_name !== original.last_name) changes.last_name = form.last_name;
    if (form.phone !== original.phone) changes.phone = form.phone;
    if (form.parent_phone !== original.parent_phone) changes.parent_phone = form.parent_phone;
    if (password) changes.password = password;
    if (form.telegram_id !== original.telegram_id) changes.telegram_id = form.telegram_id || null;
    if (Object.keys(changes).length <= 1) return;

    try {
      await onUpdate(changes);
      onClose();
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">O'quvchi tahrirlash</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ism</Label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Familiya</Label>
              <Input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Login</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Telefon</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Ota-ona telefoni</Label>
            <Input
              value={form.parent_phone}
              onChange={(e) => setForm({ ...form, parent_phone: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
  <Label className="flex items-center gap-2">
    
    Telegram ID
  </Label>
  <Input
    placeholder="123456789"
    value={form.telegram_id}
    onChange={(e) => setForm({ ...form, telegram_id: e.target.value })}
    className="mt-1"
  />
  <p className="text-xs text-muted-foreground mt-1">
    Faqat raqamlar, masalan: 123456789
  </p>
</div>
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium text-foreground mb-3">Parolni o'zgartirish (ixtiyoriy)</p>
            <div className="space-y-3">
              <div>
                <Label>Yangi parol</Label>
                <Input
                  type="password"
                  placeholder="Bo'sh qoldirsangiz, o'zgarmaydi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Parolni tasdiqlash</Label>
                <Input
                  type="password"
                  placeholder="Yana kiriting"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges()} className="flex-1">
            Saqlash
          </Button>
        </div>
      </div>
    </div>
  );
}
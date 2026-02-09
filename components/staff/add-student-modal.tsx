// components/staff/add-student-modal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SendIcon, X } from "lucide-react";

interface Props {
  groupId: number;
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
   isOpen: boolean; 
}

export function AddStudentModal({ groupId, onClose, onAdd, isOpen }: Props) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    parent_phone: "",
    telegram_id:""
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    server: "",
  });

  const validate = () => {
    const newErrors = { username: "", password: "", server: "" };
    if (form.username?.length < 6) newErrors.username = "Kamida 6 belgi";
    if (form.password?.length < 8) newErrors.password = "Kamida 8 belgi";
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await onAdd({ ...form, group: groupId ,telegram_id: form.telegram_id || null });
      onClose();
    } catch (err: any) {
      setErrors(prev => ({ ...prev, server: err.message }));
    }
  };

   if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Yangi O'quvchi</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.server && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {errors.server}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ism</Label>
              <Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Familiya</Label>
              <Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Login</Label>
            <Input value={form.username} onChange={e => { setForm({ ...form, username: e.target.value }); setErrors({ ...errors, username: "" }); }} className="mt-1" />
            {errors.username && <p className="text-destructive text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <Label>Parol</Label>
            <Input type="password" value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }} className="mt-1" />
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label>Telefon</Label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+998..." className="mt-1" />
          </div>

          <div>
            <Label>Ota-ona telefoni</Label>
            <Input value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} placeholder="+998..." className="mt-1" />
          </div>
        </div>
        <div>
  <Label className="flex items-center gap-2">
    <SendIcon className="w-4 h-4 text-blue-500" />
    Telegram ID (ixtiyoriy)
  </Label>
  <Input
    placeholder="123456789"
    value={form.telegram_id}
    onChange={(e) => setForm({ ...form, telegram_id: e.target.value })}
    className="mt-1"
  />
</div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Bekor</Button>
          <Button onClick={handleSubmit} disabled={form.username?.length < 6 || form.password?.length < 8} className="flex-1">
            Qo'shish
          </Button>
        </div>
      </div>
    </div>
  );
}
// components/staff/add-group-modal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onAdd: (data: { name: string; description?: string|null; is_active: boolean }) => Promise<void>;
}

export function AddGroupModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    try {
      await onAdd({
        name: form.name,
        description: form.description || null,
        is_active: form.is_active,
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Yangi Guruh Qo'shish</h2>
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
          <div>
            <Label>Guruh nomi *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="IELTS-02"
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <Label>Izoh (ixtiyoriy)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Masalan: IELTS 7.0 tayyorgarlik"
              className="mt-1 min-h-20"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="new-active" className="flex items-center gap-2">
              Guruh faol
            </Label>
            <Switch
              id="new-active"
              checked={form.is_active}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="flex-1"
          >
            Yaratish
          </Button>
        </div>
      </div>
    </div>
  );
}
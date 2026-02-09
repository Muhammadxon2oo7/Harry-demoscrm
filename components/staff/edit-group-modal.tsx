// components/staff/edit-group-modal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

interface Group {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface Props {
  group: Group;
  onClose: () => void;
  onUpdate: (data: Partial<Group>) => Promise<void>;
}

export function EditGroupModal({ group, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({
    name: group.name,
    description: group.description || "",
    is_active: group.is_active,
  });

  const [error, setError] = useState("");

  const hasChanges = () => {
    return (
      form.name !== group.name ||
      form.description !== (group.description || "") ||
      form.is_active !== group.is_active
    );
  };

  const handleSave = async () => {
    const changes: any = {};
    if (form.name !== group.name) changes.name = form.name;
    if (form.description !== (group.description || "")) changes.description = form.description || null;
    if (form.is_active !== group.is_active) changes.is_active = form.is_active;

    if (Object.keys(changes)?.length === 0) return;

    try {
      await onUpdate(changes);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Guruh tahrirlash</h2>
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
            <Label>Guruh nomi</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1"
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
            <Label htmlFor="active" className="flex items-center gap-2">
              Guruh faol
            </Label>
            <Switch
              id="active"
              checked={form.is_active}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            />
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
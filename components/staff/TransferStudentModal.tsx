// components/staff/transfer-student-modal.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Users } from "lucide-react";
import { getStaffGroups } from "@/lib/api";
import { toast } from "@/lib/toast";

type Props = {
  studentName: string;
  currentGroupId: number;
  studentId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function TransferStudentModal({ studentName, currentGroupId, studentId, isOpen, onClose, onSuccess }: Props) {
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const loadGroups = async () => {
        try {
          const data = await getStaffGroups();
          // Joriy guruhni olib tashlaymiz
          setGroups(data.filter((g: any) => g.id !== currentGroupId));
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      loadGroups();
      setSelectedGroup("");
    }
  }, [isOpen, currentGroupId]);

  const handleTransfer = async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      await import("@/lib/api").then(({ transferStudent }) =>
        transferStudent(studentId, currentGroupId, Number(selectedGroup))
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            O'quvchini ko'chirish
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{studentName}</span> ni boshqa guruhga o'tkazing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group">Yangi guruh</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup} disabled={fetching || loading}>
              <SelectTrigger id="group">
                <SelectValue placeholder={fetching ? "Yuklanmoqda..." : "Guruhni tanlang"} />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id.toString()}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={handleTransfer} disabled={!selectedGroup || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ko'chirilmoqda...
              </>
            ) : (
              "Ko'chirish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
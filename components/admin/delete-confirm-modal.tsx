// components/admin/delete-confirm-modal.tsx
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Tasdiqlash",
  message = "Ushbu amalni bajarishni xohlaysizmi?",
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card p-6 rounded-xl shadow-lg w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-6">{message}</p>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Yo'q
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1"
          >
            Ha, o'chirish
          </Button>
        </div>
      </div>
    </div>
  );
}
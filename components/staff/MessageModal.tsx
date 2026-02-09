// Yangi komponent: MessageModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";
import { sendMessageToStudents } from "@/lib/api";

export function MessageModal({ 
  studentIds, 
  onClose, 
  onSuccess 
}: { 
  studentIds: number[]; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await sendMessageToStudents(studentIds, message);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Send className="w-5 h-5 text-green-600" />
            Xabar yuborish
          </h2>
          <button onClick={onClose} className="ml-auto p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Tanlangan o‘quvchilar soni: <strong>{studentIds.length}</strong>
        </p>

        <Textarea
          placeholder="Xabar matnini kiriting..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-32 resize-none"
          maxLength={1000}
        />
        <p className="text-right text-xs text-muted-foreground mt-1">
          {message.length}/1000
        </p>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !message.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {sending ? "Yuborilmoqda..." : <>Yuborish <Send className="w-4 h-4 ml-2" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}
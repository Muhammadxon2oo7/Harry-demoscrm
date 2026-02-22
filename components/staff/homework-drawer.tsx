"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, FileText, Clock, Plus, Download, Trash2, Send } from "lucide-react";
import { format } from "date-fns";
import { homeworkApi } from "@/lib/api";
import { toast } from "@/lib/toast";

interface Homework {
  id: number;
  text: string;
  file: string | null;
  created_at: string;
}

interface Props {
  homeworks: Homework[];
  groupId: number;
  isOpen: boolean;
  onClose: () => void;
  onHomeworkAdded: (hw: Homework) => void;
  onHomeworkDeleted?: (id: number) => void;
}

export function HomeworkDrawer({
  homeworks: initialHomeworks,
  groupId,
  isOpen,
  onClose,
  onHomeworkAdded,
  onHomeworkDeleted,
}: Props) {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialHomeworks) {
      const sorted = [...initialHomeworks].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setHomeworks(sorted);
    }
  }, [initialHomeworks]);

  const handleSubmit = async () => {
    if (!text.trim() && !file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("group", String(groupId));
      if (text) formData.append("text", text);
      if (file) formData.append("file", file);
      const record = await homeworkApi.create(formData);
      const hw: Homework = { id: record.id, text: record.text, file: record.file, created_at: record.created_at };
      setHomeworks((prev) => {
        const updated = [hw, ...prev];
        return updated.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      onHomeworkAdded(hw);
      setText("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const allowed = ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowed.includes(selected.type)) {
      toast.info("Faqat PDF, Word yoki rasm yuklang");
        return;
      }
      setFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange({ target: { files: [dropped] } } as any);
  };

  const handleDelete = async (id: number) => {
    if (deleting) return;
    setDeleting(id);
    try {
      await homeworkApi.delete(id);
      setHomeworks((prev) => prev.filter((hw) => hw.id !== id));
      onHomeworkDeleted?.(id);
    } catch (err: any) {
      toast.error("O'chirishda xatolik: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 h-full" onClick={onClose} />

      {/* MOBIL */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom">
        <div className="flex flex-col ">
          <div className="flex justify-center pt-3">
            <div className="w-12 h-1 bg-muted rounded-full" />
          </div>

          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Uyga vazifa
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* INPUT */}
          <div className="p-4 space-y-3">
            <Textarea
              placeholder="Matnli vazifa yozing... (ixtiyoriy)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-20 resize-none"
              disabled={uploading}
            />

            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                dragActive ? "border-primary bg-primary/5" : "border-muted"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-xs truncate flex-1 mr-2">{file.name}</span>
                  <button
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-destructive hover:bg-destructive/10 rounded p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className={`w-8 h-8 mx-auto mb-1 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-xs">Faylni olib keling yoki</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="h-7 text-xs mt-1"
                  >
                    Tanlash
                  </Button>
                </>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={uploading || (!text.trim() && !file)}
              className="w-full h-9 text-xs"
            >
              {uploading ? "Yuborilmoqda..." : <><Send className="w-3.5 h-3.5 mr-1" /> Yuborish</>}
            </Button>
          </div>

          {/* LIST */}
          <div className="flex-1 px-4 pb-6 h-[50vh]">
            {homeworks.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">Vazifa yo‘q</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-scroll  h-[50vh]">
                {homeworks.map((hw, index) => {
                  const displayNumber = homeworks.length - index;
                  const isDeleting = deleting === hw.id;

                  return (
                    <div key={hw.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${index === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                        {index < homeworks.length - 1 && <div className="w-px h-full bg-muted-foreground mt-1 flex-1" />}
                      </div>
                      <Card className="flex-1 p-3 hover:shadow-sm transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="truncate">Vazifa #{displayNumber}</span>
                            </h4>

                            {/* TEXT */}
                            {hw.text && (
                              <p className="text-xs text-foreground mt-2 whitespace-pre-wrap">
                                {hw.text}
                              </p>
                            )}

                            {/* FILE */}
                            {hw.file && (
                              <a
                                href={hw.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:underline"
                              >
                                <Download className="w-3 h-3" />
                                Faylni yuklab olish
                              </a>
                            )}

                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              {format(new Date(hw.created_at), "dd MMM • HH:mm")}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDelete(hw.id)}
                            disabled={isDeleting}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg transition text-destructive"
                            title="O‘chirish"
                          >
                            {isDeleting ? (
                              <div className="w-3.5 h-3.5 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block fixed right-0 top-0 h-full w-96 bg-card shadow-2xl z-50 overflow-hidden animate-in slide-in-from-right">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Uyga vazifa
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <Textarea
              placeholder="Matnli vazifa yozing... (ixtiyoriy)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-28 resize-none"
              disabled={uploading}
            />

            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive ? "border-primary bg-primary/5" : "border-muted"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm truncate flex-1 mr-3">{file.name}</span>
                  <button
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-destructive hover:bg-destructive/10 rounded p-1.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium mb-1">Faylni olib keling</p>
                  <p className="text-xs text-muted-foreground mb-3">yoki</p>
                  <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Plus className="w-4 h-4 mr-1.5" /> Fayl tanlash
                  </Button>
                </>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={uploading || (!text.trim() && !file)}
              className="w-full"
            >
              {uploading ? "Yuborilmoqda..." : <><Send className="w-4 h-4 mr-2" /> Yuborish</>}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {homeworks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">Vazifa mavjud emas</p>
              </div>
            ) : (
              <div className="space-y-5 ">
                {homeworks.map((hw, index) => {
                  const displayNumber = homeworks.length - index;
                  const isDeleting = deleting === hw.id;

                  return (
                    <div key={hw.id} className="flex gap-4 ">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                        {index < homeworks.length - 1 && <div className="w-px h-full bg-muted-foreground mt-2 flex-1" />}
                      </div>
                      <Card className="flex-1 p-4 hover:shadow-md transition ">
                        <div className="flex items-start justify-between ">
                          <div className="flex-1 ">
                            <h4 className="font-medium flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              Vazifa #{displayNumber}
                            </h4>

                            {hw.text && (
                              <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">
                                {hw.text}
                              </p>
                            )}

                            {hw.file && (
                              <a
                                href={hw.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                <Download className="w-4 h-4" />
                                Faylni yuklab olish
                              </a>
                            )}

                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(hw.created_at), "dd MMM, yyyy • HH:mm")}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDelete(hw.id)}
                            disabled={isDeleting}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition text-destructive"
                            title="O‘chirish"
                          >
                            {isDeleting ? (
                              <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
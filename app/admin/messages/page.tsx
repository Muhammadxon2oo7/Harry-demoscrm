"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Send, RefreshCw, Plus, Users, CheckCircle2, XCircle,
  Clock, ChevronDown, ChevronUp, Search, Loader2, MessageSquare,
} from "lucide-react";
import {
  messagesApi, studentsApi, groupsApi,
  type MessageRecord, type UserProfile, type Group,
} from "@/lib/api";
import { fmtDateTime } from "@/lib/utils";
import { toast } from "@/lib/toast";

function statusBadge(status: "pending" | "sent" | "failed") {
  if (status === "sent")
    return <Badge className="bg-green-500/10 text-green-600 border border-green-200 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Yuborildi</Badge>;
  if (status === "failed")
    return <Badge className="bg-red-500/10 text-red-600 border border-red-200 text-xs"><XCircle className="w-3 h-3 mr-1" />Xatolik</Badge>;
  return <Badge variant="secondary" className="text-xs"><Clock className="w-3 h-3 mr-1" />Kutilmoqda</Badge>;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Send dialog
  const [sendOpen, setSendOpen] = useState(false);
  const [text, setText] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(() => {
    setLoading(true);
    messagesApi.list()
      .then((data) => setMessages(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Load groups for send dialog
  useEffect(() => {
    if (!sendOpen) return;
    groupsApi.list().then(setGroups).catch(console.error);
  }, [sendOpen]);

  // Load students when group changes
  useEffect(() => {
    if (!selectedGroup) { setStudents([]); return; }
    setLoadingStudents(true);
    studentsApi.list(Number(selectedGroup))
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoadingStudents(false));
  }, [selectedGroup]);

  const toggleStudent = (id: number) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () => {
    const filtered = filteredStudents.map((s) => s.id);
    const allSelected = filtered.every((id) => selectedIds.includes(id));
    if (allSelected) setSelectedIds((prev) => prev.filter((id) => !filtered.includes(id)));
    else setSelectedIds((prev) => [...new Set([...prev, ...filtered])]);
  };

  const filteredStudents = students.filter((s) => {
    const q = searchStudent.toLowerCase();
    return (
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q)
    );
  });

  const handleSend = async () => {
    if (!text.trim() || selectedIds.length === 0) return;
    setSending(true);
    try {
      await messagesApi.send({ text: text.trim(), recipient_ids: selectedIds });
      setSendOpen(false);
      setText("");
      setSelectedIds([]);
      setSelectedGroup("");
      loadMessages();
    } catch (e) {
      console.error(e);
      toast.error("Xabar yuborishda xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };

  const sentCount = messages.reduce(
    (s, m) => s + (m.logs?.filter((l) => l.status === "sent").length ?? 0), 0
  );
  const failedCount = messages.reduce(
    (s, m) => s + (m.logs?.filter((l) => l.status === "failed").length ?? 0), 0
  );

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Xabarlar</h1>
          <p className="text-muted-foreground">O&apos;quvchilarga Telegram orqali xabar yuborish</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadMessages}>
            <RefreshCw className="w-4 h-4 mr-2" />Yangilash
          </Button>
          <Button onClick={() => setSendOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />Xabar yuborish
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Jami xabarlar</p>
          <p className="text-2xl font-bold">{messages.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Muvaffaqiyatli</p>
          <p className="text-2xl font-bold text-green-600">{sentCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Xatolik</p>
          <p className="text-2xl font-bold text-red-600">{failedCount}</p>
        </Card>
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </Card>
          ))
        ) : messages.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-14 h-14 mx-auto text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">Xabarlar topilmadi</h3>
            <p className="text-muted-foreground mb-4">Hali hech qanday xabar yuborilmagan</p>
            <Button onClick={() => setSendOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />Birinchi xabar yuborish
            </Button>
          </Card>
        ) : (
          messages.map((msg) => {
            const expanded = expandedId === msg.id;
            const total = msg.logs?.length ?? msg.recipients?.length ?? 0;
            const sent = msg.logs?.filter((l) => l.status === "sent").length ?? 0;
            const failed = msg.logs?.filter((l) => l.status === "failed").length ?? 0;
            const pending = msg.logs?.filter((l) => l.status === "pending").length ?? 0;

            return (
              <Card key={msg.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="font-medium line-clamp-2">{msg.text}</p>
                    <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />{total} ta qabul qiluvchi
                      </span>
                      <span>{fmtDateTime(msg.created_at)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sent > 0 && (
                        <Badge className="bg-green-500/10 text-green-600 border border-green-200 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />{sent} yuborildi
                        </Badge>
                      )}
                      {failed > 0 && (
                        <Badge className="bg-red-500/10 text-red-600 border border-red-200 text-xs">
                          <XCircle className="w-3 h-3 mr-1" />{failed} xatolik
                        </Badge>
                      )}
                      {pending > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />{pending} kutilmoqda
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-xs h-8"
                    onClick={() => setExpandedId(expanded ? null : msg.id)}
                  >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Loglar
                  </Button>
                </div>

                {expanded && msg.logs && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Yuborish loglari
                    </p>
                    {msg.logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{log.recipient_name}</p>
                          {log.error && (
                            <p className="text-xs text-red-500 truncate">{log.error}</p>
                          )}
                          {log.sent_at && (
                            <p className="text-xs text-muted-foreground">{fmtDateTime(log.sent_at)}</p>
                          )}
                        </div>
                        {statusBadge(log.status)}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Send dialog */}
      <Dialog open={sendOpen} onOpenChange={(o) => { if (!o) { setSendOpen(false); setText(""); setSelectedIds([]); setSelectedGroup(""); setSearchStudent(""); }}}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />Yangi xabar yuborish
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Message text */}
            <div className="space-y-1.5">
              <Label>Xabar matni</Label>
              <Textarea
                placeholder="O'quvchilarga yuboriladigan xabar..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="resize-none"
                maxLength={1000}
              />
              <p className="text-right text-xs text-muted-foreground">{text.length}/1000</p>
            </div>

            {/* Group selector */}
            <div className="space-y-1.5">
              <Label>Guruh tanlang</Label>
              <select
                value={selectedGroup}
                onChange={(e) => { setSelectedGroup(e.target.value); setSelectedIds([]); }}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Guruh tanlang —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} ({g.subject_name})</option>
                ))}
              </select>
            </div>

            {/* Students list */}
            {selectedGroup && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>O&apos;quvchilar ({selectedIds.length} tanlangan)</Label>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={toggleAll}>
                    {filteredStudents.every((s) => selectedIds.includes(s.id)) ? "Hammasini olib tashlash" : "Hammasini tanlash"}
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="O'quvchi qidirish..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>

                {loadingStudents ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto border rounded-lg divide-y">
                    {filteredStudents.length === 0 ? (
                      <p className="p-4 text-center text-sm text-muted-foreground">O'quvchi topilmadi</p>
                    ) : (
                      filteredStudents.map((s) => {
                        const selected = selectedIds.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selected ? "bg-primary/5" : "hover:bg-muted/50"}`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleStudent(s.id)}
                              className="w-4 h-4 rounded text-primary"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{s.first_name} {s.last_name}</p>
                              <p className="text-xs text-muted-foreground">@{s.username}</p>
                            </div>
                            {!s.telegram_id && (
                              <span className="text-xs text-orange-500 shrink-0">Telegram yo&apos;q</span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Send / cancel */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSendOpen(false)}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || !text.trim() || selectedIds.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {sending
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Yuborilmoqda...</>
                  : <><Send className="w-4 h-4 mr-2" />Yuborish ({selectedIds.length})</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

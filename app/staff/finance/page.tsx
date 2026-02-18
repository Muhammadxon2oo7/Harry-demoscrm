"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Plus,
  Coins,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import {
  groupsApi,
  studentsApi,
  paymentsApi,
  type Group,
  type UserProfile,
  type PaymentRecord,
} from "@/lib/api";

const months = [
  { month: 1, month_name: "Yanvar" },
  { month: 2, month_name: "Fevral" },
  { month: 3, month_name: "Mart" },
  { month: 4, month_name: "Aprel" },
  { month: 5, month_name: "May" },
  { month: 6, month_name: "Iyun" },
  { month: 7, month_name: "Iyul" },
  { month: 8, month_name: "Avgust" },
  { month: 9, month_name: "Sentabr" },
  { month: 10, month_name: "Oktabr" },
  { month: 11, month_name: "Noyabr" },
  { month: 12, month_name: "Dekabr" },
];

export default function StaffFinancePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [allStudents, setAllStudents] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter states
  const [filterMonth, setFilterMonth] = useState<string>("all");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    async function load() {
      try {
        const [grps, studs, pays] = await Promise.all([
          groupsApi.list(),
          studentsApi.list(),
          paymentsApi.list(),
        ]);
        setGroups(grps);
        setAllStudents(studs);
        setTransactions(pays);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    setSelectedStudent("");
    if (groupId) {
      const gid = Number(groupId);
      const groupStudents = allStudents.filter(
        (s) => s.group?.id === gid || (typeof s.group === "number" && s.group === gid)
      );
      setStudents(groupStudents);
    } else {
      setStudents([]);
    }
  };

  const toggleMonth = (month: number) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  const handleAdd = async () => {
    setError("");
    if (!selectedGroup || !selectedStudent || selectedMonths.length === 0 || !amount) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError("To'lov miqdori ijobiy bo'lishi kerak");
      return;
    }
    setSubmitting(true);
    try {
      const newPayment = await paymentsApi.create({
        student: Number(selectedStudent),
        group: Number(selectedGroup),
        amount: num,
        months: selectedMonths.map((m) => ({ year: parseInt(selectedYear), month: m })),
      });
      setTransactions([newPayment, ...transactions]);
      resetForm();
      setShowAddDrawer(false);
      showMessage("success", "To'lov muvaffaqiyatli qo'shildi");
    } catch (err) {
      console.error(err);
      showMessage("error", "To'lov qo'shishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedGroup("");
    setSelectedStudent("");
    setAmount("");
    setSelectedYear(currentYear.toString());
    setSelectedMonths([]);
    setStudents([]);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.created_at);
      const month = date.getMonth() + 1;
      return filterMonth === "all" || month === parseInt(filterMonth);
    });
  }, [transactions, filterMonth]);

  const getStudentName = (t: PaymentRecord) => {
    if (typeof t.student === "object") {
      return `${t.student.first_name} ${t.student.last_name}`.trim() || t.student.username;
    }
    const found = allStudents.find((s) => s.id === (t.student as number));
    return found ? `${found.first_name} ${found.last_name}`.trim() || found.username : `O'quvchi #${t.student}`;
  };

  const getGroupName = (t: PaymentRecord) => {
    if (typeof t.group === "object") return t.group.name;
    const found = groups.find((g) => g.id === (t.group as number));
    return found ? found.name : `Guruh #${t.group}`;
  };

  return (
    <div className="p-4 md:p-8 w-full space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm border w-full ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-500"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Moliya
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            O&apos;quvchilar to&apos;lovlari
          </p>
        </div>

        <Button
          size="icon"
          className="fixed bottom-6 right-6 md:right-8 rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg bg-primary hover:bg-primary/90 z-10"
          onClick={() => setShowAddDrawer(true)}
        >
          <Plus className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Filter (to&apos;lov sanasi)</span>
        </div>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
            <SelectValue placeholder="Oy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha oylar</SelectItem>
            {months.map((m) => (
              <SelectItem key={m.month} value={m.month.toString()}>
                {m.month_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="font-mono text-xs md:text-sm">
          {filteredTransactions.length} ta to&apos;lov
        </Badge>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 md:space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Yuklanmoqda...</p>
        ) : filteredTransactions.length === 0 ? (
          <Card className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-3 md:mb-4">
              <Coins className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
            </div>
            <p className="font-medium text-base md:text-lg">To&apos;lov yo&apos;q</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Yangi to&apos;lov qo&apos;shing</p>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 md:p-5 hover:shadow-sm transition">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                    <h3 className="font-semibold truncate">{getStudentName(transaction)}</h3>
                    <Badge variant="secondary" className="text-xs">{getGroupName(transaction)}</Badge>
                    <Badge variant="outline" className="text-xs">{transaction.months_paid} oy</Badge>
                  </div>
                  <p className="text-green-600 font-medium text-sm md:text-base mt-1">
                    + {parseFloat(transaction.amount).toLocaleString()} so&apos;m
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {transaction.months?.map((m) => (
                      <Badge key={m.id} variant="outline" className="text-xs">
                        {m.month_name?.slice(0, 3)} {m.year}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {transaction.received_by
                        ? `${transaction.received_by.first_name} ${transaction.received_by.last_name}`.trim()
                        : ""}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(transaction.created_at), "dd MMM • HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Payment Drawer */}
      {showAddDrawer && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddDrawer(false)} />

          {/* Mobile */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 h-[85vh] overflow-hidden animate-in slide-in-from-bottom">
            <div className="flex flex-col h-full">
              <div className="flex justify-center pt-3">
                <div className="w-12 h-1 bg-muted rounded-full" />
              </div>
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Yangi to&apos;lov
                </h2>
                <button onClick={() => setShowAddDrawer(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">{renderForm()}</div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block fixed right-0 top-0 h-full w-96 bg-card shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right">
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Yangi to&apos;lov
                </h2>
                <button onClick={() => setShowAddDrawer(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderForm()}
            </div>
          </div>
        </>
      )}
    </div>
  );

  function renderForm() {
    return (
      <>
        <div>
          <Label className="text-sm">Guruh</Label>
          <Select value={selectedGroup} onValueChange={handleGroupChange}>
            <SelectTrigger className="mt-1 h-10">
              <SelectValue placeholder="Guruhni tanlang" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name} ({g.students_count} o&apos;quvchi)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm">O&apos;quvchi</Label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedGroup}>
            <SelectTrigger className="mt-1 h-10">
              <SelectValue placeholder="O'quvchini tanlang" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.first_name} {s.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm">Yil</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="mt-1 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm">Oylar</Label>
          <div className="grid grid-cols-3 gap-2 mt-2 max-h-50 overflow-y-auto">
            {months.map((m) => (
              <button
                key={m.month}
                onClick={() => toggleMonth(m.month)}
                className={`p-2 rounded-lg border text-xs font-medium transition-all h-9 ${
                  selectedMonths.includes(m.month)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-muted hover:bg-muted"
                }`}
              >
                {m.month_name.slice(0, 3)}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Tanlangan: {selectedMonths.length} oy</p>
        </div>

        <div>
          <Label htmlFor="amount" className="text-sm">Miqdor (so&apos;m)</Label>
          <Input
            id="amount"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500000"
            className="mt-1 h-10"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Button
          onClick={handleAdd}
          disabled={!selectedGroup || !selectedStudent || selectedMonths.length === 0 || !amount || submitting}
          className="w-full h-10 text-sm"
        >
          <Coins className="w-4 h-4 mr-2" />
          {submitting ? "Saqlanmoqda..." : "Qo'shish"}
        </Button>
      </>
    );
  }
}

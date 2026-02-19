"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Calendar,
  Users,
  Clock,
  AlertCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  groupsApi,
  studentsApi,
  paymentsApi,
  expensesApi,
  type Group,
  type UserProfile,
  type PaymentRecord,
  type ExpenseRecord,
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

const expenseCategories = [
  { value: "salary", label: "Ish haqi" },
  { value: "rent", label: "Ijara to'lovi" },
  { value: "utilities", label: "Kommunal xizmatlar" },
  { value: "equipment", label: "Jihozlar" },
  { value: "marketing", label: "Marketing" },
  { value: "other_expense", label: "Boshqa xarajat" },
];

type TransactionType = "income" | "expense";

export default function AdminFinancePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [allStudents, setAllStudents] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [grps, studs, pays, exps] = await Promise.all([
        groupsApi.list(),
        studentsApi.list(),
        paymentsApi.list(),
        expensesApi.list(),
      ]);
      setGroups(grps);
      setAllStudents(studs);
      setPayments(pays);
      setExpenses(exps);
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Form states
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>("income");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Student payment specific states
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [groupStudents, setGroupStudents] = useState<UserProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  // Filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; type: "payment" | "expense" | null }>({ open: false, id: null, type: null });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    setSelectedStudent("");
    setGroupStudents(allStudents.filter((s) => String(typeof s.group === "object" ? s.group?.id : s.group) === groupId));
  };

  const toggleMonth = (month: number) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  const resetForm = () => {
    setTransactionType("income");
    setExpenseCategory("");
    setAmount("");
    setDescription("");
    setRecipient("");
    setSelectedGroup("");
    setSelectedStudent("");
    setSelectedYear(currentYear.toString());
    setSelectedMonths([]);
    setGroupStudents([]);
    setError("");
  };

  const handleAdd = async () => {
    setError("");
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError("Miqdor ijobiy bo'lishi kerak");
      return;
    }

    try {
      if (transactionType === "income") {
        // Student payment
        if (!selectedStudent || !selectedGroup || selectedMonths.length === 0) {
          setError("Guruh, o'quvchi va oylarni tanlang");
          return;
        }
        await paymentsApi.create({
          student: Number(selectedStudent),
          group: Number(selectedGroup),
          amount: num,
          months: selectedMonths.map((m) => ({ year: parseInt(selectedYear), month: m })),
        });
        await paymentsApi.list().then(setPayments);
      } else {
        // Expense
        if (!expenseCategory || !description.trim()) {
          setError("Kategoriya va izoh kiriting");
          return;
        }
        await expensesApi.create({
          amount: num,
          reason: description.trim(),
          recipient: recipient || "—",
        });
        await expensesApi.list().then(setExpenses);
      }
      resetForm();
      setShowAddDrawer(false);
      showMessage("success", "Qo'shildi");
    } catch {
      showMessage("error", "Xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;
    try {
      if (deleteModal.type === "payment") {
        await paymentsApi.delete(deleteModal.id);
        setPayments((p) => p.filter((x) => x.id !== deleteModal.id));
      } else {
        await expensesApi.delete(deleteModal.id);
        setExpenses((e) => e.filter((x) => x.id !== deleteModal.id));
      }
      showMessage("success", "O'chirildi");
    } catch {
      showMessage("error", "O'chirishda xatolik");
    }
    setDeleteModal({ open: false, id: null, type: null });
  };

  // Unify transactions for display
  type DisplayTx = {
    id: number;
    type: TransactionType;
    title: string;
    groupName?: string;
    monthsPaid?: number;
    paidMonths?: { month_name: string; year: number }[];
    receivedBy?: string;
    amount: number;
    description: string;
    created_at: string;
    deleteType: "payment" | "expense";
  };

  const allTransactions = useMemo<DisplayTx[]>(() => {
    const pays: DisplayTx[] = payments.map((p) => {
      const studentName =
        p.student_name ||
        (typeof p.student === "object" ? `${p.student.first_name} ${p.student.last_name}` : "O'quvchi");
      const groupName =
        p.group_name ||
        (typeof p.group === "object" ? p.group.name : groups.find((g) => g.id === (typeof p.group === "number" ? p.group : p.group?.id))?.name);
      const rb = p.received_by;
      const receivedBy = rb
        ? (rb.first_name || rb.last_name ? `${rb.first_name} ${rb.last_name}`.trim() : rb.username)
        : undefined;
      return {
        id: p.id,
        type: "income",
        title: studentName,
        groupName,
        monthsPaid: p.months_paid,
        paidMonths: p.months?.map((m) => ({ month_name: m.month_name, year: m.year })),
        receivedBy,
        amount: parseFloat(String(p.amount)),
        description: `${p.months_paid || 1} oylik to'lov`,
        created_at: p.created_at,
        deleteType: "payment",
      };
    });
    const exps: DisplayTx[] = expenses.map((e) => ({
      id: e.id,
      type: "expense",
      title: expenseCategories.find((c) => c.value === e.reason)?.label || e.reason || "Xarajat",
      amount: parseFloat(String(e.amount)),
      description: e.reason || "",
      created_at: e.created_at,
      deleteType: "expense",
    }));
    return [...pays, ...exps].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [payments, expenses, groups]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const month = new Date(tx.created_at).getMonth() + 1;
      const typeMatch = filterType === "all" || tx.type === filterType;
      const monthMatch = filterMonth === "all" || month === parseInt(filterMonth);
      return typeMatch && monthMatch;
    });
  }, [allTransactions, filterType, filterMonth]);

  const totalIncome = useMemo(
    () => filteredTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );
  const totalExpense = useMemo(
    () => filteredTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );
  const profit = totalIncome - totalExpense;

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
            Umumiy moliyaviy hisobot
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

      {/* Statistics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-5 h-24 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 md:p-5 bg-linear-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Daromad</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">
                  {totalIncome.toLocaleString()} so'm
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-5 bg-linear-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Xarajat</p>
                <p className="text-xl md:text-2xl font-bold text-red-600">
                  {totalExpense.toLocaleString()} so'm
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-5 bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Foyda</p>
                <p className={`text-xl md:text-2xl font-bold ${profit >= 0 ? "text-primary" : "text-red-600"}`}>
                  {profit.toLocaleString()} so'm
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Filter</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
              <SelectValue placeholder="Turi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="income">Daromad</SelectItem>
              <SelectItem value="expense">Xarajat</SelectItem>
            </SelectContent>
          </Select>
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
        </div>
        <Badge variant="secondary" className="font-mono text-xs md:text-sm">
          {filteredTransactions.length} ta tranzaksiya
        </Badge>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 md:space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-3 md:mb-4">
              <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
            </div>
            <p className="font-medium text-base md:text-lg">Tranzaksiya yo'q</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Yangi tranzaksiya qo'shing
            </p>
          </Card>
        ) : (
          filteredTransactions.map((tx) => (
            <Card key={`${tx.deleteType}-${tx.id}`} className="p-4 md:p-5 hover:shadow-sm transition group relative">
              <div className="flex items-start gap-3 md:gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  tx.type === "income" ? "bg-green-100" : "bg-red-100"
                }`}>
                  {tx.type === "income" ? (
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-700" />
                  ) : (
                    <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0 relative">
                  <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                    <h3 className="font-semibold">{tx.title}</h3>
                    <Badge variant={tx.type === "income" ? "default" : "destructive"} className="text-xs">
                      {tx.type === "income" ? "Daromad" : "Xarajat"}
                    </Badge>
                    {tx.groupName && (
                      <Badge variant="secondary" className="text-xs"><Users className="w-3 h-3 mr-1" />{tx.groupName}</Badge>
                    )}
                    {tx.monthsPaid && (
                      <Badge variant="outline" className="text-xs">{tx.monthsPaid} oy</Badge>
                    )}
                  </div>
                  <p className={`font-medium text-sm md:text-base mt-1 ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "income" ? "+" : "-"} {tx.amount.toLocaleString()} so'm
                  </p>
                  {tx.paidMonths && tx.paidMonths.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tx.paidMonths.map((m, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-green-500/10 border-green-500/20 text-green-700">
                          {m.month_name} {m.year}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {tx.receivedBy && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Qabul qildi: <span className="font-medium text-foreground">{tx.receivedBy}</span>
                    </p>
                  )}
                  {tx.type === "expense" && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">{tx.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" />
                    {format(new Date(tx.created_at), "dd MMM • HH:mm")}
                  </div>
                  <button
                    onClick={() => setDeleteModal({ open: true, id: tx.id, type: tx.deleteType })}
                    className="absolute top-2 right-2 p-1.5 hover:bg-muted rounded-lg transition"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => !open && setDeleteModal({ open: false, id: null, type: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tranzaksiyani o'chirish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Bu amalni ortga qaytarib bo'lmaydi. Tranzaksiya butunlay o'chib ketadi.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: null, type: null })} className="flex-1">
                Bekor qilish
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                O'chirish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Drawer */}
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
                  <Plus className="w-5 h-5" /> Yangi tranzaksiya
                </h2>
                <button onClick={() => setShowAddDrawer(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {renderForm()}
              </div>
            </div>
          </div>
          {/* Desktop */}
          <div className="hidden md:block fixed right-0 top-0 h-full w-96 bg-card shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right">
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Yangi tranzaksiya
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
    const isIncome = transactionType === "income";

    return (
      <>
        <div>
          <Label className="text-sm">Turi</Label>
          <Select value={transactionType} onValueChange={(v: TransactionType) => {
            setTransactionType(v);
            setExpenseCategory("");
          }}>
            <SelectTrigger className="mt-1 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Daromad (O'quvchi to'lovi)</SelectItem>
              <SelectItem value="expense">Xarajat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isIncome ? (
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
                      {g.name} ({g.students_count} o'quvchi)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">O'quvchi</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedGroup}>
                <SelectTrigger className="mt-1 h-10">
                  <SelectValue placeholder="O'quvchini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {groupStudents.map((s) => (
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
          </>
        ) : (
          <>
            <div>
              <Label className="text-sm">Kategoriya</Label>
              <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                <SelectTrigger className="mt-1 h-10">
                  <SelectValue placeholder="Kategoriyani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recipient" className="text-sm">Qabul qiluvchi</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Ism yoki tashkilot"
                className="mt-1 h-10"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm">Izoh</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Xarajat haqida ma'lumot..."
                className="mt-1 min-h-20"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="amount" className="text-sm">Miqdor (so'm)</Label>
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

        <Button onClick={handleAdd} disabled={!amount} className="w-full h-10 text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Qo'shish
        </Button>
      </>
    );
  }
}

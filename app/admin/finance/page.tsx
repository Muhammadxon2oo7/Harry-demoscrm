"use client";

import { useState, useMemo } from "react";
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
  Coins,
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

interface Group {
  id: string;
  name: string;
  subject: string;
  studentsCount: number;
}

interface Student {
  id: string;
  fullName: string;
  groupId: string;
}

interface MonthOption {
  id: string;
  year: number;
  month: number;
  month_name: string;
}

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: string;
  description: string;
  created_at: string;
  created_by: string;
  // For student payments
  student?: {
    id: string;
    fullName: string;
  };
  group?: { id: string; name: string };
  months?: MonthOption[];
  months_paid?: number;
}

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

const incomeCategories = [
  { value: "student_payment", label: "O'quvchi to'lovi" },
  { value: "registration", label: "Ro'yxatdan o'tish to'lovi" },
  { value: "certificate", label: "Sertifikat to'lovi" },
  { value: "other_income", label: "Boshqa daromad" },
];

const expenseCategories = [
  { value: "salary", label: "Ish haqi" },
  { value: "rent", label: "Ijara to'lovi" },
  { value: "utilities", label: "Kommunal xizmatlar" },
  { value: "equipment", label: "Jihozlar" },
  { value: "marketing", label: "Marketing" },
  { value: "other_expense", label: "Boshqa xarajat" },
];

export default function AdminFinancePage() {
  // Mock data
  const [groups] = useState<Group[]>([
    { id: "1", name: "Beginner A1", subject: "Ingliz tili", studentsCount: 12 },
    { id: "2", name: "Advanced C1", subject: "Ingliz tili", studentsCount: 8 },
    { id: "3", name: "Boshlang'ich", subject: "Matematika", studentsCount: 15 },
  ]);

  const [allStudents] = useState<Student[]>([
    { id: "1", fullName: "Abdullayev Vali", groupId: "1" },
    { id: "2", fullName: "Karimova Malika", groupId: "1" },
    { id: "3", fullName: "Rahimov Jasur", groupId: "2" },
    { id: "4", fullName: "Azimova Dilnoza", groupId: "3" },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income",
      category: "student_payment",
      amount: "600000",
      description: "Fevral va Mart oylik to'lovi",
      created_at: new Date().toISOString(),
      created_by: "Admin",
      student: { id: "1", fullName: "Abdullayev Vali" },
      group: { id: "1", name: "Beginner A1" },
      months: [
        { id: "1", year: 2026, month: 2, month_name: "Fevral" },
        { id: "2", year: 2026, month: 3, month_name: "Mart" },
      ],
      months_paid: 2,
    },
    {
      id: "2",
      type: "expense",
      category: "rent",
      amount: "5000000",
      description: "Fevral oyi ijara to'lovi",
      created_at: new Date(2026, 1, 5).toISOString(),
      created_by: "Admin",
    },
    {
      id: "3",
      type: "income",
      category: "registration",
      amount: "150000",
      description: "Yangi o'quvchi ro'yxatdan o'tish",
      created_at: new Date(2026, 1, 7).toISOString(),
      created_by: "Admin",
    },
  ]);

  // Form states
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("income");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Student payment specific states
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  // Filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");

  // Delete modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    setSelectedStudent("");
    if (groupId) {
      const groupStudents = allStudents.filter((s) => s.groupId === groupId);
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

  const handleAdd = () => {
    setError("");

    // Validate common fields
    if (!selectedCategory || !amount) {
      setError("Kategoriya va miqdorni kiriting");
      return;
    }

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError("Miqdor ijobiy bo'lishi kerak");
      return;
    }

    // Special validation for student payment
    if (selectedCategory === "student_payment") {
      if (!selectedGroup || !selectedStudent || selectedMonths.length === 0) {
        setError("Guruh, o'quvchi va oylarni tanlang");
        return;
      }

      const student = allStudents.find((s) => s.id === selectedStudent);
      const group = groups.find((g) => g.id === selectedGroup);

      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: "income",
        category: selectedCategory,
        amount: num.toFixed(2),
        description: `${selectedMonths.length} oylik to'lov`,
        created_at: new Date().toISOString(),
        created_by: "Admin",
        student: { id: selectedStudent, fullName: student?.fullName || "" },
        group: { id: selectedGroup, name: group?.name || "" },
        months: selectedMonths.map((m) => ({
          id: `${Date.now()}-${m}`,
          year: parseInt(selectedYear),
          month: m,
          month_name: months.find((mo) => mo.month === m)?.month_name || "",
        })),
        months_paid: selectedMonths.length,
      };

      setTransactions([newTransaction, ...transactions]);
    } else {
      // Regular transaction
      if (!description.trim()) {
        setError("Izoh kiriting");
        return;
      }

      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: transactionType,
        category: selectedCategory,
        amount: num.toFixed(2),
        description: description.trim(),
        created_at: new Date().toISOString(),
        created_by: "Admin",
      };

      setTransactions([newTransaction, ...transactions]);
    }

    resetForm();
    setShowAddDrawer(false);
    showMessage("success", "Tranzaksiya qo'shildi");
  };

  const resetForm = () => {
    setTransactionType("income");
    setSelectedCategory("");
    setAmount("");
    setDescription("");
    setSelectedGroup("");
    setSelectedStudent("");
    setSelectedYear(currentYear.toString());
    setSelectedMonths([]);
    setStudents([]);
    setError("");
  };

  const openDeleteModal = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteModal = () => {
    setTransactionToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDelete = () => {
    if (!transactionToDelete) return;
    setTransactions(transactions.filter((t) => t.id !== transactionToDelete));
    closeDeleteModal();
    showMessage("success", "Tranzaksiya o'chirildi");
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.created_at);
      const month = date.getMonth() + 1;

      const typeMatch = filterType === "all" || transaction.type === filterType;
      const monthMatch = filterMonth === "all" || month === parseInt(filterMonth);

      return typeMatch && monthMatch;
    });
  }, [transactions, filterType, filterMonth]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }, [filteredTransactions]);

  const profit = totalIncome - totalExpense;

  const getCategoryLabel = (category: string) => {
    const allCategories = [...incomeCategories, ...expenseCategories];
    return allCategories.find((c) => c.value === category)?.label || category;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 md:p-5 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
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

        <Card className="p-4 md:p-5 bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
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

        <Card className="p-4 md:p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Foyda</p>
              <p
                className={`text-xl md:text-2xl font-bold ${
                  profit >= 0 ? "text-primary" : "text-red-600"
                }`}
              >
                {profit.toLocaleString()} so'm
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

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
          filteredTransactions.map((transaction) => (
            <Card
              key={transaction.id}
              className="p-4 md:p-5 hover:shadow-sm transition group relative"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    transaction.type === "income"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-700" />
                  ) : (
                    <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-700" />
                  )}
                </div>

                <div className="flex-1 min-w-0 relative">
                  <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                    <h3 className="font-semibold">
                      {transaction.student
                        ? transaction.student.fullName
                        : getCategoryLabel(transaction.category)}
                    </h3>
                    <Badge
                      variant={
                        transaction.type === "income" ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {transaction.type === "income" ? "Daromad" : "Xarajat"}
                    </Badge>
                    {transaction.group && (
                      <Badge variant="secondary" className="text-xs">
                        {transaction.group.name}
                      </Badge>
                    )}
                    {transaction.months_paid && (
                      <Badge variant="outline" className="text-xs">
                        {transaction.months_paid} oy
                      </Badge>
                    )}
                  </div>
                  <p
                    className={`font-medium text-sm md:text-base mt-1 ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}{" "}
                    {parseFloat(transaction.amount).toLocaleString()} so'm
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {transaction.description}
                  </p>
                  {transaction.months && transaction.months.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {transaction.months.map((m) => (
                        <Badge key={m.id} variant="outline" className="text-xs">
                          {m.month_name.slice(0, 3)} {m.year}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {transaction.created_by}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(transaction.created_at), "dd MMM • HH:mm")}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => openDeleteModal(transaction.id)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tranzaksiyani o'chirish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Bu amalni ortga qaytarib bo'lmaydi. Tranzaksiya butunlay o'chib ketadi.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
              >
                O'chirish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Drawer */}
      {showAddDrawer && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddDrawer(false)}
          />

          {/* Mobile */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 h-[85vh] overflow-hidden animate-in slide-in-from-bottom">
            <div className="flex flex-col h-full">
              <div className="flex justify-center pt-3">
                <div className="w-12 h-1 bg-muted rounded-full" />
              </div>
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Yangi tranzaksiya
                </h2>
                <button
                  onClick={() => setShowAddDrawer(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
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
                  <Plus className="w-5 h-5" />
                  Yangi tranzaksiya
                </h2>
                <button
                  onClick={() => setShowAddDrawer(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
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
    const isStudentPayment = selectedCategory === "student_payment";

    return (
      <>
        <div>
          <Label className="text-sm">Turi</Label>
          <Select value={transactionType} onValueChange={(v: "income" | "expense") => {
            setTransactionType(v);
            setSelectedCategory("");
          }}>
            <SelectTrigger className="mt-1 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Daromad</SelectItem>
              <SelectItem value="expense">Xarajat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm">Kategoriya</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="mt-1 h-10">
              <SelectValue placeholder="Kategoriyani tanlang" />
            </SelectTrigger>
            <SelectContent>
              {(transactionType === "income"
                ? incomeCategories
                : expenseCategories
              ).map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isStudentPayment ? (
          <>
            <div>
              <Label className="text-sm">Guruh</Label>
              <Select value={selectedGroup} onValueChange={handleGroupChange}>
                <SelectTrigger className="mt-1 h-10">
                  <SelectValue placeholder="Guruhni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} ({g.studentsCount} o'quvchi)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">O'quvchi</Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
                disabled={!selectedGroup}
              >
                <SelectTrigger className="mt-1 h-10">
                  <SelectValue placeholder="O'quvchini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName}
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
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Oylar</Label>
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-[200px] overflow-y-auto">
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
              <p className="text-xs text-muted-foreground mt-2">
                Tanlangan: {selectedMonths.length} oy
              </p>
            </div>
          </>
        ) : (
          <div>
            <Label htmlFor="description" className="text-sm">
              Izoh
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tranzaksiya haqida ma'lumot..."
              className="mt-1 min-h-20"
            />
          </div>
        )}

        <div>
          <Label htmlFor="amount" className="text-sm">
            Miqdor (so'm)
          </Label>
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
          disabled={!selectedCategory || !amount}
          className="w-full h-10 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Qo'shish
        </Button>
      </>
    );
  }
}

"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  dashboardApi,
  studentsApi,
  workersApi,
  groupsApi,
  type DashboardData,
} from "@/lib/api";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [counts, setCounts] = useState({ students: 0, workers: 0, groups: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, students, workers, groups] = await Promise.all([
          dashboardApi.get(),
          studentsApi.list(),
          workersApi.list(),
          groupsApi.list(),
        ]);
        setDashboard(dash);
        setCounts({
          students: students.length,
          workers: workers.length,
          groups: groups.length,
        });
      } catch {
        // errors handled by api.ts (401 redirects to login)
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(amount);

  const income = dashboard?.finance.income ?? 0;
  const expense = dashboard?.finance.expense ?? 0;
  const profit = dashboard?.finance.profit ?? 0;

  return (
    <div className="p-4 md:p-8 w-full space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
          <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          Admin Paneli
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Umumiy statistika va moliyaviy holat
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 md:p-5 animate-pulse h-24 bg-muted/30" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <MetricItem
              icon={<Users className="w-5 h-5 md:w-6 md:h-6" />}
              label="Jami o'quvchilar"
              value={counts.students}
              color="text-primary"
              bg="bg-primary/10"
              delay={0}
            />
            <MetricItem
              icon={<UserCheck className="w-5 h-5 md:w-6 md:h-6" />}
              label="Xodimlar"
              value={counts.workers}
              color="text-green-600"
              bg="bg-green-100"
              delay={100}
            />
            <MetricItem
              icon={<GraduationCap className="w-5 h-5 md:w-6 md:h-6" />}
              label="Guruhlar"
              value={counts.groups}
              color="text-blue-600"
              bg="bg-blue-100"
              delay={200}
            />
            <MetricItem
              icon={<DollarSign className="w-5 h-5 md:w-6 md:h-6" />}
              label="Umumiy daromad"
              value={formatCurrency(income)}
              subValue={
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3" />
                  Xodimlar bugun: {dashboard?.attendance.employees_present_today ?? 0} /{" "}
                  {dashboard?.attendance.total_employees ?? 0}
                </div>
              }
              color="text-yellow-600"
              bg="bg-yellow-100"
              delay={300}
            />
          </div>

          {/* Finance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <FinanceCard
              title="Umumiy kirim"
              amount={income}
              icon={<DollarSign className="w-5 h-5" />}
              color="text-green-700"
              bg="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm"
              border="border-green-200"
              delay={400}
              formatCurrency={formatCurrency}
            />
            <FinanceCard
              title="Umumiy chiqim"
              amount={expense}
              icon={<ArrowUpCircle className="w-5 h-5" />}
              color="text-red-700"
              bg="bg-gradient-to-br from-red-50/80 to-rose-50/80 backdrop-blur-sm"
              border="border-red-200"
              delay={500}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Net Profit */}
          <Card
            className="bg-linear-to-r from-blue-50/90 to-indigo-50/90 backdrop-blur-sm border-blue-200 animate-in fade-in slide-in-from-bottom duration-500"
            style={{ animationDelay: "600ms" }}
          >
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm md:text-base text-blue-700 font-medium">
                    Sof foyda
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-700 mt-1">
                    {formatCurrency(profit)}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Jami kirim - chiqim
                  </p>
                </div>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MetricItem({ icon, label, value, subValue, color, bg, delay }: any) {
  return (
    <Card
      className="animate-in fade-in slide-in-from-bottom duration-500 backdrop-blur-sm border bg-card/80"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
            <p className={`text-xl md:text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {subValue}
          </div>
          <div
            className={`w-10 h-10 md:w-12 md:h-12 ${bg} rounded-xl flex items-center justify-center`}
          >
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FinanceCard({ title, amount, icon, color, bg, border, delay, formatCurrency }: any) {
  return (
    <Card
      className={`animate-in fade-in slide-in-from-bottom duration-500 ${bg} ${border} border`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm md:text-base font-medium ${color}`}>{title}</p>
          <div className="w-9 h-9 bg-white/50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
        <p className={`text-xl md:text-2xl font-bold ${color}`}>
          {formatCurrency(amount)}
        </p>
      </div>
    </Card>
  );
}

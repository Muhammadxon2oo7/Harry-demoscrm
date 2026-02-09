"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  date: string;
  month: string;
  status: "paid" | "pending" | "overdue";
}

export default function StudentPaymentsPage() {
  const payments: Payment[] = [
    {
      id: "1",
      amount: 500000,
      date: "2026-02-05",
      month: "Fevral 2026",
      status: "paid",
    },
    {
      id: "2",
      amount: 500000,
      date: "2026-01-03",
      month: "Yanvar 2026",
      status: "paid",
    },
    {
      id: "3",
      amount: 500000,
      date: "2025-12-02",
      month: "Dekabr 2025",
      status: "paid",
    },
    {
      id: "4",
      amount: 500000,
      date: "—",
      month: "Mart 2026",
      status: "pending",
    },
  ];

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">To'langan</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Kutilmoqda</Badge>;
      case "overdue":
        return <Badge variant="destructive">Muddati o'tgan</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "overdue":
        return <Clock className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">To'lovlar tarixi</h1>
        <p className="text-muted-foreground mt-2">
          Qachon va qancha to'lov qilganingiz
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami to'langan</p>
              <h3 className="text-2xl font-bold mt-2">
                {totalPaid.toLocaleString()} so'm
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Oylik to'lov</p>
              <h3 className="text-2xl font-bold mt-2">500,000 so'm</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">To'lov muddati</p>
              <h3 className="text-2xl font-bold mt-2">Har oy 5-kun</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payments List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">To'lovlar ro'yxati</h2>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {getStatusIcon(payment.status)}
                </div>
                <div>
                  <h3 className="font-semibold">{payment.month}</h3>
                  <p className="text-sm text-muted-foreground">
                    {payment.date !== "—" ? `To'langan: ${payment.date}` : "Kutilmoqda"}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-lg font-bold">
                    {payment.amount.toLocaleString()} so'm
                  </p>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

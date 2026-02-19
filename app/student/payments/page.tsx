"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/utils";
import { Banknote, CalendarDays, CheckCircle2, CreditCard, User } from "lucide-react";
import { paymentsApi, type PaymentRecord } from "@/lib/api";

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsApi
      .myPayments()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setPayments(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount || "0"),
    0
  );
  const totalMonths = payments.reduce(
    (sum, p) => sum + (p.months_paid ?? p.months?.length ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">To&apos;lovlar tarixi</h1>
        <p className="text-muted-foreground mt-1">
          Qachon va qancha to&apos;lov qilganingiz
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-green-50 p-4 text-center">
          <p className="text-xl font-bold text-green-700">
            {totalPaid.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Jami so&apos;m</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xl font-bold">{payments.length}</p>
          <p className="text-xs text-muted-foreground mt-1">To&apos;lovlar</p>
        </div>
        <div className="rounded-xl border bg-blue-50 p-4 text-center">
          <p className="text-xl font-bold text-blue-700">{totalMonths}</p>
          <p className="text-xs text-muted-foreground mt-1">Oylar</p>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <p className="text-muted-foreground animate-pulse">Yuklanmoqda...</p>
      ) : payments.length === 0 ? (
        <div className="rounded-xl border p-12 text-center">
          <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Hozircha to&apos;lovlar yo&apos;q</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-0">
            {payments.map((payment) => {
              const amount = parseFloat(payment.amount || "0");
              const months = payment.months ?? [];
              const receivedBy = payment.received_by;

              return (
                <div
                  key={payment.id}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {/* Dot */}
                  <div className="relative z-10 shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-green-500 bg-green-50">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  </div>

                  {/* Receipt card */}
                  <div className="flex-1 rounded-xl border border-green-200 bg-green-50/30 overflow-hidden">
                    {/* Top: amount + date */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-green-100 bg-green-50/60">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-green-600 shrink-0" />
                        <span className="text-lg font-bold text-green-700">
                          {amount.toLocaleString()} so&apos;m
                        </span>
                      </div>
                      {/* <Badge className="bg-green-500 text-white">
                        To&apos;langan
                      </Badge> */}
                    </div>

                    {/* Month chips */}
                    {months.length > 0 && (
                      <div className="px-4 pt-3 pb-2">
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                          Qoplangan oylar
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {months
                            .slice()
                            .sort((a, b) =>
                              a.year !== b.year
                                ? a.year - b.year
                                : a.month - b.month
                            )
                            .map((m) => (
                              <span
                                key={m.id}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-green-200 text-green-800"
                              >
                                {m.month_name} {m.year}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Footer: date + receiver */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 border-t border-green-100 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {fmtDate(payment.created_at)}
                      </span>
                      {receivedBy &&
                        (receivedBy.first_name || receivedBy.last_name) && (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="w-3.5 h-3.5" />
                            {`${receivedBy.first_name} ${receivedBy.last_name}`.trim()}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

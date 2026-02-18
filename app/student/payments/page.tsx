"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Calendar } from "lucide-react";
import { paymentsApi, type PaymentRecord } from "@/lib/api";

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsApi
      .myPayments()
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">To&apos;lovlar tarixi</h1>
        <p className="text-muted-foreground mt-2">Qachon va qancha to&apos;lov qilganingiz</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami to&apos;langan</p>
              <h3 className="text-2xl font-bold mt-2">
                {totalPaid.toLocaleString()} so&apos;m
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
              <p className="text-sm text-muted-foreground">To&apos;lovlar soni</p>
              <h3 className="text-2xl font-bold mt-2">{payments.length} ta</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payments List */}
      {loading ? (
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      ) : payments.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Hozircha to&apos;lovlar yo&apos;q</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => {
            const monthNames = payment.months?.map((m) => m.month_name).join(", ") || "";
            return (
              <Card key={payment.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-base">
                          {parseFloat(payment.amount).toLocaleString()} so&apos;m
                        </p>
                        {monthNames && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Oylar: {monthNames}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(payment.created_at).toLocaleDateString("uz-UZ")}</span>
                        </div>
                      </div>
                      <Badge className="bg-green-500">To&apos;langan</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

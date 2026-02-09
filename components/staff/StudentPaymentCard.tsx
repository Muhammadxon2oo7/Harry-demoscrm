// components/staff/student-payment-card.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Users, Clock } from "lucide-react";
import { format } from "date-fns";

export function StudentPaymentCard({ payment }: { payment: any }) {
  return (
    <Card className="p-4 md:p-5 hover:shadow-sm transition">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Coins className="w-5 h-5 md:w-6 md:h-6 text-green-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
            <h3 className="font-semibold truncate ">
              {payment.student.first_name} {payment.student.last_name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {payment.group.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {payment.months_paid} oy
            </Badge>
          </div>
          <p className="text-green-600 font-medium text-sm md:text-base mt-1">
            + {parseFloat(payment.amount).toLocaleString()} so'm
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {payment.months.map((m: any) => (
              <Badge key={m.id} variant="outline" className="text-xs">
                {m.month_name.slice(0, 3)} {m.year}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
                @{payment.received_by && payment.received_by.username ? payment.received_by?.username : "xodim mavjud emas"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(payment.created_at), "dd MMM • HH:mm")}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
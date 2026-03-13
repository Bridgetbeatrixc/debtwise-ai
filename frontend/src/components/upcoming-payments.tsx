"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Debt } from "@/lib/types";
import { useCurrency } from "@/contexts/currency-context";

const TYPE_LABELS: Record<string, string> = {
  bnpl: "BNPL",
  credit_card: "Credit Card",
  loan: "Loan",
  digital_loan: "Digital Loan",
};

interface UpcomingPaymentsProps {
  debts: Debt[];
}

export function UpcomingPayments({ debts }: UpcomingPaymentsProps) {
  const { formatCurrency } = useCurrency();
  const upcoming = debts
    .filter((d) => d.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming payments</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((debt) => (
              <div
                key={debt.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{debt.provider}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {TYPE_LABELS[debt.debt_type] || debt.debt_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Due{" "}
                      {new Date(debt.due_date!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <span className="font-semibold">
                  {formatCurrency(debt.minimum_payment)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

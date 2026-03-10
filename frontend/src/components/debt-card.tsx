"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Debt } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  bnpl: "BNPL",
  credit_card: "Credit Card",
  loan: "Personal Loan",
  digital_loan: "Digital Loan",
};

const TYPE_COLORS: Record<string, string> = {
  bnpl: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  credit_card: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  loan: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  digital_loan: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
}

export function DebtCard({ debt, onEdit, onDelete }: DebtCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">{debt.provider}</h3>
            <Badge className={TYPE_COLORS[debt.debt_type] || ""} variant="secondary">
              {TYPE_LABELS[debt.debt_type] || debt.debt_type}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(debt)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(debt.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-lg font-bold">
              ${debt.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">APR</p>
            <p className="text-lg font-bold">{debt.interest_rate}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Min Payment</p>
            <p className="font-medium">
              ${debt.minimum_payment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className="font-medium">
              {debt.due_date
                ? new Date(debt.due_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Not set"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

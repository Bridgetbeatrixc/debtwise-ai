"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Debt } from "@/lib/types";

interface DebtProgressProps {
  debts: Debt[];
}

export function DebtProgress({ debts }: DebtProgressProps) {
  if (debts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Debt Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Add debts to track your progress</p>
        </CardContent>
      </Card>
    );
  }

  const maxBalance = Math.max(...debts.map((d) => d.balance));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Debt Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {debts.slice(0, 5).map((debt) => {
          const pct = maxBalance > 0 ? (debt.balance / maxBalance) * 100 : 0;
          return (
            <div key={debt.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{debt.provider}</span>
                <span className="text-muted-foreground">
                  ${debt.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

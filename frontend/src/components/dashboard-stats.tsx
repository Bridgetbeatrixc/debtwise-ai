"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Calendar, TrendingDown } from "lucide-react";
import { Debt } from "@/lib/types";

interface DashboardStatsProps {
  debts: Debt[];
}

export function DashboardStats({ debts }: DashboardStatsProps) {
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimum_payment, 0);
  const upcomingDebts = debts
    .filter((d) => d.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
  const nextDue = upcomingDebts[0];

  const stats = [
    {
      title: "Total Debt",
      value: `$${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: `${debts.length} active debts`,
    },
    {
      title: "Monthly Minimum",
      value: `$${totalMinPayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      description: "Minimum payments due",
    },
    {
      title: "Active Debts",
      value: debts.length.toString(),
      icon: CreditCard,
      description: `${debts.filter((d) => d.debt_type === "bnpl").length} BNPL`,
    },
    {
      title: "Next Payment",
      value: nextDue
        ? new Date(nextDue.due_date!).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "N/A",
      icon: Calendar,
      description: nextDue ? nextDue.provider : "No upcoming payments",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

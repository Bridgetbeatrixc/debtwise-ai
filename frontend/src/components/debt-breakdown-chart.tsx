"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Debt } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  bnpl: "BNPL",
  credit_card: "Credit Card",
  loan: "Personal Loan",
  digital_loan: "Digital Loan",
};

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(338, 72%, 51%)",
  "hsl(25, 95%, 53%)",
];

interface DebtBreakdownChartProps {
  debts: Debt[];
}

export function DebtBreakdownChart({ debts }: DebtBreakdownChartProps) {
  const grouped = debts.reduce<Record<string, number>>((acc, d) => {
    const key = d.debt_type;
    acc[key] = (acc[key] || 0) + d.balance;
    return acc;
  }, {});

  const data = Object.entries(grouped).map(([type, value]) => ({
    name: TYPE_LABELS[type] || type,
    value: Math.round(value * 100) / 100,
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Debt Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
          No debts to display
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Debt Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

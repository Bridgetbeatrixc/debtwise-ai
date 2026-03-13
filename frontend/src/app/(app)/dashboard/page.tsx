"use client";

import { useEffect, useState } from "react";
import { getDebts } from "@/lib/api";
import { Debt } from "@/lib/types";
import { DashboardStats } from "@/components/dashboard-stats";
import { DebtBreakdownChart } from "@/components/debt-breakdown-chart";
import { UpcomingPayments } from "@/components/upcoming-payments";
import { DebtProgress } from "@/components/debt-progress";
import { GuidanceOverlay, useGuidanceOverlay } from "@/components/guidance-overlay";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function DashboardPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const { show: showGuidance, dismiss, setShow } = useGuidanceOverlay();

  useEffect(() => {
    getDebts()
      .then(setDebts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GuidanceOverlay open={showGuidance} onClose={dismiss} />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your debt situation</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShow(true)} className="gap-2 text-muted-foreground">
          <Compass className="h-4 w-4" />
          Take a tour
        </Button>
      </div>

      <DashboardStats debts={debts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DebtBreakdownChart debts={debts} />
        <UpcomingPayments debts={debts} />
      </div>

      <DebtProgress debts={debts} />
    </div>
  );
}

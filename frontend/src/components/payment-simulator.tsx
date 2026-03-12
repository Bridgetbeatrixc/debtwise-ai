"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { simulatePayment, getRepaymentPlan } from "@/lib/api";
import { SimulationResult, RepaymentPlan } from "@/lib/types";
import {
  ArrowDown,
  CalendarCheck,
  DollarSign,
  TrendingDown,
  Info,
  Loader2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PurchaseSimulator } from "@/components/purchase-simulator";

export function PaymentSimulator() {
  const [extraPayment, setExtraPayment] = useState(100);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [planResult, setPlanResult] = useState<RepaymentPlan | null>(null);
  const [strategy, setStrategy] = useState("avalanche");
  const [simulating, setSimulating] = useState(false);
  const [planning, setPlanning] = useState(false);

  async function handleSimulate() {
    if (extraPayment < 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setSimulating(true);
    try {
      const result = await simulatePayment(extraPayment);
      setSimResult(result);
    } catch {
      toast.error("Failed to run simulation. Make sure you have debts added.");
    } finally {
      setSimulating(false);
    }
  }

  async function handlePlan() {
    setPlanning(true);
    try {
      const result = await getRepaymentPlan(strategy);
      setPlanResult(result);
    } catch {
      toast.error("Failed to generate plan. Make sure you have debts added.");
    } finally {
      setPlanning(false);
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Repayment Strategy</h1>
        <p className="text-muted-foreground">
          Optimize your cash flow and simulate your journey to financial freedom.
        </p>
      </div>

      <Tabs defaultValue="simulate">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simulate">Monthly Simulator</TabsTrigger>
          <TabsTrigger value="purchase">New Purchase</TabsTrigger>
          <TabsTrigger value="plan">Repayment Plan</TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* TAB 1: MONTHLY SIMULATOR                                     */}
        {/* ============================================================ */}
        <TabsContent value="simulate" className="space-y-4 mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Slider + Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                      Monthly Simulator
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      +${extraPayment}/mo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Extra Monthly Payment</Label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">$0</span>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="25"
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(Number(e.target.value))}
                        className="flex-1 accent-blue-600"
                      />
                      <span className="text-sm text-muted-foreground">$5,000</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="25"
                      value={extraPayment}
                      onChange={(e) => setExtraPayment(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <Button onClick={handleSimulate} disabled={simulating} className="w-full">
                    {simulating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running...</>
                    ) : (
                      "Simulate"
                    )}
                  </Button>

                  {simResult && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-start gap-2.5">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-blue-800">
                        Adding <strong>${extraPayment}</strong> to your minimum payments will
                        pay off your debt{" "}
                        <strong>{simResult.months_saved} month(s) faster</strong> and save{" "}
                        <strong>{fmt(simResult.interest_saved)}</strong> in interest.
                      </p>
                    </div>
                  )}

                  {simResult && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white p-4">
                        <Wallet className="h-5 w-5 mb-2 opacity-80" />
                        <p className="text-xs opacity-80 uppercase tracking-wider">Interest Saved</p>
                        <p className="text-2xl font-bold">{fmt(simResult.interest_saved)}</p>
                        <p className="text-xs opacity-70 mt-1">Over the life of your plan</p>
                      </div>
                      <div className="rounded-xl border p-4">
                        <CalendarCheck className="h-5 w-5 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Debt-Free Date</p>
                        <p className="text-lg font-bold">
                          {new Date(simResult.accelerated.debt_free_date).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {simResult.months_saved > 0 && `${simResult.months_saved} months earlier`}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Schedule Table */}
            <div>
              {simResult && simResult.schedule.length > 0 ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">First 12-Month Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50 text-muted-foreground">
                            <th className="px-4 py-2.5 text-left font-medium">Month</th>
                            <th className="px-4 py-2.5 text-right font-medium">Payment</th>
                            <th className="px-4 py-2.5 text-right font-medium">Interest</th>
                            <th className="px-4 py-2.5 text-right font-medium">Remaining</th>
                          </tr>
                        </thead>
                        <tbody>
                          {simResult.schedule.slice(0, 12).map((m) => {
                            const totalPayment = m.debts.reduce((s, d) => s + d.payment, 0);
                            const totalInterest = m.debts.reduce((s, d) => s + d.interest, 0);
                            const totalRemaining = m.debts.reduce((s, d) => s + d.remaining, 0);
                            return (
                              <tr key={m.month} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="px-4 py-2.5 font-medium">Month {m.month}</td>
                                <td className="px-4 py-2.5 text-right text-green-700 font-medium">
                                  {fmt(totalPayment)}
                                </td>
                                <td className="px-4 py-2.5 text-right text-red-600">
                                  {fmt(totalInterest)}
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold">
                                  {fmt(totalRemaining)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center py-12">
                    <TrendingDown className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      Move the slider and hit Simulate
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      See a month-by-month repayment schedule
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 2: SIMULATE NEW PURCHASE                                 */}
        {/* ============================================================ */}
        <TabsContent value="purchase" className="mt-4">
          <PurchaseSimulator />
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 3: REPAYMENT PLAN                                        */}
        {/* ============================================================ */}
        <TabsContent value="plan" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Select Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    value: "snowball",
                    label: "Debt Snowball",
                    desc: "Target smallest balances first for quick psychological wins.",
                  },
                  {
                    value: "avalanche",
                    label: "Debt Avalanche",
                    desc: "Target highest interest rates first to save the most money.",
                  },
                  {
                    value: "cashflow",
                    label: "Cashflow Optimizer",
                    desc: "Free up monthly cashflow as quickly as possible.",
                  },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStrategy(s.value)}
                    className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      strategy === s.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    {strategy === s.value && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}

                <Button onClick={handlePlan} disabled={planning} className="w-full mt-2">
                  {planning ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                  ) : (
                    "Generate Plan"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {planResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">
                    {planResult.strategy} Plan
                  </CardTitle>
                  <Badge variant="secondary">
                    ${planResult.interest_saved.toLocaleString()} saved
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{planResult.months_to_payoff}</p>
                    <p className="text-xs text-muted-foreground">Months</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${planResult.monthly_payment.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {new Date(planResult.debt_free_date).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">Debt Free</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="mb-2 text-sm font-medium">Repayment Order</p>
                  <div className="flex flex-wrap gap-2">
                    {planResult.repayment_order.map((provider, i) => (
                      <Badge key={provider} variant="outline">
                        {i + 1}. {provider}
                      </Badge>
                    ))}
                  </div>
                </div>

                {planResult.explanation && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-sm font-medium">AI Explanation</p>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {planResult.explanation}
                      </p>
                    </div>
                  </>
                )}

                {planResult.schedule.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-3 text-sm font-medium">First 12-Month Schedule</p>
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50 text-muted-foreground">
                              <th className="px-4 py-2 text-left font-medium">Month</th>
                              <th className="px-4 py-2 text-right font-medium">Payment</th>
                              <th className="px-4 py-2 text-right font-medium">Interest</th>
                              <th className="px-4 py-2 text-right font-medium">Remaining</th>
                            </tr>
                          </thead>
                          <tbody>
                            {planResult.schedule.slice(0, 12).map((m) => {
                              const totalPayment = m.debts.reduce((s, d) => s + d.payment, 0);
                              const totalInterest = m.debts.reduce((s, d) => s + d.interest, 0);
                              const totalRemaining = m.debts.reduce((s, d) => s + d.remaining, 0);
                              return (
                                <tr key={m.month} className="border-b last:border-0 hover:bg-muted/30">
                                  <td className="px-4 py-2 font-medium">Month {m.month}</td>
                                  <td className="px-4 py-2 text-right text-green-700 font-medium">
                                    {fmt(totalPayment)}
                                  </td>
                                  <td className="px-4 py-2 text-right text-red-600">
                                    {fmt(totalInterest)}
                                  </td>
                                  <td className="px-4 py-2 text-right font-semibold">
                                    {fmt(totalRemaining)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

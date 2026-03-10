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
import { ArrowDown, CalendarCheck, DollarSign, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PaymentSimulator() {
  const [extraPayment, setExtraPayment] = useState("100");
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [planResult, setPlanResult] = useState<RepaymentPlan | null>(null);
  const [strategy, setStrategy] = useState("avalanche");
  const [simulating, setSimulating] = useState(false);
  const [planning, setPlanning] = useState(false);

  async function handleSimulate() {
    const amount = parseFloat(extraPayment);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setSimulating(true);
    try {
      const result = await simulatePayment(amount);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Simulator</h1>
        <p className="text-muted-foreground">
          Simulate repayment scenarios and find the best strategy
        </p>
      </div>

      <Tabs defaultValue="simulate">
        <TabsList>
          <TabsTrigger value="simulate">Simulation</TabsTrigger>
          <TabsTrigger value="plan">Repayment Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="simulate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Extra Monthly Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="extra">Additional amount per month ($)</Label>
                  <Input
                    id="extra"
                    type="number"
                    min="0"
                    step="25"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSimulate} disabled={simulating}>
                    {simulating ? "Running..." : "Simulate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {simResult && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Current Path
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Debt free by{" "}
                      <strong>
                        {new Date(simResult.current.debt_free_date).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Total interest: <strong>${simResult.current.total_interest.toLocaleString()}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{simResult.current.months_to_payoff}</strong> months
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">
                      With Extra ${extraPayment}/mo
                    </CardTitle>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Debt free by{" "}
                      <strong>
                        {new Date(
                          simResult.accelerated.debt_free_date
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Total interest: <strong>${simResult.accelerated.total_interest.toLocaleString()}</strong>
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2 text-primary">
                    <ArrowDown className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      Save ${simResult.interest_saved.toLocaleString()} &middot;{" "}
                      {simResult.months_saved} months earlier
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Repayment Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Strategy</Label>
                  <Select value={strategy} onValueChange={(v) => v && setStrategy(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avalanche">
                        Avalanche (highest interest first)
                      </SelectItem>
                      <SelectItem value="snowball">
                        Snowball (smallest balance first)
                      </SelectItem>
                      <SelectItem value="cashflow">
                        Cashflow (minimize monthly burden)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handlePlan} disabled={planning}>
                    {planning ? "Generating..." : "Generate Plan"}
                  </Button>
                </div>
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
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {planResult.explanation}
                      </p>
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

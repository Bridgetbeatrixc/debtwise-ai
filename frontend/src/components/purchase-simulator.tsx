"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPurchaseInfo, simulatePurchaseImpact } from "@/lib/api";
import { PurchaseImpactResult } from "@/lib/types";
import {
  Link2,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const PROVIDER_PRESETS: Record<string, { rate: number; label: string }> = {
  "Shopee PayLater": { rate: 2.95, label: "Shopee PayLater (up to 2.95%/mo)" },
  "Akulaku": { rate: 3.5, label: "Akulaku (up to 3.5%/mo)" },
  "Kredivo": { rate: 2.6, label: "Kredivo (up to 2.6%/mo)" },
  "Home Credit": { rate: 3.0, label: "Home Credit (up to 3.0%/mo)" },
  "GoPayLater": { rate: 2.5, label: "GoPayLater (up to 2.5%/mo)" },
  "Other": { rate: 0, label: "Other (enter rate manually)" },
};

const INSTALLMENT_OPTIONS = [1, 3, 6, 9, 12, 18, 24];

export function PurchaseSimulator() {
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [provider, setProvider] = useState("Shopee PayLater");
  const [months, setMonths] = useState("6");
  const [rate, setRate] = useState("2.95");
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<PurchaseImpactResult | null>(null);

  async function handleFetchLink() {
    if (!url.trim()) {
      toast.error("Paste a product link first");
      return;
    }
    setFetching(true);
    try {
      const info = await fetchPurchaseInfo(url);
      if (info.product_name) setProductName(info.product_name);
      if (info.price) setPrice(String(info.price));
      if (info.error) toast.info(info.error);
      else toast.success("Product info loaded!");
    } catch {
      toast.error("Failed to fetch link. Enter details manually.");
    } finally {
      setFetching(false);
    }
  }

  function handleProviderChange(v: string) {
    setProvider(v);
    const preset = PROVIDER_PRESETS[v];
    if (preset && preset.rate > 0) {
      setRate(String(preset.rate));
    }
  }

  async function handleSimulate() {
    const p = parseFloat(price);
    if (!p || p <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    setSimulating(true);
    try {
      const res = await simulatePurchaseImpact({
        product_name: productName || "New purchase",
        price: p,
        provider,
        installment_months: parseInt(months),
        interest_rate: parseFloat(rate) || 0,
      });
      setResult(res);
    } catch {
      toast.error("Failed to simulate. Make sure you have debts added.");
    } finally {
      setSimulating(false);
    }
  }

  function getVerdictStyle(verdict: string) {
    const lower = verdict.toLowerCase();
    if (lower.includes("not recommended"))
      return { color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle };
    if (lower.includes("caution"))
      return { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle };
    return { color: "text-green-600", bg: "bg-green-50 border-green-200", icon: CheckCircle2 };
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Input Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-4 w-4 text-blue-600" />
              Paste Product Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://shopee.co.id/product/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleFetchLink}
                disabled={fetching}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supports Shopee, Tokopedia, and other e-commerce links. Or fill in manually below.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              Purchase Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                placeholder="e.g. iPhone 16 Case"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Price (Rp)</Label>
              <Input
                type="number"
                placeholder="500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>BNPL Provider</Label>
              <Select value={provider} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDER_PRESETS).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Installment Months</Label>
                <Select value={months} onValueChange={setMonths}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTALLMENT_OPTIONS.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m} month{m > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Interest Rate (%/mo)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full"
              size="lg"
            >
              {simulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Simulate Impact
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right: Results Panel */}
      <div className="space-y-4">
        {!result ? (
          <Card className="flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                Enter a product and click &quot;Simulate Impact&quot;
              </p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                See the real cost and how it affects your debt
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Real Cost Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Real Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Item Price</span>
                  <span className="font-semibold">Rp {result.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Installment</span>
                  <span className="font-semibold">
                    Rp {result.monthly_installment.toLocaleString()}/mo x {months}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total You Pay</span>
                  <span className="text-lg font-bold">
                    Rp {result.total_cost.toLocaleString()}
                  </span>
                </div>
                {result.interest_markup > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                    <span className="text-sm text-red-700 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      Interest Markup
                    </span>
                    <span className="font-bold text-red-700">
                      +Rp {result.interest_markup.toLocaleString()} ({result.interest_markup_pct}%)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debt-Free Date Impact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Impact on Your Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Current Debt-Free</p>
                    <p className="font-bold text-sm">
                      {result.current_debt_free_date === "N/A"
                        ? "No debt"
                        : new Date(result.current_debt_free_date).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-center">
                    <p className="text-xs text-orange-700 mb-1">With This Purchase</p>
                    <p className="font-bold text-sm text-orange-800">
                      {new Date(result.new_debt_free_date).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {result.extra_months > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600" />
                    <span>
                      Pushes debt-free date back by{" "}
                      <strong className="text-orange-700">{result.extra_months} month(s)</strong>
                    </span>
                  </div>
                )}
                {result.extra_interest > 0 && (
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-red-600" />
                    <span>
                      Additional interest:{" "}
                      <strong className="text-red-700">
                        Rp {result.extra_interest.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Verdict */}
            {result.ai_verdict && (
              <Card
                className={`border ${getVerdictStyle(result.ai_verdict).bg}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {(() => {
                      const style = getVerdictStyle(result.ai_verdict);
                      const Icon = style.icon;
                      return <Icon className={`h-5 w-5 ${style.color}`} />;
                    })()}
                    Do You Really Need This?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {result.ai_verdict}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

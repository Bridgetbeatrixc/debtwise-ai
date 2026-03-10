"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { getInsights, generateInsight } from "@/lib/api";
import { Insight } from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { toast } from "sonner";

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function loadInsights() {
    try {
      const data = await getInsights();
      setInsights(data);
    } catch {
      toast.error("Failed to load insights");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInsights();
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateInsight();
      toast.success("Insight generated");
      await loadInsights();
    } catch {
      toast.error("Failed to generate insight");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monthly Insights</h1>
          <p className="text-muted-foreground">
            AI-generated reports on your debt progress
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="gap-2">
          <Sparkles className="h-4 w-4" />
          {generating ? "Generating..." : "Generate Insight"}
        </Button>
      </div>

      {insights.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Sparkles className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium">No insights yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Generate your first monthly insight to see AI-powered analysis of your debt
          </p>
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate First Insight
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}

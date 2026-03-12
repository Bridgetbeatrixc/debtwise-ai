"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileDown } from "lucide-react";
import { Insight } from "@/lib/types";
import { exportInsightPdf } from "@/lib/pdf-utils";
import { toast } from "sonner";

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const [exporting, setExporting] = useState(false);
  const createdDate = insight.created_at
    ? new Date(insight.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recent";

  async function handleExportPdf() {
    setExporting(true);
    try {
      await exportInsightPdf("Monthly Report", createdDate, insight.summary);
      toast.success("PDF exported");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Monthly Report</CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {createdDate}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={exporting}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {insight.summary}
        </div>
      </CardContent>
    </Card>
  );
}

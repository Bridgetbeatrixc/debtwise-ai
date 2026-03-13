"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LayoutDashboard, CreditCard, Bot, Calculator, X } from "lucide-react";

const GUIDANCE_KEY = "debtwise_guidance_done";

export function useGuidanceOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(GUIDANCE_KEY)) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") localStorage.setItem(GUIDANCE_KEY, "true");
    setShow(false);
  };

  return { show, dismiss, setShow };
}

const steps = [
  {
    title: "Dashboard",
    description: "Your command center. See total debt, upcoming payments, and progress at a glance.",
    icon: LayoutDashboard,
    tip: "Check here regularly to stay on top of your finances.",
  },
  {
    title: "Debts",
    description: "Add and manage all your debts — BNPL, credit cards, loans. The more accurate your data, the better our AI advice.",
    icon: CreditCard,
    tip: "Keep balances updated for accurate simulations.",
  },
  {
    title: "AI Advisor",
    description: "Ask questions about your debt. Get personalized repayment strategies and answers 24/7.",
    icon: Bot,
    tip: "Try asking: 'What should I pay first?'",
  },
  {
    title: "Simulator",
    description: "See how extra payments affect your timeline. Simulate new purchases before you buy.",
    icon: Calculator,
    tip: "Use the New Purchase tab to check real cost impact.",
  },
];

interface GuidanceOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function GuidanceOverlay({ open, onClose }: GuidanceOverlayProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);
  const isLast = step === steps.length - 1;

  function handleNext() {
    if (isLast) {
      if (typeof window !== "undefined") localStorage.setItem(GUIDANCE_KEY, "true");
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleSkip() {
    if (typeof window !== "undefined") localStorage.setItem(GUIDANCE_KEY, "true");
    onClose();
  }

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleSkip()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <div className="absolute right-4 top-4">
          <Button variant="ghost" size="icon" onClick={handleSkip} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <DialogHeader className="pr-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <current.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">{current.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription className="space-y-2 pt-2">
          <p>{current.description}</p>
          <p className="text-xs text-muted-foreground italic">💡 {current.tip}</p>
        </DialogDescription>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            Skip tour
          </Button>
          <Button onClick={handleNext}>
            {isLast ? "Get started" : "Next"}
          </Button>
        </DialogFooter>

        <div className="flex justify-center gap-1.5 pt-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? "w-4 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

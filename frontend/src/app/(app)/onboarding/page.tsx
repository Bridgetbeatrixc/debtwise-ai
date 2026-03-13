"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CreditCard, BarChart3, Bot, Calculator, ArrowRight } from "lucide-react";
import Link from "next/link";

const ONBOARDING_KEY = "debtwise_onboarding_complete";

const steps = [
  {
    title: "Welcome to DebtWise AI",
    description: "Your AI-powered debt management assistant. We'll help you understand, track, and pay off your debts smarter.",
    icon: CheckCircle2,
  },
  {
    title: "Add Your Debts",
    description: "Start by adding your BNPL, credit cards, and loans. The more accurate your data, the better our AI can help.",
    icon: CreditCard,
  },
  {
    title: "Track & Analyze",
    description: "View your dashboard for a clear overview. Get AI-generated insights and personalized repayment strategies.",
    icon: BarChart3,
  },
  {
    title: "Chat with AI Advisor",
    description: "Ask questions about your debt anytime. Get recommendations on what to pay first and how to save on interest.",
    icon: Bot,
  },
  {
    title: "Simulate & Plan",
    description: "Use the simulator to see how extra payments affect your timeline. Export plans to share with creditors.",
    icon: Calculator,
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  function handleComplete() {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true");
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Image src="/logo-debtwise-transparent.png" alt="DebtWise AI" width={56} height={56} className="mx-auto mb-3 rounded-lg" />
          <div className="flex justify-center gap-1 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i <= step ? "w-6 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
          <CardTitle className="font-display text-2xl">{currentStep.title}</CardTitle>
          <CardDescription className="text-base mt-2">{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-center py-4">
            <div className="rounded-full bg-primary/10 p-6">
              <currentStep.icon className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="flex gap-3">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleComplete} className="flex-1 text-muted-foreground">
                Skip
              </Button>
            )}
            {isLastStep ? (
              <Button onClick={handleComplete} className="flex-1 gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} className="flex-1 gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex justify-center gap-2">
            {step === 0 && (
              <Button variant="ghost" size="sm" onClick={handleComplete} className="text-muted-foreground">
                Skip setup
              </Button>
            )}
            <p className="text-center text-xs text-muted-foreground">
              {step + 1} of {steps.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

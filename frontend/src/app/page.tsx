"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, CreditCard, TrendingDown, BarChart3 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              DW
            </div>
            <span className="text-xl font-bold">DebtWise AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Take Control of Your
            <span className="block text-primary">Debt with AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            DebtWise AI helps you manage BNPL, credit cards, and personal loans.
            Get AI-powered repayment plans, payment simulations, and monthly insights
            to become debt-free faster.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start for Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Debt Aggregation"
              description="Track all your debts in one place — BNPL, credit cards, loans, and more."
            />
            <FeatureCard
              icon={<Bot className="h-6 w-6" />}
              title="AI Financial Advisor"
              description="Chat with an AI advisor that understands your unique debt situation."
            />
            <FeatureCard
              icon={<TrendingDown className="h-6 w-6" />}
              title="Smart Repayment Plans"
              description="Get snowball, avalanche, and cashflow-optimized strategies."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Monthly Insights"
              description="Receive AI-generated reports on your debt progress and spending patterns."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

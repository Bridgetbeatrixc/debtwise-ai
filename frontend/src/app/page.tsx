"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bot,
  CreditCard,
  TrendingDown,
  BarChart3,
  Check,
  X,
  MessageSquare,
  Calculator,
  Sparkles,
  Shield,
  Zap,
  ChevronRight,
  Star,
  Wallet,
  PieChart,
  Target,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const providerLogos = [
    { name: "BCA", src: "/providers/bca.png", width: 168, height: 50 },
    { name: "SPayLater", src: "/providers/spaylater.png", width: 220, height: 90 },
    { name: "CIMB Bank", src: "/providers/cimb-bank.png", width: 220, height: 78 },
    { name: "EasyCash", src: "/providers/easycash.png", width: 220, height: 100 },
    { name: "Kredivo", src: "/providers/kredivo.png", width: 220, height: 68 },
  ];

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-4 py-2.5 text-center text-sm text-white">
        <span className="font-medium">New:</span> AI-powered debt insights now available —{" "}
        <Link href="#features" className="underline underline-offset-2 hover:no-underline font-medium">
          See what&apos;s new
        </Link>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-lg">
        <div className="container mx-auto flex h-[72px] items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-debtwise-transparent.png" alt="DebtWise AI" width={36} height={36} className="rounded-md" />
            <span className="font-display text-xl font-bold tracking-tight">
              <span className="text-blue-700">Debt</span>
              <span className="text-blue-500">Wise</span>
              <span className="text-blue-400 text-xs align-super ml-0.5 font-semibold">AI</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Calculator", "Reviews"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all rounded-full px-6 h-10 text-sm font-semibold">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute top-20 left-1/4 h-72 w-72 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-96 w-96 bg-blue-600/8 rounded-full blur-3xl" />
          <div className="container relative mx-auto px-4 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left animate-slide-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white px-4 py-2 text-sm font-medium text-blue-700 mb-8 shadow-sm">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  AI-Powered Debt Management
                </div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  Take Control of{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Your Debt
                  </span>
                  {" "}with AI
                </h1>
                <p className="mt-6 text-lg text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Manage BNPL, credit cards, and loans with intelligent repayment plans,
                  AI-powered advice, and monthly insights — become debt-free faster.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all h-13 px-8 text-base font-semibold rounded-full">
                      Start for Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#calculator">
                    <Button size="lg" variant="outline" className="h-13 px-8 text-base border-slate-200 hover:bg-slate-50 rounded-full font-medium">
                      <Calculator className="mr-2 h-5 w-5 text-slate-400" />
                      Try Calculator
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Free forever</span>
                  </div>
                </div>
              </div>

              {/* Hero Card */}
              <div className="relative animate-slide-up" style={{ animationDelay: "0.15s" }}>
                <div className="relative z-10 animate-float">
                  <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/8 border border-slate-100 p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Debt</p>
                        <p className="font-display text-4xl font-bold text-slate-900 mt-1">$12,450</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                        <TrendingDown className="h-7 w-7" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { icon: CreditCard, color: "pink", label: "Credit Card", sub: "Chase • 19.99% APR", amount: "$4,200" },
                        { icon: Wallet, color: "purple", label: "Afterpay", sub: "BNPL • 0% APR", amount: "$850" },
                        { icon: Target, color: "blue", label: "Personal Loan", sub: "Marcus • 8.99% APR", amount: "$7,400" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl bg-${item.color}-100 flex items-center justify-center`}>
                              <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                              <p className="text-xs text-slate-400">{item.sub}</p>
                            </div>
                          </div>
                          <p className="font-bold text-slate-900">{item.amount}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 z-20 animate-float-delayed hidden lg:block">
                  <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/8 border border-slate-100 p-4 w-72">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">AI Advisor</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          &quot;Add $150/month to Chase and you&apos;ll save $890 in interest — debt-free 8 months sooner!&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 h-28 w-28 bg-blue-400/15 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 right-8 h-36 w-36 bg-cyan-500/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Provider Logos */}
        <section className="border-y border-slate-100 bg-slate-50/50 py-10">
          <div className="container mx-auto px-4 lg:px-8">
            <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
              Built for people managing debt from
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {providerLogos.map((provider) => (
                <div
                  key={provider.name}
                  className="flex h-24 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  title={provider.name}
                >
                  <Image
                    src={provider.src}
                    alt={provider.name}
                    width={provider.width}
                    height={provider.height}
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Why DebtWise AI</p>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 leading-tight mb-6">
                  Everything You Need to{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Crush Your Debt
                  </span>
                </h2>
                <p className="text-lg text-slate-500 mb-12 leading-relaxed">
                  Purpose-built for debt management with AI-powered insights and
                  proven repayment strategies that actually work.
                </p>
                <div className="grid sm:grid-cols-2 gap-8">
                  <FeaturePoint
                    icon={<Bot className="h-5 w-5" />}
                    title="AI Financial Advisor"
                    description="Personalized advice from Gemini AI that understands your debt situation."
                  />
                  <FeaturePoint
                    icon={<Calculator className="h-5 w-5" />}
                    title="Payment Simulator"
                    description="See how extra payments impact your debt-free date and interest saved."
                  />
                  <FeaturePoint
                    icon={<Target className="h-5 w-5" />}
                    title="3 Smart Strategies"
                    description="Snowball, Avalanche, or Cashflow — pick the method that fits your goals."
                  />
                  <FeaturePoint
                    icon={<BarChart3 className="h-5 w-5" />}
                    title="Monthly Insights"
                    description="AI reports analyzing your debt trends and spending patterns."
                  />
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-3 gap-4 text-sm font-semibold">
                    <div className="text-slate-500">Features</div>
                    <div className="text-center text-slate-400">Others</div>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-bold">
                        <Image src="/logo-debtwise-transparent.png" alt="" width={14} height={14} className="rounded-sm" />
                        DebtWise
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-1">
                  <ComparisonRow feature="AI-powered chat advisor" others={false} debtwise={true} />
                  <ComparisonRow feature="Debt payment simulator" others={false} debtwise={true} />
                  <ComparisonRow feature="Multiple strategies" others={true} debtwise={true} />
                  <ComparisonRow feature="BNPL-specific tracking" others={false} debtwise={true} />
                  <ComparisonRow feature="Monthly AI insights" others={false} debtwise={true} />
                  <ComparisonRow feature="Free forever plan" others={false} debtwise={true} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section id="calculator" className="py-24 lg:py-32 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-4">Debt Calculator</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                See How Much You Could{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  Save
                </span>
              </h2>
              <p className="text-lg text-slate-500">
                Estimate how much faster you could become debt-free with optimized payments.
              </p>
            </div>
            <DebtCalculator />
          </div>
        </section>

        {/* Add-ons Section */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Add-Ons</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                Easy Add-Ons
              </h2>
              <p className="text-lg text-slate-500">
                Enhance your debt management with powerful additional features.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <AddonCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="AI Chat History"
                description="Access your complete conversation history with the AI advisor. Review past advice and track your financial journey."
                badge="Free"
              />
              <AddonCard
                icon={<PieChart className="h-6 w-6" />}
                title="Advanced Analytics"
                description="Detailed breakdowns by type, provider, and interest rate. Visual charts and progress tracking over time."
                badge="Pro"
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="reviews" className="py-24 lg:py-32 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Testimonials</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                Trusted by{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Bold Brands
                </span>
              </h2>
              <p className="text-lg text-slate-500">
                Real feedback from people who took control of their finances.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="DebtWise AI helped me pay off $8,000 in credit card debt 6 months faster than I planned. The AI strategies were game-changing."
                author="Sarah M."
                role="Marketing Manager"
                rating={5}
              />
              <TestimonialCard
                quote="I was juggling 4 different BNPL payments. This app consolidated everything and gave me a clear path forward. Strongly recommend."
                author="James K."
                role="Software Engineer"
                rating={5}
              />
              <TestimonialCard
                quote="The payment simulator showed me how an extra $100/month saves $2,400 in interest. Seeing those numbers motivated me to stay on track."
                author="Emily R."
                role="Teacher"
                rating={5}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-8 py-16 sm:px-16 sm:py-24">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCIvPjwvc3ZnPg==')] opacity-60" />
              <div className="absolute -top-24 -right-24 h-64 w-64 bg-cyan-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-blue-300/20 rounded-full blur-3xl" />
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                  Save Time, Money, And{" "}
                  <span className="text-cyan-300">Become Debt-Free</span>
                </h2>
                <p className="text-lg text-blue-100/80 mb-10 leading-relaxed">
                  DebtWise AI integrates all your debts together in one place,
                  making it easy to build a plan and stick to it.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 h-13 px-8 text-base font-bold shadow-xl rounded-full">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 flex items-center justify-center gap-8 text-sm text-blue-200/70">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Bank-level security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Setup in 2 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Free forever</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <Image src="/logo-debtwise-transparent.png" alt="DebtWise AI" width={32} height={32} className="rounded-md" />
                <span className="font-display text-lg font-bold tracking-tight">
                  <span className="text-blue-700">Debt</span>
                  <span className="text-blue-500">Wise</span>
                  <span className="text-blue-400 text-sm align-super ml-0.5">AI</span>
                </span>
              </div>
              <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
                AI-powered debt management for BNPL, credit cards, and consumer loans.
                Take control of your financial future.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#features" className="text-slate-500 hover:text-slate-900 transition-colors">Features</Link></li>
                <li><Link href="#calculator" className="text-slate-500 hover:text-slate-900 transition-colors">Calculator</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">About</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} DebtWise AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeaturePoint({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-display font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ComparisonRow({
  feature,
  others,
  debtwise,
}: {
  feature: string;
  others: boolean;
  debtwise: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center py-3.5 border-b border-slate-100 last:border-0">
      <div className="text-sm font-medium text-slate-700">{feature}</div>
      <div className="flex justify-center">
        {others ? (
          <Check className="h-5 w-5 text-slate-300" />
        ) : (
          <X className="h-5 w-5 text-red-300" />
        )}
      </div>
      <div className="flex justify-center">
        {debtwise ? (
          <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
            <Check className="h-4 w-4 text-blue-600" />
          </div>
        ) : (
          <X className="h-5 w-5 text-red-300" />
        )}
      </div>
    </div>
  );
}

function AddonCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-5">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white transition-all duration-300 shadow-sm">
          {icon}
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
          badge === "Free"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-blue-50 text-blue-700 border border-blue-200"
        }`}>
          {badge}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      <button className="mt-5 text-sm font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
        Learn more
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-0.5 mb-5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <blockquote className="text-slate-600 mb-6 leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-display font-bold text-slate-900">{author}</p>
          <p className="text-sm text-slate-400">{role}</p>
        </div>
      </div>
    </div>
  );
}

function DebtCalculator() {
  const [balance, setBalance] = useState(10000);
  const [apr, setApr] = useState(18.99);
  const [minPayment, setMinPayment] = useState(250);
  const [extraPayment, setExtraPayment] = useState(100);

  const calculatePayoff = (balance: number, apr: number, monthlyPayment: number) => {
    if (monthlyPayment <= 0 || balance <= 0) return { months: 0, totalInterest: 0 };
    const monthlyRate = apr / 100 / 12;
    let remainingBalance = balance;
    let months = 0;
    let totalInterest = 0;
    const maxMonths = 600;
    while (remainingBalance > 0 && months < maxMonths) {
      const interest = remainingBalance * monthlyRate;
      totalInterest += interest;
      const principal = Math.min(monthlyPayment - interest, remainingBalance);
      if (principal <= 0) return { months: Infinity, totalInterest: Infinity };
      remainingBalance -= principal;
      months++;
    }
    return { months, totalInterest };
  };

  const minOnlyResult = calculatePayoff(balance, apr, minPayment);
  const withExtraResult = calculatePayoff(balance, apr, minPayment + extraPayment);
  const monthsSaved = minOnlyResult.months - withExtraResult.months;
  const interestSaved = minOnlyResult.totalInterest - withExtraResult.totalInterest;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Calculator className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-slate-900">Debt Payoff Calculator</h3>
        </div>
        <div className="space-y-6">
          {[
            { label: "Current Balance", prefix: "$", value: balance, onChange: setBalance },
            { label: "Interest Rate (APR)", suffix: "%", value: apr, onChange: setApr },
            { label: "Minimum Monthly Payment", prefix: "$", value: minPayment, onChange: setMinPayment },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
              <div className="relative">
                {field.prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{field.prefix}</span>}
                <input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className={`w-full ${field.prefix ? "pl-8" : "pl-4"} ${field.suffix ? "pr-8" : "pr-4"} py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 font-medium`}
                />
                {field.suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{field.suffix}</span>}
              </div>
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Extra Monthly Payment</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                type="number"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 font-medium"
              />
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="25"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full mt-3 accent-blue-600"
            />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl shadow-xl shadow-blue-900/20 p-8 text-white flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold">Your Potential Savings</h3>
        </div>
        <div className="space-y-6 flex-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <p className="text-blue-200 text-sm font-medium mb-1">Months Saved</p>
            <p className="font-display text-5xl font-extrabold">{monthsSaved > 0 ? monthsSaved : 0}</p>
            <p className="text-blue-300/70 text-sm mt-2">
              {withExtraResult.months === Infinity
                ? "Increase payment to pay off"
                : `Payoff in ${withExtraResult.months} months vs ${minOnlyResult.months}`}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <p className="text-blue-200 text-sm font-medium mb-1">Interest Saved</p>
            <p className="font-display text-5xl font-extrabold">{formatCurrency(Math.max(0, interestSaved))}</p>
            <p className="text-blue-300/70 text-sm mt-2">
              Total interest: {formatCurrency(withExtraResult.totalInterest)}
            </p>
          </div>
        </div>
        <div className="pt-6 mt-6 border-t border-white/15">
          <Link href="/signup">
            <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 h-12 font-bold text-base rounded-full shadow-lg">
              <Zap className="mr-2 h-5 w-5" />
              Start Your Plan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

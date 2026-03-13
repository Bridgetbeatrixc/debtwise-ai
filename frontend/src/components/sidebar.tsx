"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useCurrency } from "@/contexts/currency-context";
import { CURRENCIES } from "@/lib/currency";
import {
  LayoutDashboard,
  CreditCard,
  Bot,
  BarChart3,
  Calculator,
  LogOut,
  Menu,
  X,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/debts", label: "Debts", icon: CreditCard },
  { href: "/chat", label: "AI Advisor", icon: Bot },
  { href: "/simulate", label: "Simulator", icon: Calculator },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 rounded-lg border bg-background p-2 lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <Image src="/logo-debtwise-transparent.png" alt="DebtWise AI" width={32} height={32} className="rounded-md" />
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="text-blue-700">Debt</span>
            <span className="text-blue-500">Wise</span>
            <span className="text-blue-400 text-sm align-super ml-0.5">AI</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="mb-3 flex items-center gap-2 px-3">
            <DollarSign className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <Select
              value={currency}
              onValueChange={(v) => v && setCurrency(v as import("@/lib/currency").CurrencyCode)}
            >
              <SelectTrigger className="h-8 w-full border-0 bg-transparent px-0 py-1 text-xs text-muted-foreground shadow-none focus:ring-0">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label} ({c.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-3 px-3 text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}

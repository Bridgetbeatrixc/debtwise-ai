"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Debt, DebtCreate, DebtType } from "@/lib/types";
import { useCurrency } from "@/contexts/currency-context";
import { CURRENCIES } from "@/lib/currency";

interface DebtFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DebtCreate) => void;
  editingDebt?: Debt | null;
  loading?: boolean;
}

const DEBT_TYPES: { value: DebtType; label: string }[] = [
  { value: "bnpl", label: "Buy Now Pay Later" },
  { value: "credit_card", label: "Credit Card" },
  { value: "loan", label: "Personal Loan" },
  { value: "digital_loan", label: "Digital Loan" },
];

export function DebtForm({ open, onClose, onSubmit, editingDebt, loading }: DebtFormProps) {
  const { currency } = useCurrency();
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";
  const [provider, setProvider] = useState("");
  const [balance, setBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [debtType, setDebtType] = useState<DebtType>("bnpl");

  useEffect(() => {
    if (editingDebt) {
      setProvider(editingDebt.provider);
      setBalance(editingDebt.balance.toString());
      setInterestRate(editingDebt.interest_rate.toString());
      setMinimumPayment(editingDebt.minimum_payment.toString());
      setDueDate(editingDebt.due_date || "");
      setDebtType(editingDebt.debt_type);
    } else {
      setProvider("");
      setBalance("");
      setInterestRate("");
      setMinimumPayment("");
      setDueDate("");
      setDebtType("bnpl");
    }
  }, [editingDebt, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      provider,
      balance: parseFloat(balance),
      interest_rate: parseFloat(interestRate),
      minimum_payment: parseFloat(minimumPayment),
      due_date: dueDate || undefined,
      debt_type: debtType,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingDebt ? "Edit Debt" : "Add New Debt"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Input
              id="provider"
              placeholder="e.g., Afterpay, Chase, SoFi"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="debtType">Debt Type</Label>
            <Select value={debtType} onValueChange={(v) => setDebtType(v as DebtType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEBT_TYPES.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>
                    {dt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Balance ({currencySymbol})</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">APR (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0.00"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumPayment">Min Payment ({currencySymbol})</Label>
              <Input
                id="minimumPayment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={minimumPayment}
                onChange={(e) => setMinimumPayment(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingDebt ? "Update" : "Add Debt"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getDebts, createDebt, updateDebt, deleteDebt } from "@/lib/api";
import { Debt, DebtCreate } from "@/lib/types";
import { DebtCard } from "@/components/debt-card";
import { DebtForm } from "@/components/debt-form";
import { toast } from "sonner";

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadDebts() {
    try {
      const data = await getDebts();
      setDebts(data);
    } catch {
      toast.error("Failed to load debts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDebts();
  }, []);

  async function handleSubmit(data: DebtCreate) {
    setSaving(true);
    try {
      if (editingDebt) {
        await updateDebt(editingDebt.id, data);
        toast.success("Debt updated");
      } else {
        await createDebt(data);
        toast.success("Debt added");
      }
      setFormOpen(false);
      setEditingDebt(null);
      await loadDebts();
    } catch {
      toast.error("Failed to save debt");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDebt(id);
      toast.success("Debt deleted");
      await loadDebts();
    } catch {
      toast.error("Failed to delete debt");
    }
  }

  function handleEdit(debt: Debt) {
    setEditingDebt(debt);
    setFormOpen(true);
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
          <h1 className="text-2xl font-bold tracking-tight">Debts</h1>
          <p className="text-muted-foreground">Manage all your debts in one place</p>
        </div>
        <Button onClick={() => { setEditingDebt(null); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Debt
        </Button>
      </div>

      {debts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="mb-2 text-lg font-medium">No debts yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Add your first debt to get started with AI-powered management
          </p>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Debt
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {debts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <DebtForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingDebt(null); }}
        onSubmit={handleSubmit}
        editingDebt={editingDebt}
        loading={saving}
      />
    </div>
  );
}

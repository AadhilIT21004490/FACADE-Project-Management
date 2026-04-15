"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/utils";
import { Plus, Trash2, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { toast } from "sonner";

export function PaymentsTab({ project }: { project: any }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: 0, date: "", method: "bank_transfer", notes: "" });

  const fetchPayments = () => {
    fetch(`/api/projects/${project._id}/payments`)
      .then(r => r.json())
      .then(j => {
        if (j.success) setPayments(j.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, [project._id]);

  const deletePayment = async (id: string) => {
    if (!confirm("Delete payment record? This will reduce the paid amount on the project.")) return;
    await fetch(`/api/payments/${id}`, { method: "DELETE" });
    fetchPayments();
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${project._id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayment)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment recorded");
        fetchPayments();
        setIsModalOpen(false);
        setNewPayment({ amount: 0, date: "", method: "bank_transfer", notes: "" });
      } else {
        toast.error(data.error || "Failed to record payment");
      }
    } catch (err) {
      toast.error("Internal error");
    }
  };

  if (loading) return <div className="text-center mt-10"><div className="animate-spin w-8 h-8 mx-auto border-4 border-primary rounded-full border-t-transparent"></div></div>;

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 glass p-6 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Contract Value</p>
            <p className="text-xl font-bold">{formatCurrency(project.totalValue)}</p>
          </div>
          <div className="w-[1px] h-10 bg-border"></div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
            <p className="text-xl font-bold text-emerald-500">{formatCurrency(project.paidAmount)}</p>
          </div>
          <div className="w-[1px] h-10 bg-border"></div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Balance Remaining</p>
            <p className="text-xl font-bold text-rose-500 whitespace-nowrap">{formatCurrency(Math.max(0, project.totalValue - project.paidAmount))}</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-sm font-medium transition-all text-sm shrink-0">
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      <div className="glass rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium max-sm:hidden">Method</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium max-md:hidden">Notes</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-foreground">
            {payments.map(p => (
              <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">{formatDate(p.date)}</td>
                <td className="px-6 py-4 max-sm:hidden capitalize">{p.method}</td>
                <td className="px-6 py-4 font-semibold text-emerald-500">{formatCurrency(p.amount)}</td>
                <td className="px-6 py-4 max-md:hidden text-muted-foreground truncate max-w-[200px]">{p.notes || "—"}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deletePayment(p._id)} className="p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground bg-background/50">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Payment">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount Paid ($)</label>
            <input required type="number" min="1" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input required type="date" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newPayment.method} onChange={e => setNewPayment({...newPayment, method: e.target.value})}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input type="text" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newPayment.notes} onChange={e => setNewPayment({...newPayment, notes: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl shadow mt-4">Record Payment</button>
        </form>
      </Modal>
    </div>
  );
}

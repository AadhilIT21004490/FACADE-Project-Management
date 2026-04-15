"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Circle, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { daysUntil, deadlineLabel } from "@/utils";
import { Modal } from "@/components/Modal";
import { toast } from "sonner";

export function DeadlinesTab({ projectId }: { projectId: string }) {
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState({ title: "", date: "", type: "general" });

  const fetchDeadlines = () => {
    fetch(`/api/projects/${projectId}/deadlines`)
      .then(r => r.json())
      .then(j => {
        if (j.success) setDeadlines(j.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeadlines();
  }, [projectId]);

  const toggleStatus = async (id: string, current: boolean) => {
    await fetch(`/api/deadlines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !current }),
    });
    fetchDeadlines();
  };

  const deleteDeadline = async (id: string) => {
    if (!confirm("Delete this deadline?")) return;
    await fetch(`/api/deadlines/${id}`, { method: "DELETE" });
    fetchDeadlines();
  };

  const handleAddDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/deadlines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newDeadline, isCompleted: false })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Deadline added successfully");
        fetchDeadlines();
        setIsModalOpen(false);
        setNewDeadline({ title: "", date: "", type: "general" });
      } else {
        toast.error(data.error || "Failed to add deadline");
      }
    } catch (err) {
      toast.error("Internal error");
    }
  };

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-muted rounded w-3/4"></div></div></div>;

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-sm font-medium transition-all text-sm">
          <Plus className="w-4 h-4" />
          <span>Add Deadline</span>
        </button>
      </div>

      {deadlines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deadlines.map(d => {
            const isOverdue = !d.isCompleted && daysUntil(d.date) < 0;
            return (
              <div key={d._id} className={`glass p-5 rounded-2xl border transition-all relative overflow-hidden group ${isOverdue ? 'border-red-500/30' : 'border-border/50 hover:border-primary/40'}`}>
                {isOverdue && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full flex justify-end p-2 -mr-4 -mt-4"><AlertTriangle className="w-4 h-4 text-red-500" /></div>}
                
                <div className="flex items-start gap-4 z-10 relative">
                  <button onClick={() => toggleStatus(d._id, d.isCompleted)} className="mt-1 transition-transform active:scale-90">
                    {d.isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg ${d.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{d.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted capitalize">{d.type}</span>
                      <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {format(new Date(d.date), "MMM d, yyyy")} ({deadlineLabel(d.date)})
                      </span>
                    </div>
                  </div>
                  <button onClick={() => deleteDeadline(d._id)} className="p-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center glass rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground">No deadlines found. Add one to keep your project on track.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Deadline">
        <form onSubmit={handleAddDeadline} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input required type="text" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newDeadline.title} onChange={e => setNewDeadline({...newDeadline, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input required type="date" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newDeadline.date} onChange={e => setNewDeadline({...newDeadline, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newDeadline.type} onChange={e => setNewDeadline({...newDeadline, type: e.target.value})}>
              <option value="general">General</option>
              <option value="milestone">Milestone</option>
              <option value="payment">Payment Due</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl shadow mt-4">Add Deadline</button>
        </form>
      </Modal>
    </div>
  );
}

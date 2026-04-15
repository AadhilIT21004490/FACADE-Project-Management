"use client";

import { Clock, ActivitySquare, ChevronDown } from "lucide-react";
import { formatCurrency, formatDate, paymentProgress } from "@/utils";
import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function OverviewTab({ project: initialProject }: { project: any }) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Status management states
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState(project.status);
  const [completionDate, setCompletionDate] = useState("");

  const fetchActivities = () => {
    fetch(`/api/projects/${project._id}/activities`)
      .then(r => r.json())
      .then(j => { if (j.success) setActivities(j.data) });
  };

  useEffect(() => {
    fetchActivities();
  }, [project._id]);

  const updateProject = async (updates: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.data);
        toast.success("Project updated successfully");
        fetchActivities();
        // Trigger a router refresh to sync parent state if needed
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update project");
        // Revert UI if it failed
        setTempStatus(project.status);
      }
    } catch (err) {
      toast.error("Internal error");
      setTempStatus(project.status);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: any) => {
    if (newStatus === "completed") {
      setTempStatus(newStatus);
      setIsCompletionModalOpen(true);
    } else {
      setTempStatus(newStatus);
      updateProject({ status: newStatus });
    }
  };

  const confirmCompletion = () => {
    if (!completionDate) {
      toast.error("Please select a completion date");
      return;
    }
    updateProject({ status: "completed", endDate: completionDate });
    setIsCompletionModalOpen(false);
  };

  const cancelCompletion = () => {
    setIsCompletionModalOpen(false);
    setTempStatus(project.status); // Revert back to previous status
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "on-hold": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "completed": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default: return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Project Details</h3>
            
            {/* Dynamic Status Dropdown */}
            <div className="relative group">
              <select
                disabled={loading}
                value={tempStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`
                  appearance-none cursor-pointer px-4 py-1.5 pr-10 rounded-full text-xs font-bold border transition-all
                  focus:outline-none focus:ring-2 focus:ring-primary/20
                  ${getStatusColor(tempStatus)}
                `}
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>
          </div>
          
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{project.description || "No description provided."}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags?.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-5 rounded-2xl border border-border/50 shadow-sm transition-colors hover:border-primary/30">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 font-medium">
              <Clock className="w-4 h-4" /> Start Date
            </div>
            <p className="text-lg font-semibold">{formatDate(project.startDate)}</p>
          </div>
          <div className="glass p-5 rounded-2xl border border-border/50 shadow-sm transition-colors hover:border-primary/30">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 font-medium">
              <Clock className="w-4 h-4" /> End Date
            </div>
            <p className="text-lg font-semibold">{project.endDate ? formatDate(project.endDate) : "—"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
          <h3 className="text-xl font-bold mb-6">Financials</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(project.totalValue)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm text-muted-foreground">Paid Amount</p>
                <p className="font-semibold text-emerald-500">{formatCurrency(project.paidAmount)}</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${paymentProgress(project.totalValue, project.paidAmount)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ActivitySquare className="w-5 h-5 text-primary" /> Activity Log
          </h3>

          <div className="
            flex-1 
            overflow-y-auto 
            space-y-4 
            pr-2
            /* Modern Scrollbar Styling */
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-muted/30
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-primary/30
            hover:[&::-webkit-scrollbar-thumb]:bg-primary/60
            [&::-webkit-scrollbar-thumb]:transition-colors
            
            /* Fade top & bottom to hint scroll */
            [mask-image:linear-gradient(to_bottom,transparent_0%,black_5%,black_95%,transparent_100%)]
            [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_5%,black_95%,transparent_100%)]
          ">
            {activities.length > 0 ? (
              activities.map((a: any) => (
                <div key={a._id} className="border-l-2 border-primary/30 pl-4 py-1 relative group">
                  <div className="absolute w-2 h-2 rounded-full bg-primary -left-[5px] top-2 group-hover:scale-125 transition-transform" />
                  <p className="font-semibold text-sm">{a.action}</p>
                  <p className="text-muted-foreground text-xs">{a.description}</p>
                  <p className="text-muted-foreground/60 text-[10px] mt-1">
                    {formatDate(a.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-sm text-muted-foreground italic">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Completion Modal */}
      <Modal 
        isOpen={isCompletionModalOpen} 
        onClose={cancelCompletion} 
        title="Confirm Completion Date"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please specify the date this project was officially completed. This action will finalize the project lifecycle.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Completion Date *</label>
            <input 
              required 
              type="date" 
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" 
              value={completionDate} 
              onChange={e => setCompletionDate(e.target.value)} 
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={cancelCompletion}
              className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              Cancel
            </button>
            <button 
              onClick={confirmCompletion}
              disabled={!completionDate || loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
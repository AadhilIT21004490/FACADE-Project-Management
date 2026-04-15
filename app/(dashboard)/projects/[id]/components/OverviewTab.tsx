"use client";

import { Clock, ActivitySquare } from "lucide-react";
import { formatCurrency, formatDate, paymentProgress } from "@/utils";
import { useEffect, useState } from "react";

export function OverviewTab({ project }: { project: any }) {
  const [activities, setActivities] = useState([]);
  
  useEffect(() => {
    fetch(`/api/projects/${project._id}/activities`)
      .then(r => r.json())
      .then(j => { if (j.success) setActivities(j.data) });
  }, [project._id]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Project Details</h3>
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
            <p className="text-lg font-semibold">{formatDate(project.endDate)}</p>
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
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {activities.length > 0 ? activities.map((a: any) => (
              <div key={a._id} className="border-l-2 border-primary/30 pl-4 py-1 relative">
                <div className="absolute w-2 h-2 rounded-full bg-primary -left-[5px] top-2" />
                <p className="font-semibold text-sm">{a.action}</p>
                <p className="text-muted-foreground text-xs">{a.description}</p>
                <p className="text-muted-foreground/60 text-[10px] mt-1">{formatDate(a.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground italic">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
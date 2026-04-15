"use client";

import { useEffect, useState } from "react";
import { Bell, ActivitySquare, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/utils";

export default function NotificationsPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setActivities(json.data.recentActivities || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
     return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
             <Bell className="w-8 h-8 text-primary" /> Notifications
          </h1>
          <p className="text-muted-foreground mt-1">Real-time system alerts and global activity logs.</p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border/50 shadow-sm overflow-hidden">
         {activities.length > 0 ? (
            <div className="divide-y divide-border/50">
               {activities.map((activity, index) => (
                  <div key={activity._id || index} className="p-5 hover:bg-muted/30 transition-colors flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <ActivitySquare className="w-5 h-5 text-primary" />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h4 className="font-semibold text-foreground">{activity.action}</h4>
                           <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-full">
                              {formatDate(activity.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                           </span>
                        </div>
                        <p className="text-sm text-foreground/80 mt-1">{activity.description}</p>
                        {activity.projectId?.name && (
                           <p className="text-xs text-primary font-medium mt-2">Project: {activity.projectId.name}</p>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="p-20 text-center text-muted-foreground flex flex-col items-center">
               <CheckCircle2 className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
               <p>You're all caught up!</p>
               <p className="text-sm">New logs will appear here when your workspace becomes active.</p>
            </div>
         )}
      </div>
    </div>
  );
}

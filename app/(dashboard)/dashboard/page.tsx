"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, FolderKanban, ActivitySquare, AlertCircle, DollarSign, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/utils";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Global Overview</h1>
        <p className="text-muted-foreground">Monitor essential metrics across all your active projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Projects" value={data?.activeProjects} icon={<FolderKanban className="text-blue-500" />} />
        <StatCard title="Total Revenue" value={formatCurrency(data?.totalRevenue || 0)} icon={<DollarSign className="text-emerald-500" />} />
        <StatCard title="Pending Payments" value={formatCurrency(data?.pendingPayments || 0)} icon={<AlertCircle className="text-rose-500" />} />
        <StatCard title="Total Projects" value={data?.totalProjects} icon={<ActivitySquare className="text-indigo-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deadlines Section */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
              Upcoming Deadlines
              <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full ml-2">Next 15 Days</span>
            </h2>
          </div>

          {data?.upcomingDeadlines?.length > 0 ? (
            <div className="
      overflow-y-auto
      max-h-[420px] 
      pr-2
      space-y-4
      /* Scrollbar styling */
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
              {data.upcomingDeadlines.map((d: any) => (
                <Link href={`/projects/${d.projectId._id}?tab=deadlines`} key={d._id} className="block group">
                  <div className="flex justify-between items-center bg-background/40 hover:bg-muted/50 p-4 rounded-xl transition-all border border-transparent hover:border-border">
                    <div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{d.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{d.projectId.name} • {d.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{formatDate(d.date)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 bg-muted/20 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No upcoming deadlines.</p>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          {data?.recentActivities?.length > 0 ? (
            <div
              className="
        overflow-y-auto
        max-h-[620px]
        pr-2
        space-y-6
        relative
        before:absolute before:inset-0 before:ml-2 before:-translate-x-px
        md:before:mx-auto md:before:translate-x-0
        before:h-full before:w-0.5
        before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent

        /* Scrollbar styling */
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
      "
            >
              {data.recentActivities.map((a: any) => (
                <div
                  key={a._id}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-background bg-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] glass p-4 rounded-xl shadow-sm border border-border/50 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-semibold text-sm text-primary">{a.action}</h4>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {formatDate(a.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80">{a.description}</p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{a.projectId?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/20 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No recent activity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: any, icon: React.ReactNode }) {
  return (
    <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full flex items-start justify-end p-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-muted-foreground text-sm font-medium mb-2">{title}</p>
      <h3 className="text-3xl font-bold text-foreground">{value}</h3>
    </div>
  );
}
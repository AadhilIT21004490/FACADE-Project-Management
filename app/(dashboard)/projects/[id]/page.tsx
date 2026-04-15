"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import { ArrowLeft, LayoutDashboard, CalendarClock, DollarSign, Files, Shield } from "lucide-react";
import Link from "next/link";
import { OverviewTab } from "./components/OverviewTab";
import { DeadlinesTab } from "./components/DeadlinesTab";
import { PaymentsTab } from "./components/PaymentsTab";
import { DocumentsTab } from "./components/DocumentsTab";
import { CredentialsTab } from "./components/CredentialsTab";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "deadlines", label: "Deadlines", icon: CalendarClock },
  { id: "payments", label: "Payments", icon: DollarSign },
  { id: "documents", label: "Documents", icon: Files },
  { id: "credentials", label: "Vault", icon: Shield },
];

function ProjectDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // React 19 Next.js params unwrapping
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;
  
  const currentTab = searchParams.get("tab") || "overview";
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProject(json.data);
        setLoading(false);
      });
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Link href="/projects" className="text-primary hover:underline">Return to Projects</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-primary/10 text-primary border-primary/20 capitalize">
              {project.status}
            </span>
          </div>
          <p className="text-lg text-muted-foreground">{project.clientName}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-px scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(`/projects/${projectId}?tab=${tab.id}`)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {currentTab === "overview" && <OverviewTab project={project} />}
        {currentTab === "deadlines" && <DeadlinesTab projectId={project._id} />}
        {currentTab === "payments" && <PaymentsTab project={project} />}
        {currentTab === "documents" && <DocumentsTab projectId={project._id} />}
        {currentTab === "credentials" && <CredentialsTab projectId={project._id} />}
      </div>
    </div>
  );
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[60vh]"><div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <ProjectDetailsContent params={params} />
    </Suspense>
  );
}
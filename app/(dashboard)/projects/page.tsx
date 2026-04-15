"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Plus, Search, Folder, LayoutGrid, List } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/Modal";
import { toast } from "sonner";

function ProjectsContent() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const [projects, setProjects] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const [search, setSearch] = useState(searchParams.get("search") || "");
   const [filter, setFilter] = useState("all");
   const [viewMode, setViewMode] = useState<"list" | "grid">("list"); // Default per requirements

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [newProject, setNewProject] = useState({ name: "", clientName: "", description: "", totalValue: 0, status: "active", startDate: "" });

   const handleCreateProject = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProject)
         });
         const data = await res.json();
         if (data.success) {
            toast.success("Project created successfully");
            setProjects([data.data, ...projects]);
            setIsModalOpen(false);
            setNewProject({ name: "", clientName: "", description: "", totalValue: 0, status: "active", startDate: "" });
         } else {
            toast.error(data.error || "Failed to create project");
         }
      } catch (err) {
         toast.error("Internal error");
      }
   };

   useEffect(() => {
      fetch("/api/projects")
         .then((res) => res.json())
         .then((json) => {
            if (json.success) setProjects(json.data);
            setLoading(false);
         });
   }, []);

   const filteredProjects = projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
         (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = filter === "all" ? true : p.status === filter;
      return matchesSearch && matchesStatus;
   });

   return (
      <div className="space-y-6 animate-fade-in pb-10">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Projects Library</h1>
               <p className="text-muted-foreground mt-1">Manage and track all client assignments.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
               <div className="glass flex items-center p-1 rounded-xl border border-border bg-background/50">
                  <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                     <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                     <LayoutGrid className="w-4 h-4" />
                  </button>
               </div>
               <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-sm font-medium transition-all text-sm"
               >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
               </button>
            </div>
         </div>

         <div className="glass p-2 rounded-2xl flex flex-col sm:flex-row gap-3 border border-border/50 items-center">
            <div className="relative flex-1 w-full">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
               <input
                  type="text"
                  placeholder="Search projects by name or client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-background/50 border-none outline-none focus:ring-1 focus:ring-primary/50 pl-9 pr-4 py-2.5 rounded-xl text-sm"
               />
            </div>
            <div className="w-full sm:w-48 shrink-0 relative">
               <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="w-full bg-background/50 border-none outline-none focus:ring-1 focus:ring-primary/50 px-4 py-2.5 rounded-xl text-sm text-foreground cursor-pointer appearance-none font-medium text-muted-foreground hover:text-foreground transition-colors"
               >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
               </div>
            </div>
         </div>

         {loading ? (
            <div className="flex justify-center items-center h-48">
               <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
         ) : (
            <>
               {viewMode === "list" ? (
                  <div className="glass rounded-2xl border border-border/50 overflow-hidden shadow-sm animate-fade-in">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                           <thead className="bg-muted/30 text-muted-foreground uppercase text-[13px] tracking-wider font-semibold">
                              <tr>
                                 <th className="px-6 py-4">Project Details</th>
                                 <th className="px-6 py-4">Progress Lifecycle</th>
                                 <th className="px-6 py-4">Contract Value</th>
                                 <th className="px-6 py-4">Current Status</th>
                                 <th className="px-6 py-4 text-right">Last Updated</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-border/50 text-foreground">
                              {filteredProjects.map((p) => {
                                 const percent = p.totalValue ? Math.min(100, Math.round((p.paidAmount / p.totalValue) * 100)) : 0;
                                 return (
                                    <tr
                                       key={p._id}
                                       onClick={() => router.push(`/projects/${p._id}`)}
                                       className="hover:bg-muted/30 transition-colors cursor-pointer group"
                                    >
                                       <td className="px-6 py-4">
                                          <div className="font-bold text-[15px] group-hover:text-primary transition-colors">{p.name}</div>
                                          <div className="text-muted-foreground text-xs mt-0.5 font-medium">{p.clientName || "Unknown Client"}</div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                                             </div>
                                             <span className="text-[14px] font-bold text-muted-foreground w-8">{percent}%</span>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 font-semibold text-foreground/80">{formatCurrency(p.totalValue)}</td>
                                       <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                                       <td className="px-6 py-4 text-right text-muted-foreground text-[14px] font-medium">{formatDate(p.updatedAt)}</td>
                                    </tr>
                                 );
                              })}
                              {filteredProjects.length === 0 && (
                                 <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground bg-muted/10">
                                       No projects found matching your criteria.
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                     {filteredProjects.map((p) => {
                        const percent = p.totalValue ? Math.min(100, Math.round((p.paidAmount / p.totalValue) * 100)) : 0;
                        return (
                           <Link href={`/projects/${p._id}`} key={p._id} className="group cursor-pointer">
                              <div className="glass h-full p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col relative overflow-hidden">
                                 <div className="flex justify-between items-start mb-5 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                       <Folder className="w-5 h-5" />
                                    </div>
                                    <StatusBadge status={p.status} />
                                 </div>

                                 <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                                 <p className="text-sm font-medium text-muted-foreground mb-6">{p.clientName || "Unknown Client"}</p>

                                 <div className="mt-auto space-y-4 relative z-10">
                                    <div className="flex justify-between text-sm">
                                       <span className="text-muted-foreground font-medium">Value</span>
                                       <span className="font-semibold text-foreground/80">{formatCurrency(p.totalValue)}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                       <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                          <span>Progress</span>
                                          <span>{percent}%</span>
                                       </div>
                                       <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                          <div
                                             className="bg-primary h-full rounded-full transition-all duration-1000"
                                             style={{ width: `${percent}%` }}
                                          />
                                       </div>
                                    </div>
                                    <div className="pt-2 border-t border-border/50 flex justify-end text-xs font-medium text-muted-foreground">
                                       <span>Updated: {formatDate(p.updatedAt, { dateStyle: "medium" })}</span>
                                    </div>
                                 </div>
                              </div>
                           </Link>
                        );
                     })}

                     {filteredProjects.length === 0 && (
                        <div className="col-span-full py-20 text-center glass rounded-2xl border border-dashed border-border">
                           <p className="text-muted-foreground font-medium">No projects found matching your criteria.</p>
                        </div>
                     )}
                  </div>
               )}
            </>
         )}

         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
            <form onSubmit={handleCreateProject} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Project Name *</label>
                  <input required type="text" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input required type="date" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newProject.startDate} onChange={e => setNewProject({ ...newProject, startDate: e.target.value })} />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Client Name</label>
                  <input type="text" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newProject.clientName} onChange={e => setNewProject({ ...newProject, clientName: e.target.value })} />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Total Value ($)</label>
                  <input type="number" min="0" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newProject.totalValue} onChange={e => setNewProject({ ...newProject, totalValue: Number(e.target.value) })} />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
               </div>
               <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl shadow mt-4">Create Project</button>
            </form>
         </Modal>
      </div>
   );
}

function StatusBadge({ status }: { status: string }) {
   const styles: Record<string, string> = {
      "active": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "completed": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "on-hold": "bg-amber-500/10 text-amber-500 border-amber-500/20",
   };
   return (
      <span className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold rounded-full border ${styles[status] || "bg-muted"}`}>
         {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
   );
}

export default function ProjectsPage() {
   return (
      <Suspense fallback={<div className="flex justify-center items-center h-48"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
         <ProjectsContent />
      </Suspense>
   );
}
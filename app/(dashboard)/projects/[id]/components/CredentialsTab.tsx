"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Plus, ExternalLink, KeyRound, User, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils";
import { Modal } from "@/components/Modal";
import { toast } from "sonner";

export function CredentialsTab({ projectId }: { projectId: string }) {
  const [creds, setCreds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCred, setNewCred] = useState({ serviceName: "", url: "", username: "", password: "", notes: "" });

  const fetchCreds = () => {
    fetch(`/api/projects/${projectId}/credentials`)
      .then(r => r.json())
      .then(j => {
        if (j.success) setCreds(j.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCreds();
  }, [projectId]);

  const togglePassword = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const deleteCred = async (id: string) => {
    if (!confirm("Permanently delete this credential?")) return;
    await fetch(`/api/credentials/${id}`, { method: "DELETE" });
    fetchCreds();
  };

  const handleAddCred = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCred)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Credential added to secure vault");
        fetchCreds();
        setIsModalOpen(false);
        setNewCred({ serviceName: "", url: "", username: "", password: "", notes: "" });
      } else {
        toast.error(data.error || "Failed to add credential");
      }
    } catch (err) {
      toast.error("Internal error");
    }
  };

  if (loading) return <div className="text-center mt-10"><div className="animate-spin w-8 h-8 mx-auto border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <ShieldCheck className="w-32 h-32 text-indigo-500" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-500 mb-1">
            <ShieldCheck className="w-5 h-5" /> Encrypted Vault
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl">
            These credentials are encrypted at rest using AES-256-GCM. 
            They are decrypted only when you (the authenticated project owner) request this page.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-sm font-medium transition-all text-sm shrink-0 relative z-10">
          <Plus className="w-4 h-4" /> Add Credential
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creds.map(cred => (
          <div key={cred._id} className="glass rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-muted/50 p-4 border-b border-border flex justify-between items-center">
              <h4 className="font-bold truncate" title={cred.serviceName}>{cred.serviceName}</h4>
              <div className="flex gap-2">
                {cred.url && (
                  <a href={cred.url.startsWith('http') ? cred.url : `https://${cred.url}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-indigo-500 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => deleteCred(cred._id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              {cred.username && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3" /> Username
                  </span>
                  <div className="flex justify-between items-center bg-background/50 border border-border rounded-lg px-3 py-2">
                    <span className="font-mono text-sm truncate">{cred.username}</span>
                    <button onClick={() => copyToClipboard(cred.username)} className="text-muted-foreground hover:text-foreground">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {cred.password && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> Password
                  </span>
                  <div className="flex justify-between items-center bg-background/50 border border-border rounded-lg px-3 py-2">
                    <span className="font-mono text-sm max-w-[calc(100%-3rem)] overflow-x-auto scrollbar-hide">
                      {showPassword[cred._id] ? cred.password : "••••••••••••••••"}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => togglePassword(cred._id)} className="text-muted-foreground hover:text-indigo-500 transition-colors">
                        {showPassword[cred._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => copyToClipboard(cred.password)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {cred.notes && (
                <div className="pt-2 border-t border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Notes</span>
                  <p className="text-sm text-foreground/80 line-clamp-2" title={cred.notes}>{cred.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {creds.length === 0 && (
         <div className="text-center text-muted-foreground !mt-12 text-sm italic py-10 bg-muted/20 border border-dashed border-border rounded-2xl">
            No credentials found. Store secrets securely.
         </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Secure Credential">
        <form onSubmit={handleAddCred} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Name *</label>
            <input required type="text" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newCred.serviceName} onChange={e => setNewCred({...newCred, serviceName: e.target.value})} placeholder="e.g. AWS Console" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL / Endpoint</label>
            <input type="text" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newCred.url} onChange={e => setNewCred({...newCred, url: e.target.value})} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username / Email</label>
            <input type="text" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newCred.username} onChange={e => setNewCred({...newCred, username: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newCred.password} onChange={e => setNewCred({...newCred, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none" value={newCred.notes} onChange={e => setNewCred({...newCred, notes: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow mt-4">Save to Vault</button>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { formatDate } from "@/utils";
import { UploadCloud, FileIcon, Trash2, DownloadCloud } from "lucide-react";

export function DocumentsTab({ projectId }: { projectId: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = () => {
    fetch(`/api/projects/${projectId}/documents`)
      .then(r => r.json())
      .then(j => {
        if (j.success) setDocs(j.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDocs();
  }, [projectId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("category", "other");

    await fetch(`/api/projects/${projectId}/documents`, {
      method: "POST",
      body: formData,
    });
    
    fetchDocs();
    setUploading(false);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const deleteDoc = async (id: string) => {
    if (!confirm("Permanently delete this document from Cloudinary and DB?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    fetchDocs();
  };

  if (loading) return <div className="text-center mt-10"><div className="animate-spin w-8 h-8 mx-auto border-4 border-primary rounded-full border-t-transparent"></div></div>;

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex border-2 border-dashed border-primary/30 rounded-2xl p-10 bg-primary/5 hover:bg-primary/10 transition-colors text-center cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary group-hover:-translate-y-1 transition-transform">
            {uploading ? <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"/> : <UploadCloud className="w-8 h-8" />}
          </div>
          <h3 className="font-bold text-lg">Upload Document to Vault</h3>
          <p className="text-muted-foreground text-sm">Drag and drop or click to browse. Files are securely stored in Cloudinary.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map(doc => (
          <div key={doc._id} className="glass p-5 rounded-2xl border border-border/50 flex flex-col group hover:border-primary/40 transition-colors shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 border border-primary/20">
              <FileIcon className="w-6 h-6" />
            </div>
            <h4 className="font-bold mb-1 truncate" title={doc.name}>{doc.name}</h4>
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
              <span className="bg-muted px-2 py-0.5 rounded uppercase">{doc.category}</span>
              <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            
            <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
               <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
               <div className="flex gap-2">
                 <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="w-8 h-8 bg-muted hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-colors">
                   <DownloadCloud className="w-4 h-4" />
                 </a>
                 <button onClick={() => deleteDoc(doc._id)} className="w-8 h-8 bg-muted hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-colors">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
      {docs.length === 0 && !uploading && (
         <div className="text-center text-muted-foreground !mt-12 text-sm italic">No documents uploaded yet.</div>
      )}
    </div>
  );
}
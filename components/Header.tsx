"use client";

import { Menu, Search, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/projects?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 glass">
      <div className="flex items-center gap-4 md:hidden">
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg">Facade</span>
      </div>

      <div className="hidden md:flex flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search projects (Press Enter)..."
          className="w-full bg-muted/50 border border-transparent focus:border-primary/50 focus:bg-background outline-none rounded-full pl-9 pr-4 py-2 text-sm transition-all"
        />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 hover:bg-primary/20 transition-all shadow-sm">
          <UserIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
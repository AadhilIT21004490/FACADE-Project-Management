"use client";

import { useEffect, useState } from "react";
import { User, Bell, Shield } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
   const { update } = useSession();
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);

   const [profile, setProfile] = useState({ name: "", email: "" });
   const [preferences, setPreferences] = useState({
      paymentReminders: true,
      deadlineReminders: true,
      emailNotifications: true
   });
   const [security, setSecurity] = useState({ currentPassword: "", newPassword: "" });

   useEffect(() => {
      fetch("/api/settings")
         .then(res => res.json())
         .then(json => {
            if (json.success && json.data) {
               setProfile({ name: json.data.name || "", email: json.data.email || "" });
               setPreferences(json.data.preferences || {
                  paymentReminders: true,
                  deadlineReminders: true,
                  emailNotifications: true
               });
            }
            setLoading(false);
         });
   }, []);

   const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
         const res = await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile })
         });
         const data = await res.json();
         if (data.success) {
            toast.success("Profile updated perfectly");
            update({ name: profile.name, email: profile.email }); // Sync NextAuth session!
         } else {
            toast.error(data.error);
         }
      } catch {
         toast.error("An error occurred");
      }
      setSaving(false);
   };

   const handleSaveSecurity = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!security.currentPassword || !security.newPassword) return;
      setSaving(true);
      try {
         const res = await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ security })
         });
         const data = await res.json();
         if (data.success) {
            toast.success("Password secured and updated");
            setSecurity({ currentPassword: "", newPassword: "" });
         } else {
            toast.error(data.error);
         }
      } catch {
         toast.error("An error occurred");
      }
      setSaving(false);
   };

   const togglePreference = async (key: keyof typeof preferences) => {
      const newPrefs = { ...preferences, [key]: !preferences[key] };
      setPreferences(newPrefs);
      try {
         await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ preferences: newPrefs })
         });
      } catch {
         toast.error("Failed to sync preference");
      }
   };

   if (loading) {
      return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-slate-600 rounded-full border-t-transparent animate-spin" /></div>;
   }

   return (
      <div className="animate-fade-in max-w-[800px] pb-20">
         <div className="mb-8">
            <h1 className="text-[28px] font-bold tracking-tight text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>Settings</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your account and preferences.</p>
         </div>

         <div className="space-y-8">
            {/* PROFILE CARD */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
               <div className="border-b border-border px-6 py-4 flex items-center gap-2">
                  <User className="w-[18px] h-[18px] text-muted-foreground" />
                  <h2 className="font-bold text-[15px]">Profile</h2>
               </div>
               <div className="p-6">
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                     <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground/90">Full Name</label>
                        <input 
                           type="text" 
                           value={profile.name}
                           onChange={e => setProfile({...profile, name: e.target.value})}
                           className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground/90">Email</label>
                        <input 
                           type="email" 
                           value={profile.email}
                           onChange={e => setProfile({...profile, email: e.target.value})}
                           className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                        />
                     </div>
                     <button type="submit" disabled={saving} className="bg-[#475569] hover:bg-[#334155] text-white font-medium px-5 py-2.5 rounded-lg shadow-sm text-sm transition-colors mt-2">
                        Save Changes
                     </button>
                  </form>
               </div>
            </div>

            {/* PREFERENCES CARD */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
               <div className="border-b border-border px-6 py-4 flex items-center gap-2">
                  <Bell className="w-[18px] h-[18px] text-muted-foreground" />
                  <h2 className="font-bold text-[15px]">Reminder Preferences</h2>
               </div>
               <div className="p-6 space-y-6">
                  {/* Toggle Item */}
                  <div className="flex items-center justify-between gap-4">
                     <div>
                        <h4 className="text-[15px] font-semibold text-foreground/90">Payment reminders</h4>
                        <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Get notified about upcoming and overdue payments</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={preferences.paymentReminders} onChange={() => togglePreference("paymentReminders")} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#475569]"></div>
                     </label>
                  </div>
                  {/* Toggle Item */}
                  <div className="flex items-center justify-between gap-4">
                     <div>
                        <h4 className="text-[15px] font-semibold text-foreground/90">Email Deadline reminders</h4>
                        <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Get notified about approaching deadlines via email</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={preferences.deadlineReminders} onChange={() => togglePreference("deadlineReminders")} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#475569]"></div>
                     </label>
                  </div>
                  {/* Toggle Item */}
                  <div className="flex items-center justify-between gap-4">
                     <div>
                        <h4 className="text-[15px] font-semibold text-foreground/90">Email notifications</h4>
                        <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Receive notifications via email</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={preferences.emailNotifications} onChange={() => togglePreference("emailNotifications")} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#475569]"></div>
                     </label>
                  </div>
               </div>
            </div>

            {/* SECURITY CARD */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
               <div className="border-b border-border px-6 py-4 flex items-center gap-2">
                  <Shield className="w-[18px] h-[18px] text-muted-foreground" />
                  <h2 className="font-bold text-[15px]">Security</h2>
               </div>
               <div className="p-6">
                  <form onSubmit={handleSaveSecurity} className="space-y-5">
                     <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground/90">Current Password</label>
                        <input 
                           type="password" 
                           placeholder="••••••••"
                           value={security.currentPassword}
                           onChange={e => setSecurity({...security, currentPassword: e.target.value})}
                           className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground/90">New Password</label>
                        <input 
                           type="password" 
                           placeholder="••••••••"
                           value={security.newPassword}
                           onChange={e => setSecurity({...security, newPassword: e.target.value})}
                           className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                        />
                     </div>
                     <button type="submit" disabled={saving || !security.currentPassword || !security.newPassword} className="bg-[#475569] hover:bg-[#334155] text-white font-medium px-5 py-2.5 rounded-lg shadow-sm text-sm transition-colors mt-2 disabled:opacity-50">
                        Update Password
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
}

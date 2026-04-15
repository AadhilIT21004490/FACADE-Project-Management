"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn, ArrowRight, Activity, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex flex-col justify-center items-center p-4">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[128px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[128px] animate-pulse-slow max-md:hidden" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,var(--background)_100%)] pointer-events-none"></div>

      {/* Main Login Container */}
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Facade</h1>
          <p className="text-muted-foreground">Sign in to your intelligent workspace.</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient border inside */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="relative space-y-6 z-10">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/90 ml-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground text-foreground"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-foreground/90">Password</label>
                  <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground text-foreground"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Need access? <a href="#" className="text-primary hover:underline transition-all">Contact Administrator</a>
        </p>
      </div>
    </div>
  );
}
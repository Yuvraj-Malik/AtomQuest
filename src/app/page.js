"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast.error("User profile not found. Please contact an admin.");
        setIsLoading(false);
        return;
      }

      router.push(`/${profile.role}/dashboard`);
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] relative overflow-hidden">
      {/* Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 600px 400px at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)'
        }}
      />

      {/* Top Bar */}
      <div className="h-[52px] border-b border-[#1e1e1e] flex items-center justify-between px-8 bg-[#0a0a0a] z-10">
        <div className="flex items-center gap-3">
          <div className="w-[26px] h-[26px] rounded-[6px] bg-accent-gradient flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 12l10 10 10-10Z" />
            </svg>
          </div>
          <span className="text-[14px] font-medium text-white">AtomQuest</span>
        </div>
        <span className="text-[12px] text-[#555] font-medium">Atomberg Technologies · Internal Portal</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-[380px] bg-[#111] border border-[#1e1e1e] rounded-[16px] p-[36px] pt-[36px] pb-[28px] shadow-2xl">
          {/* Logo Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-[40px] h-[40px] rounded-[8px] bg-accent-gradient flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 12l10 10 10-10Z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-[18px] font-medium text-white mb-2">Welcome back</h1>
            <p className="text-[13px] text-[#555]">Sign in to your AtomQuest account</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="input-label">Email address</label>
              <input
                type="email"
                placeholder="name@atomberg.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="enterprise-input"
                required
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="enterprise-input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="enterprise-btn w-full justify-center h-[42px] mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-8">
            <div className="h-[0.5px] flex-1 bg-[#1e1e1e]" />
            <span className="text-[11px] text-[#444] font-medium uppercase tracking-wider">or jump in as</span>
            <div className="h-[0.5px] flex-1 bg-[#1e1e1e]" />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => { setEmail('employee@demo.com'); setPassword('employee@123'); }}
              className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border border-[#1e1e1e] hover:bg-[#1a1a1a] transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center text-[#6366f1]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span className="text-[11px] font-medium text-[#6366f1]">Employee</span>
            </button>
            <button 
              onClick={() => { setEmail('manager@demo.com'); setPassword('manager@123'); }}
              className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border border-[#1e1e1e] hover:bg-[#1a1a1a] transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-[#1a120a] flex items-center justify-center text-[#f59e0b]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M18 7a4 4 0 0 0-3-3.87"/></svg>
              </div>
              <span className="text-[11px] font-medium text-[#f59e0b]">Manager</span>
            </button>
            <button 
              onClick={() => { setEmail('admin@demo.com'); setPassword('admin@123'); }}
              className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border border-[#1e1e1e] hover:bg-[#1a1a1a] transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-[#0f1a0f] flex items-center justify-center text-[#34d399]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span className="text-[11px] font-medium text-[#34d399]">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

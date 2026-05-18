"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { supabase } from "@/lib/supabase";

export default function ManagerLayout({ children }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const getUser = async () => {
    try {
      // Priority 1: email stored during login (works for real Gmail accounts too)
      const storedEmail = sessionStorage.getItem('aq_user_email');

      if (storedEmail) {
        const res = await fetch(`/api/profiles?email=${encodeURIComponent(storedEmail)}`);
        if (res.ok) {
          const profile = await res.json();
          if (profile && profile.role === 'manager') { setUser(profile); return; }
        }
      }

      // Priority 2: Supabase auth email
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) {
        const byEmail = await fetch(`/api/profiles?email=${encodeURIComponent(authUser.email)}`);
        if (byEmail.ok) {
          const profile = await byEmail.json();
          if (profile && profile.role === 'manager') { setUser(profile); return; }
        }
      }

      // Priority 3: Supabase auth id
      if (authUser?.id) {
        const byId = await fetch(`/api/profiles?id=${authUser.id}`);
        if (byId.ok) {
          const profile = await byId.json();
          if (profile && profile.role === 'manager') { setUser(profile); return; }
        }
      }

      // Final fallback: first manager in the dataset
      const all = await fetch(`/api/profiles?all=true`);
      if (all.ok) {
        const profiles = await all.json();
        const manager = (profiles || []).find(p => p.role === 'manager') || profiles[0] || null;
        setUser(manager);
      }
    } catch (err) {
      console.error("Layout load user error:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    getUser();
  }, []);

  if (!mounted) return null;

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SM';

  return (
    <div className="main-layout">
      <Sidebar 
        role="manager" 
        user={user}
        userName={user?.name || 'Manager'} 
        userInitials={userInitials}
        refreshProfile={getUser}
      />
      <div className="content-area">
        {children}
      </div>
    </div>
  );
}

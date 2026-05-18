"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }) {
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
          if (profile && profile.role === 'admin') { setUser(profile); return; }
        }
      }

      // Priority 2: Supabase auth email
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) {
        const res = await fetch(`/api/profiles?email=${encodeURIComponent(authUser.email)}`);
        if (res.ok) {
          const profile = await res.json();
          if (profile && profile.role === 'admin') { setUser(profile); return; }
        }
      }

      // Priority 3: Supabase auth id
      if (authUser?.id) {
        const res = await fetch(`/api/profiles?id=${authUser.id}`);
        if (res.ok) {
          const profile = await res.json();
          if (profile && profile.role === 'admin') { setUser(profile); return; }
        }
      }

      // Final fallback: first admin in the dataset
      const allRes = await fetch(`/api/profiles?all=true`);
      if (allRes.ok) {
        const profiles = await allRes.json();
        const admin = (profiles || []).find(p => p.role === 'admin') || profiles[0] || null;
        setUser(admin);
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

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SA';

  return (
    <div className="main-layout">
      <Sidebar 
        role="admin" 
        user={user}
        userName={user?.name || 'System Admin'} 
        userInitials={userInitials}
        refreshProfile={getUser}
      />
      <div className="content-area">
        {children}
      </div>
    </div>
  );
}

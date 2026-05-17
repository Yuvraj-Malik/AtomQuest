"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        setUser(profile);
      }
    };
    getUser();
  }, []);

  if (!mounted) return null;

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  return (
    <div className="main-layout">
      <Sidebar 
        role="admin" 
        userName={user?.name || 'Admin'} 
        userInitials={userInitials}
      />
      <div className="content-area">
        {children}
      </div>
    </div>
  );
}

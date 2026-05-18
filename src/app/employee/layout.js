"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { supabase } from "@/lib/supabase";

export default function EmployeeLayout({ children }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const getUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const email = authUser?.email || 'aryan@demo.com';
      const res = await fetch(`/api/profiles?email=${email}`);
      if (res.ok) {
        const profile = await res.json();
        setUser(profile);
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

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'EM';

  return (
    <div className="main-layout">
      <Sidebar 
        role="employee" 
        user={user}
        userName={user?.name || 'Employee'} 
        userInitials={userInitials}
        refreshProfile={getUser}
      />
      <div className="content-area">
        {children}
      </div>
    </div>
  );
}

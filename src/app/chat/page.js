"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [mounted, setMounted] = useState(false);

  const getUser = async () => {
    try {
      const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('aq_user_email') : null;

      if (storedEmail) {
        const res = await fetch(`/api/profiles?email=${encodeURIComponent(storedEmail)}`);
        if (res.ok) {
          const profile = await res.json();
          if (profile) {
            setUser(profile);
            setRole(profile.role);
            return;
          }
        }
      }

      // fallback: fetch first available profile
      const allRes = await fetch(`/api/profiles?all=true`);
      if (allRes.ok) {
        const profiles = await allRes.json();
        const profile = (profiles || []).find(p => p.role === 'employee') || (profiles && profiles[0]) || null;
        setUser(profile);
        setRole(profile ? profile.role : 'employee');
      }
    } catch (err) {
      console.error("Chat page load user error:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    getUser();
  }, []);

  if (!mounted) return null;

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'US';

  return (
    <div className="main-layout" style={{ background: 'var(--bg)' }}>
      <Sidebar 
        role={role || 'employee'} 
        user={user}
        userName={user?.name || 'User'} 
        userInitials={userInitials}
        refreshProfile={getUser}
      />
      <div className="content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <ChatWindow />
      </div>
    </div>
  );
}

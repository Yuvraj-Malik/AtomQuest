"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LandingPage from "@/components/LandingPage";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = async (email, password) => {
    setIsLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Robust profile lookup: prefer email-based lookup (seeded profiles use demo emails),
      // then fallback to matching Supabase user id.
      let profile = null;
      let profileError = null;

      if (email) {
        const byEmail = await supabase
          .from('profiles')
          .select('role')
          .eq('email', email)
          .maybeSingle();
        profile = byEmail.data;
        profileError = byEmail.error;
      }

      if (!profile && user?.id) {
        const byId = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        profile = byId.data;
        profileError = byId.error;
      }

      if (profileError) throw profileError;

      if (!profile) {
        toast.error('User profile not found. Please contact an admin.');
        setIsLoading(false);
        return;
      }

      // Store current session identity so layouts can read the right profile
      sessionStorage.setItem('aq_user_email', email);
      sessionStorage.setItem('aq_user_role', profile.role);

      router.push(`/${profile.role}/dashboard`);
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <LandingPage
      isLoading={isLoading}
      onLogin={({ email, password }) => {
        handleAuth(email, password);
      }}
      onDemoLogin={(role) => {
        const creds = {
          employee: { email: 'employee@demo.com', password: 'employee@123' },
          manager:  { email: 'manager@demo.com',  password: 'manager@123' },
          admin:    { email: 'admin@demo.com',     password: 'admin@123' },
        };
        handleAuth(creds[role].email, creds[role].password);
      }}
    />
  );
}

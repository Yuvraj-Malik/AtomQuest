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

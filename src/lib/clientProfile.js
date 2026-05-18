import { supabase } from '@/lib/supabase';

export async function getCurrentProfile() {
  const storedEmail = typeof window !== 'undefined'
    ? sessionStorage.getItem('aq_user_email')
    : null;

  async function byEmail(email) {
    if (!email) return null;
    const res = await fetch(`/api/profiles?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  }

  let profile = await byEmail(storedEmail);
  if (profile) return profile;

  const { data: { user } } = await supabase.auth.getUser();
  profile = await byEmail(user?.email);
  if (profile) return profile;

  if (user?.id) {
    const byId = await fetch(`/api/profiles?id=${encodeURIComponent(user.id)}`, { cache: 'no-store' });
    if (byId.ok) {
      const byIdProfile = await byId.json();
      if (byIdProfile) return byIdProfile;
    }
  }

  return null;
}

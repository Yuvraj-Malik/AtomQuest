export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getProfiles, getProfileByEmail, getProfileById, updateProfile, addAuditLog } from '@/lib/backendDb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      return NextResponse.json(getProfiles());
    }

    if (email) {
      const profile = getProfileByEmail(email);
      if (profile) return NextResponse.json(profile);
    }

    if (id) {
      const profile = getProfileById(id);
      if (profile) return NextResponse.json(profile);
    }

    // Default session fallback: first admin
    const profiles = getProfiles();
    const admin = profiles.find(p => p.role === 'admin') || profiles[0];
    return NextResponse.json(admin);
  } catch (error) {
    console.error("API Profiles GET error:", error);
    return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, phone, location, bio, department } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const currentProfile = getProfileById(id);
    if (!currentProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updated = updateProfile(id, { name, phone, location, bio, department });

    // Append to security audit logs
    const actionMessage = `Updated profile fields (Name: ${name}, Location: ${location}, Bio: ${bio ? (bio.substring(0, 20) + '...') : ''}) for **${currentProfile.name}**`;
    addAuditLog(currentProfile.name, actionMessage, "Modified");

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("API Profiles PUT error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getProfiles } from '@/lib/backendDb';

export async function GET() {
  try {
    const profiles = getProfiles() || [];
    return NextResponse.json({ success: true, profiles });
  } catch (err) {
    console.error('chat/profiles GET', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

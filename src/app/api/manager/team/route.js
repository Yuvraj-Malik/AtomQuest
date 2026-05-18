export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getProfiles, getGoals } from '@/lib/backendDb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json({ error: 'managerId is required' }, { status: 400 });
    }

    const profiles = getProfiles().filter(p => String(p.manager_id) === String(managerId));

    // attach goals for each member
    const members = profiles.map(p => ({ ...p, goals: getGoals(p.id) }));

    return NextResponse.json(members);
  } catch (error) {
    console.error('API Manager Team GET error:', error);
    return NextResponse.json({ error: 'Failed to load team' }, { status: 500 });
  }
}

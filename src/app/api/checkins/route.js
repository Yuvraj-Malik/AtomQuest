export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getProfiles } from '@/lib/backendDb';

export async function GET() {
  try {
    // Return dummy metrics for checkins matching the UI structure
    const profiles = getProfiles();
    const employees = profiles.filter(p => p.role === 'employee');
    
    return NextResponse.json({
      totalCount: employees.length,
      departments: [
        { name: "Product", count: 3, rate: 80 },
        { name: "Engineering", count: 4, rate: 70 }
      ]
    });
  } catch (error) {
    console.error("API Checkins GET error:", error);
    return NextResponse.json({ error: "Failed to load checkins" }, { status: 500 });
  }
}

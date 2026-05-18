export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getCycles } from '@/lib/backendDb';

export async function GET() {
  try {
    const cycles = getCycles();
    return NextResponse.json(cycles);
  } catch (error) {
    console.error("API Cycles GET error:", error);
    return NextResponse.json({ error: "Failed to load cycles" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getCycles, createCycle, updateCycle, getActiveCycle } from '@/lib/backendDb';

export async function GET() {
  try {
    const cycles = getCycles();
    return NextResponse.json(cycles);
  } catch (error) {
    console.error("API Cycles GET error:", error);
    return NextResponse.json({ error: "Failed to load cycles" }, { status: 500 });
  }
}

function buildQuarterCycle(name, startDate, endDate) {
  return {
    name,
    start_date: startDate.toISOString().slice(0, 10),
    end_date: endDate.toISOString().slice(0, 10),
    is_active: true
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const now = new Date();
    const defaultEnd = new Date(now);
    defaultEnd.setMonth(defaultEnd.getMonth() + 3);
    const cycle = createCycle({
      ...buildQuarterCycle(
        body.name || `Q${Math.floor(now.getMonth() / 3) + 1} Performance Cycle`,
        body.start_date ? new Date(body.start_date) : now,
        body.end_date ? new Date(body.end_date) : defaultEnd
      ),
      ...body,
      is_active: body.is_active !== false
    });

    return NextResponse.json({ success: true, cycle });
  } catch (error) {
    console.error('API Cycles POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create cycle' }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const { id, updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Cycle id is required' }, { status: 400 });
    }

    const nextCycle = updateCycle(id, updates || {});
    if (!nextCycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, cycle: nextCycle, activeCycle: getActiveCycle() });
  } catch (error) {
    console.error('API Cycles PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update cycle' }, { status: 400 });
  }
}

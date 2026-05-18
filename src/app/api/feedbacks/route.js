export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getFeedbacks, createFeedback, getProfileById, addAuditLog } from '@/lib/backendDb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const feedbacks = getFeedbacks(employeeId);
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('API Feedbacks GET error:', error);
    return NextResponse.json({ error: 'Failed to load feedbacks' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const fb = createFeedback(payload);

    const profile = getProfileById(fb.employee_id);
    const name = profile ? profile.name : 'Employee';
    addAuditLog(payload.from || 'Manager', `Added feedback for **${name}**`, 'Created');

    return NextResponse.json({ success: true, feedback: fb });
  } catch (error) {
    console.error('API Feedbacks POST error:', error);
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
  }
}

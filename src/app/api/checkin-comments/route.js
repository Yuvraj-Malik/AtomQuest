export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getCheckinComments, createCheckinComment, getProfileById, addAuditLog } from '@/lib/backendDb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');

    const comments = getCheckinComments(managerId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('API CheckinComments GET error:', error);
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { manager_id, employee_id, comment } = body;

    if (!manager_id || !employee_id || !comment) {
      return NextResponse.json({ error: 'manager_id, employee_id and comment are required' }, { status: 400 });
    }

    const newComment = createCheckinComment({ manager_id, employee_id, comment });

    const profile = getProfileById(employee_id);
    const employeeName = profile ? profile.name : 'Employee';
    addAuditLog('Manager', `Added check-in comment for ${employeeName}`, 'Created');

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('API CheckinComments POST error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

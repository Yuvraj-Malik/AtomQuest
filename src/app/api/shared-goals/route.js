export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { createGoal, getProfileById, addAuditLog } from '@/lib/backendDb';

export async function POST(request) {
  try {
    const { title, description, target_value, weightage, employeeIds } = await request.json();

    if (!title || !employeeIds || !Array.isArray(employeeIds)) {
      return NextResponse.json({ error: 'title and employeeIds[] required' }, { status: 400 });
    }

    const created = employeeIds.map(empId => {
      const goal = createGoal({ title, description, target_value, weightage, employee_id: empId, status: 'approved' });
      const profile = getProfileById(empId);
      const name = profile ? profile.name : empId;
      addAuditLog('Manager', `Pushed shared goal '${title}' to ${name}`, 'Created');
      return goal;
    });

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error('API Shared Goals POST error:', error);
    return NextResponse.json({ error: 'Failed to push shared goals' }, { status: 500 });
  }
}

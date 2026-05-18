export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { createGoal, getProfileById, addAuditLog } from '@/lib/backendDb';

export async function POST(request) {
  try {
    const { title, description, target_value, weightage, employeeIds } = await request.json();

    if (!title || !employeeIds || !Array.isArray(employeeIds)) {
      return NextResponse.json({ error: 'title and employeeIds[] required' }, { status: 400 });
    }

    const normalizedWeightage = Number(weightage);
    if (!Number.isFinite(normalizedWeightage) || normalizedWeightage <= 0 || normalizedWeightage > 100) {
      return NextResponse.json({ error: 'weightage must be between 1 and 100' }, { status: 400 });
    }

    const created = employeeIds.map(empId => {
      const goal = createGoal({
        title,
        description,
        target_value,
        weightage: normalizedWeightage,
        employee_id: empId,
        status: 'approved',
        is_shared: true,
        shared_goal: true,
        editable_by_recipient: false,
        shared_fields_locked: ['title', 'target_value']
      });
      const profile = getProfileById(empId);
      const name = profile ? profile.name : empId;
      addAuditLog('Manager', `Pushed shared goal '${title}' to ${name}`, 'Created');
      return goal;
    });

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error('API Shared Goals POST error:', error);
    const status = /weightage|goal sheet|cycle|maximum|minimum|active cycle/i.test(error.message || '') ? 400 : 500;
    return NextResponse.json({ error: error.message || 'Failed to push shared goals' }, { status });
  }
}

export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getCycles, getProfiles, getGoals, getCheckins, addAuditLog } from '@/lib/backendDb';
import { sendTeamsNotification } from '@/lib/teams';

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }

  return request.headers.get('x-cron-secret') === secret;
}

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeCycle = getCycles().find((cycle) => cycle.is_active) || null;
    if (!activeCycle) {
      return NextResponse.json({ ok: true, created: 0, message: 'No active cycle' });
    }

    const employees = getProfiles().filter((profile) => profile.role === 'employee');
    const created = [];

    for (const employee of employees) {
      const employeeGoals = getGoals(employee.id).filter((goal) => String(goal.cycle_id || '') === String(activeCycle.id));
      const latestCheckin = getCheckins(employee.id)
        .filter((checkin) => String(checkin.cycle_id || '') === String(activeCycle.id))
        .sort((a, b) => new Date(b.completed_at || b.created_at || 0) - new Date(a.completed_at || a.created_at || 0))[0] || null;

      if (employeeGoals.length > 0 && employeeGoals.some((goal) => String(goal.status || '').toLowerCase() !== 'approved')) {
        created.push({ employee_id: employee.id, type: 'goal_not_submitted' });
      }

      if (!latestCheckin && employeeGoals.length > 0) {
        created.push({ employee_id: employee.id, type: 'checkin_missing' });
      }
    }

    const resolved = created.map((item) => {
      const employee = employees.find((profile) => profile.id === item.employee_id);
      const employeeName = employee?.name || item.employee_id;
      addAuditLog('System', `Rule escalation processed for **${employeeName}**: ${item.type}`, 'Resolved');
      return item;
    });

    if (resolved.length > 0) {
      await sendTeamsNotification('AtomQuest escalation sweep completed', [
        { name: 'Active cycle', value: activeCycle.name },
        { name: 'Escalations created', value: String(resolved.length) }
      ]).catch(() => null);
    }

    return NextResponse.json({ ok: true, created: resolved.length, items: resolved });
  } catch (error) {
    console.error('Cron escalations error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process escalations' }, { status: 500 });
  }
}
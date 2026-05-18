export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getProfiles, getCheckins, getCycles, recordCheckin, getProfileById, addAuditLog } from '@/lib/backendDb';
import { triggerNotification } from '@/lib/notifications';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const managerId = searchParams.get('managerId');

    if (employeeId) {
      return NextResponse.json(getCheckins(employeeId));
    }

    if (managerId) {
      const items = getCheckins().filter(c => String(c.manager_id) === String(managerId));
      return NextResponse.json(items);
    }

    const profiles = getProfiles();
    const employees = profiles.filter(p => p.role === 'employee');
    const checkins = getCheckins();
    const activeCycle = getCycles().find(c => c.is_active);
    const scopedCheckins = activeCycle
      ? checkins.filter(c => c.cycle_id === activeCycle.id)
      : checkins;

    const checkedInEmployeeIds = new Set(scopedCheckins.map(c => c.employee_id));

    const byDepartment = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Other';
      if (!acc[dept]) {
        acc[dept] = { name: dept, total: 0, done: 0 };
      }
      acc[dept].total += 1;
      if (checkedInEmployeeIds.has(emp.id)) {
        acc[dept].done += 1;
      }
      return acc;
    }, {});

    const departments = Object.values(byDepartment)
      .map(d => ({
        name: d.name,
        count: d.done,
        rate: d.total ? Math.round((d.done / d.total) * 100) : 0
      }))
      .sort((a, b) => b.rate - a.rate);

    return NextResponse.json({
      totalCount: employees.length,
      completedCount: checkedInEmployeeIds.size,
      departments
    });
  } catch (error) {
    console.error("API Checkins GET error:", error);
    return NextResponse.json({ error: "Failed to load checkins" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const checkin = recordCheckin(payload);

    const profile = getProfileById(checkin.employee_id);
    const employeeName = profile ? profile.name : 'Employee';
    const managerName = payload.manager_name || 'Manager';
    addAuditLog(managerName, `Submitted quarterly check-in for **${employeeName}**`, 'Created');

    if (profile) {
      const cycleId = checkin.cycle_id || 'cycle-q1-26-27';
      const deepLink = `/employee/goals?cycleId=${cycleId}`;

      // 1. Email to Employee
      await triggerNotification({
        recipientId: profile.id,
        recipientEmail: profile.email,
        type: 'email',
        event: 'checkin_submitted',
        subject: `[Email] Quarterly Check-In Submitted: Q1 FY 2026-27`,
        body: `Hello ${employeeName},\n\nYour manager, ${managerName}, has completed and submitted your performance check-in for Q1 FY 2026-27. Your computed achievement score is ${checkin.computed_score || 0}%. Please check the action link to review detailed scores and manager remarks.`,
        deepLink
      });

      // 2. Teams to Employee
      await triggerNotification({
        recipientId: profile.id,
        recipientEmail: profile.email,
        type: 'teams',
        event: 'checkin_submitted',
        subject: `Quarterly Check-In Submitted`,
        body: `Your manager has finalized your check-in ratings:\n\n**Cycle**: Q1 FY 2026-27\n**Computed Score**: ${checkin.computed_score || 0}%\n**Manager remarks**: ${checkin.comment || 'None'}\n\nPlease click the button to inspect the goal sheet.`,
        deepLink
      });
    }

    return NextResponse.json({ success: true, checkin });
  } catch (error) {
    console.error('API Checkins POST error:', error);
    const status = /cycle|check-in|goal|employee_id|closed/i.test(error.message || '') ? 400 : 500;
    return NextResponse.json({ error: error.message || 'Failed to submit check-in' }, { status });
  }
}

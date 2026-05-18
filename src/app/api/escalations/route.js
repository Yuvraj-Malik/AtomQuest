export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getEscalations, getProfileById, resolveEscalation, addAuditLog, getGoals, getCheckins, getCycles, getProfiles } from '@/lib/backendDb';
import { sendTeamsNotification } from '@/lib/teams';

function getCurrentCycle() {
  return getCycles().find((cycle) => cycle.is_active) || null;
}

function getOverdueGoalsForEmployee(employeeId, cycleId) {
  return getGoals(employeeId).filter((goal) => String(goal.cycle_id || '') === String(cycleId) && String(goal.status || '').toLowerCase() !== 'approved');
}

function getLatestCheckin(employeeId, cycleId) {
  return getCheckins(employeeId)
    .filter((checkin) => String(checkin.cycle_id || '') === String(cycleId))
    .sort((a, b) => new Date(b.completed_at || b.created_at || 0) - new Date(a.completed_at || a.created_at || 0))[0] || null;
}

export async function GET() {
  try {
    const escalations = getEscalations();
    // Hydrate the escalations with employee profiles
    const hydrated = escalations.map(esc => {
      const profile = getProfileById(esc.employee_id);
      return {
        ...esc,
        profiles: profile ? { name: profile.name, department: profile.department } : null
      };
    });

    return NextResponse.json(hydrated);
  } catch (error) {
    console.error("API Escalations GET error:", error);
    return NextResponse.json({ error: "Failed to load escalations" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { escalationId, actionType, nudgeMessage } = await request.json();

    if (!escalationId) {
      return NextResponse.json({ error: "Escalation ID is required" }, { status: 400 });
    }

    const escalation = getEscalations().find(e => e.id === escalationId);
    if (!escalation) {
      return NextResponse.json({ error: "Escalation not found" }, { status: 404 });
    }

    const profile = getProfileById(escalation.employee_id);
    const employeeName = profile ? profile.name : "Employee";

    let auditAction = "";
    if (actionType === "nudge") {
      // Mark as resolved because they are nudged or resolved in real-time
      resolveEscalation(escalationId);
      auditAction = `Dispatched compliance nudge to **${employeeName}** for overdue ${escalation.escalation_type.replace(/_/g, ' ')}`;
      addAuditLog("Admin", auditAction, "Nudged");
      await sendTeamsNotification(`Compliance nudge sent to ${employeeName}`, [
        { name: 'Issue', value: escalation.escalation_type.replace(/_/g, ' ') },
        { name: 'Message', value: nudgeMessage || 'No custom message provided' }
      ]).catch((error) => console.warn('Teams notification skipped:', error.message));
    } else if (actionType === "override") {
      resolveEscalation(escalationId);
      auditAction = `Administratively bypassed and approved goals for **${employeeName}**`;
      addAuditLog("Admin", auditAction, "Approved");
      await sendTeamsNotification(`Admin override approved for ${employeeName}`, [
        { name: 'Escalation', value: escalation.escalation_type.replace(/_/g, ' ') }
      ]).catch((error) => console.warn('Teams notification skipped:', error.message));
    } else {
      resolveEscalation(escalationId);
      auditAction = `Resolved escalation for **${employeeName}**`;
      addAuditLog("Admin", auditAction, "Resolved");
      await sendTeamsNotification(`Escalation resolved for ${employeeName}`, [
        { name: 'Escalation', value: escalation.escalation_type.replace(/_/g, ' ') }
      ]).catch((error) => console.warn('Teams notification skipped:', error.message));
    }

    return NextResponse.json({ success: true, message: "Escalation processed successfully" });
  } catch (error) {
    console.error("API Escalations POST error:", error);
    return NextResponse.json({ error: "Failed to process escalation" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const cycle = getCurrentCycle();
    const profiles = getProfiles().filter((profile) => profile.role === 'employee');

    if (!cycle) {
      return NextResponse.json({ error: 'No active cycle found' }, { status: 400 });
    }

    const createdEscalations = [];
    const notifications = [];

    profiles.forEach((employee) => {
      const overdueGoals = getOverdueGoalsForEmployee(employee.id, cycle.id);
      const latestCheckin = getLatestCheckin(employee.id, cycle.id);

      if (overdueGoals.length > 0) {
        const goalSheet = overdueGoals.length;
        createdEscalations.push({ employee: employee.name, type: 'goal_not_submitted', goals: goalSheet });
        notifications.push(sendTeamsNotification(`Escalation raised for ${employee.name}`, [
          { name: 'Issue', value: 'Goal sheet not submitted' },
          { name: 'Open goals', value: String(goalSheet) },
          { name: 'Cycle', value: cycle.name }
        ]).catch((error) => ({ skipped: true, error: error.message })));
      }

      if (!latestCheckin) {
        createdEscalations.push({ employee: employee.name, type: 'checkin_missing', goals: 0 });
        notifications.push(sendTeamsNotification(`Check-in missing for ${employee.name}`, [
          { name: 'Issue', value: 'No quarterly check-in submitted' },
          { name: 'Cycle', value: cycle.name }
        ]).catch((error) => ({ skipped: true, error: error.message })));
      }
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true, createdEscalations, cycle: cycle.name, note: body.note || null });
  } catch (error) {
    console.error('API Escalations PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to run escalation processor' }, { status: 500 });
  }
}

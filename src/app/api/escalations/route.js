export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getEscalations, getProfileById, resolveEscalation, addAuditLog } from '@/lib/backendDb';

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
    } else if (actionType === "override") {
      resolveEscalation(escalationId);
      auditAction = `Administratively bypassed and approved goals for **${employeeName}**`;
      addAuditLog("Admin", auditAction, "Approved");
    } else {
      resolveEscalation(escalationId);
      auditAction = `Resolved escalation for **${employeeName}**`;
      addAuditLog("Admin", auditAction, "Resolved");
    }

    return NextResponse.json({ success: true, message: "Escalation processed successfully" });
  } catch (error) {
    console.error("API Escalations POST error:", error);
    return NextResponse.json({ error: "Failed to process escalation" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getEscalationRules, updateEscalationRules, getEscalations } from '@/lib/backendDb';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rules = getEscalationRules();
    return NextResponse.json(rules);
  } catch (error) {
    console.error("API Escalation Rules GET error:", error);
    return NextResponse.json({ error: "Failed to load escalation rules" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Parse values to integers
    const updates = {
      goal_submission_days: parseInt(body.goal_submission_days) || 10,
      manager_approval_days: parseInt(body.manager_approval_days) || 7,
      checkin_completion_days: parseInt(body.checkin_completion_days) || 15,
      chain_intervals_days: parseInt(body.chain_intervals_days) || 5,
    };

    const rules = updateEscalationRules(updates);
    
    // Trigger immediate compliance sweep!
    getEscalations(); 

    return NextResponse.json({ success: true, rules });
  } catch (error) {
    console.error("API Escalation Rules PUT error:", error);
    return NextResponse.json({ error: "Failed to save escalation rules" }, { status: 500 });
  }
}

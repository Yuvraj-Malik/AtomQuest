export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getGoals, createGoal, updateGoal, getProfileById, addAuditLog } from '@/lib/backendDb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const goals = getGoals(employeeId);
    return NextResponse.json(goals);
  } catch (error) {
    console.error("API Goals GET error:", error);
    return NextResponse.json({ error: "Failed to load goals" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const goalData = await request.json();
    const newGoal = createGoal(goalData);

    const profile = getProfileById(newGoal.employee_id);
    const employeeName = profile ? profile.name : "Employee";

    addAuditLog(employeeName, `Created goal: **${newGoal.title}** (Weightage: ${newGoal.weightage}%)`, "Created");

    return NextResponse.json({ success: true, goal: newGoal });
  } catch (error) {
    console.error("API Goals POST error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }

    const currentGoal = getGoals().find(g => g.id === id);
    if (!currentGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const updated = updateGoal(id, updates);
    const profile = getProfileById(updated.employee_id);
    const employeeName = profile ? profile.name : "Employee";

    if (updates.status === "approved") {
      addAuditLog("Manager", `Approved goal for **${employeeName}**: **${updated.title}**`, "Approved");
    } else if (updates.status === "draft") {
      addAuditLog("Admin", `Unlocked goal sheet for **${employeeName}**: **${updated.title}**`, "Unlocked");
    } else {
      addAuditLog(employeeName, `Updated goal: **${updated.title}**`, "Modified");
    }

    return NextResponse.json({ success: true, goal: updated });
  } catch (error) {
    console.error("API Goals PUT error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

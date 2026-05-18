export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getGoals, createGoal, updateGoal, getProfileById, addAuditLog } from '@/lib/backendDb';
import { triggerNotification } from '@/lib/notifications';

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

    // Retrieve manager information
    const managerProfile = profile?.manager_id ? getProfileById(profile.manager_id) : null;

    if (newGoal.status === 'submitted' && managerProfile) {
      const cycleId = newGoal.cycle_id || 'cycle-q1-26-27';
      const deepLink = `/manager/team/${profile.id}?cycleId=${cycleId}`;

      // 1. Email Notification to Manager
      await triggerNotification({
        recipientId: managerProfile.id,
        recipientEmail: managerProfile.email,
        type: 'email',
        event: 'goal_submitted',
        subject: `[Email] Performance Goal Submission: ${employeeName}`,
        body: `${employeeName} has created and submitted a new performance goal: "${newGoal.title}" (Weightage: ${newGoal.weightage}%). Please click the action link to review.`,
        deepLink
      });

      // 2. Teams Bot Card to Manager
      await triggerNotification({
        recipientId: managerProfile.id,
        recipientEmail: managerProfile.email,
        type: 'teams',
        event: 'goal_submitted',
        subject: `Performance Goal Submitted by ${employeeName}`,
        body: `A new goal has been submitted for your review:\n\n**Goal**: ${newGoal.title}\n**Weightage**: ${newGoal.weightage}%\n\nAction required: Review and sign-off on the performance sheet.`,
        deepLink
      });
    }

    return NextResponse.json({ success: true, goal: newGoal });
  } catch (error) {
    console.error("API Goals POST error:", error);
    const status = /weightage|goal sheet|cycle|maximum|minimum|active cycle/i.test(error.message || '') ? 400 : 500;
    return NextResponse.json({ error: error.message || "Failed to create goal" }, { status });
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

    const managerProfile = profile?.manager_id ? getProfileById(profile.manager_id) : null;
    const cycleId = updated.cycle_id || 'cycle-q1-26-27';

    if (updates.status === "approved") {
      addAuditLog("Manager", `Approved goal for **${employeeName}**: **${updated.title}**`, "Approved");

      if (profile) {
        const deepLink = `/employee/goals?cycleId=${cycleId}`;

        // 1. Email to Employee
        await triggerNotification({
          recipientId: profile.id,
          recipientEmail: profile.email,
          type: 'email',
          event: 'goal_approved',
          subject: `[Email] Performance Goal Approved: ${updated.title}`,
          body: `Congratulations, your goal "${updated.title}" (Weightage: ${updated.weightage}%) has been reviewed and approved by your manager, ${managerProfile?.name || 'Rahul Sharma'}. It is now locked for execution.`,
          deepLink
        });

        // 2. Teams to Employee
        await triggerNotification({
          recipientId: profile.id,
          recipientEmail: profile.email,
          type: 'teams',
          event: 'goal_approved',
          subject: `Performance Goal Approved`,
          body: `Your manager approved your goal:\n\n**Goal**: ${updated.title}\n**Weightage**: ${updated.weightage}%\n\nThe goal is now locked for this cycle.`,
          deepLink
        });
      }
    } else if (updates.status === "returned") {
      addAuditLog("Manager", `Returned goals to **${employeeName}** due to invalid weightage split`, "Returned");

      if (profile) {
        const deepLink = `/employee/goals?cycleId=${cycleId}`;

        // 1. Email to Employee
        await triggerNotification({
          recipientId: profile.id,
          recipientEmail: profile.email,
          type: 'email',
          event: 'goal_returned',
          subject: `[Email] Performance Goal Returned for Edits: ${updated.title}`,
          body: `Your manager, ${managerProfile?.name || 'Rahul Sharma'}, has returned your goal "${updated.title}" for correction. Please click the action link to modify it.`,
          deepLink
        });

        // 2. Teams to Employee
        await triggerNotification({
          recipientId: profile.id,
          recipientEmail: profile.email,
          type: 'teams',
          event: 'goal_returned',
          subject: `Goal Returned for Correction`,
          body: `Your manager returned the goal "${updated.title}" for edits.\n\nPlease check comments and re-submit.`,
          deepLink
        });
      }
    } else if (updates.status === "submitted") {
      addAuditLog(employeeName, `Submitted goal sheet: **${updated.title}**`, "Modified");

      if (managerProfile) {
        const deepLink = `/manager/team/${profile.id}?cycleId=${cycleId}`;

        // 1. Email to Manager
        await triggerNotification({
          recipientId: managerProfile.id,
          recipientEmail: managerProfile.email,
          type: 'email',
          event: 'goal_submitted',
          subject: `[Email] Goal Resubmitted: ${employeeName}`,
          body: `${employeeName} has modified and resubmitted their goal sheet: "${updated.title}" (Weightage: ${updated.weightage}%). Please click the action link to review.`,
          deepLink
        });

        // 2. Teams to Manager
        await triggerNotification({
          recipientId: managerProfile.id,
          recipientEmail: managerProfile.email,
          type: 'teams',
          event: 'goal_submitted',
          subject: `Goal Resubmitted by ${employeeName}`,
          body: `An updated goal has been submitted for review:\n\n**Goal**: ${updated.title}\n**Weightage**: ${updated.weightage}%\n\nPlease review and approve.`,
          deepLink
        });
      }
    } else if (updates.status === "draft") {
      addAuditLog("Admin", `Unlocked goal sheet for **${employeeName}**: **${updated.title}**`, "Unlocked");
    } else {
      addAuditLog(employeeName, `Updated goal: **${updated.title}**`, "Modified");
    }

    return NextResponse.json({ success: true, goal: updated });
  } catch (error) {
    console.error("API Goals PUT error:", error);
    const status = /weightage|goal sheet|cycle|maximum|minimum|active cycle/i.test(error.message || '') ? 400 : 500;
    return NextResponse.json({ error: error.message || "Failed to update goal" }, { status });
  }
}

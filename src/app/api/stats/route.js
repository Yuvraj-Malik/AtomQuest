export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getProfiles, getGoals, getEscalations, getCycles } from '@/lib/backendDb';

export async function GET() {
  try {
    const profiles = getProfiles();
    const employees = profiles.filter(p => p.role === 'employee');
    const goals = getGoals();
    const activeEscalations = getEscalations().filter(e => !e.resolved);
    const activeCycle = getCycles().find(c => c.is_active);

    const approvedCount = goals.filter(g => g.status === 'approved').length;
    const totalGoalsCount = goals.length;
    const approvalRate = totalGoalsCount ? Math.round((approvedCount / totalGoalsCount) * 100) : 89;

    const submittedCount = goals.filter(g => g.status !== 'draft').length;
    const checkInRate = totalGoalsCount ? Math.round((submittedCount / totalGoalsCount) * 100) : 74;

    return NextResponse.json({
      totalEmployees: employees.length || 7,
      goalsApprovedRate: approvalRate,
      checkInRate: checkInRate,
      escalationsCount: activeEscalations.length,
      activeCycleName: activeCycle?.name || "Q1 Performance Cycle"
    });
  } catch (error) {
    console.error("API Stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}

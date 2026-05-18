export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getProfiles, getCheckins, getCycles } from '@/lib/backendDb';

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

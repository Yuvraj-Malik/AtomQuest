export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { getAuditLogs, getCycles, getGoals, getProfiles, getCheckins, getEscalations } from '@/lib/backendDb';

function getDirectReportIds(managerId, profiles) {
  if (!managerId) {
    return null;
  }

  return new Set(
    (profiles || [])
      .filter((profile) => String(profile.manager_id || '') === String(managerId))
      .map((profile) => profile.id)
  );
}

function toRows(report) {
  const profiles = getProfiles();
  const goals = getGoals();
  const auditLogs = getAuditLogs();
  const checkins = getCheckins();
  const escalations = getEscalations();
  const cycles = getCycles();
  const directReportIds = getDirectReportIds(report.managerId, profiles);
  const filterByManager = (items, key = 'employee_id') => {
    if (!directReportIds) {
      return items;
    }

    return items.filter((item) => directReportIds.has(String(item[key])));
  };

  switch (report.type) {
    case 'audit':
      return auditLogs.map((log) => ({
        id: log.id,
        time: log.time,
        actor: log.actor,
        action: log.action,
        status: log.status
      }));
    case 'performance':
      return goals.map((goal) => ({
        id: goal.id,
        employee_id: goal.employee_id,
        title: goal.title,
        status: goal.status,
        cycle_id: goal.cycle_id || '',
        weightage: goal.weightage,
        computed_score: goal.achievements?.[0]?.computed_score ?? ''
      })).filter((row) => !directReportIds || directReportIds.has(String(row.employee_id)));
    case 'compliance':
      return filterByManager(escalations).map((esc) => ({
        id: esc.id,
        employee_id: esc.employee_id,
        escalation_type: esc.escalation_type,
        days_overdue: esc.days_overdue ?? '',
        resolved: esc.resolved ? 'yes' : 'no'
      }));
    case 'org':
      return profiles.filter((profile) => !directReportIds || directReportIds.has(String(profile.id))).map((profile) => ({
        id: profile.id,
        name: profile.name,
        role: profile.role,
        department: profile.department || '',
        designation: profile.designation || '',
        location: profile.location || ''
      }));
    case 'checkins':
      return filterByManager(checkins).map((checkin) => ({
        id: checkin.id,
        employee_id: checkin.employee_id,
        manager_id: checkin.manager_id || '',
        cycle_id: checkin.cycle_id || '',
        quarter: checkin.quarter || '',
        computed_score: checkin.computed_score ?? '',
        completed_at: checkin.completed_at || ''
      }));
    case 'cycles':
      return cycles.map((cycle) => ({
        id: cycle.id,
        name: cycle.name,
        start_date: cycle.start_date || '',
        end_date: cycle.end_date || '',
        is_active: cycle.is_active ? 'yes' : 'no'
      }));
    default:
      return goals.map((goal) => ({
        id: goal.id,
        employee_id: goal.employee_id,
        title: goal.title,
        status: goal.status,
        weightage: goal.weightage
      }));
  }
}

function toXlsHtml(report, rows) {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const cells = rows.map((row) => `<tr>${headers.map((header) => `<td>${String(row[header] ?? '').replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]))}</td>`).join('')}</tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead><tbody>${cells}</tbody></table></body></html>`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const report = {
      type: searchParams.get('report') || 'performance',
      managerId: searchParams.get('managerId') || null
    };
    const format = String(searchParams.get('format') || 'csv').toLowerCase();
    const rows = toRows(report);

    if (format === 'xls' || format === 'excel') {
      const html = toXlsHtml(report, rows);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': `attachment; filename="${report.type}-report.xls"`
        }
      });
    }

    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${report.type}-report.csv"`
      }
    });
  } catch (error) {
    console.error('API Reports Export GET error:', error);
    return NextResponse.json({ error: 'Failed to export report' }, { status: 500 });
  }
}
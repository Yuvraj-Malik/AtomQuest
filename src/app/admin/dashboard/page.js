"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { 
  Users, 
  CheckCircle2, 
  Activity, 
  AlertTriangle,
  History,
  Send,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 7,
    goalsApprovedRate: 89,
    checkInRate: 74,
    escalationsCount: 2,
    activeCycleName: "Q1 Performance Cycle"
  });
  const [escalations, setEscalations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [checkinDepartments, setCheckinDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboardData() {
    try {
      // 1. Fetch live stats
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch live escalations
      const escRes = await fetch('/api/escalations');
      if (escRes.ok) {
        const escData = await escRes.json();
        setEscalations(escData.filter(e => !e.resolved));
      }

      // 3. Fetch security audit logs
      const auditRes = await fetch('/api/audit-logs');
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData);
      }

      // 4. Fetch check-in summary by department
      const checkinsRes = await fetch('/api/checkins');
      if (checkinsRes.ok) {
        const checkinsData = await checkinsRes.json();
        setCheckinDepartments(checkinsData.departments || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleNudgeReminder = async (escId, name) => {
    try {
      const res = await fetch('/api/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escalationId: escId,
          actionType: 'nudge',
          nudgeMessage: `Hi ${name}, please finalize your Q1 goals sheet and submit today.`
        })
      });

      if (res.ok) {
        toast.success(`Reminder nudge dispatched to ${name}!`);
        await loadDashboardData();
      } else {
        toast.error("Failed to dispatch nudge.");
      }
    } catch (err) {
      console.error("Dashboard nudge error:", err);
    }
  };

  const handleBypassApproval = async (escId, name) => {
    try {
      const res = await fetch('/api/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escalationId: escId,
          actionType: 'override'
        })
      });

      if (res.ok) {
        toast.success(`Administratively bypassed and approved goals for ${name}!`);
        await loadDashboardData();
      } else {
        toast.error("Failed to approve goals.");
      }
    } catch (err) {
      console.error("Dashboard override error:", err);
    }
  };

  return (
    <>
      <TopBar 
        title="Admin dashboard" 
        subtitle={`${stats.activeCycleName} · ${stats.totalEmployees} employees active`} 
        primaryAction={{ label: "Export report", onClick: () => toast.success("Exporting full achievement report...") }}
      />
      
      <main className="content">
        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
              <Users size={13} />
            </div>
            <div className="stat-val">{stats.totalEmployees}</div>
            <div className="stat-label">Total employees</div>
            <div className="stat-delta" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
              10 profiles seeded
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
              <CheckCircle2 size={13} />
            </div>
            <div className="stat-val">{stats.goalsApprovedRate}%</div>
            <div className="stat-label">Goals approved</div>
            <div className="stat-delta" style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>
              Live backend sync
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
              <Activity size={13} />
            </div>
            <div className="stat-val">{stats.checkInRate}%</div>
            <div className="stat-label">Q1 check-in rate</div>
            <div className="stat-delta" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
              Live rate sync
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
              <AlertTriangle size={13} />
            </div>
            <div className="stat-val">{stats.escalationsCount}</div>
            <div className="stat-label">Escalations open</div>
            <div className="stat-delta" style={{ background: stats.escalationsCount > 0 ? 'var(--red-bg)' : 'var(--green-bg)', color: stats.escalationsCount > 0 ? 'var(--red)' : 'var(--green)' }}>
              {stats.escalationsCount > 0 ? "Needs attention" : "All cleared"}
            </div>
          </div>
        </div>

        <div className="grid-2 mb-4">
          {/* Dept Heatmap */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Q1 check-in · by department</div>
            </div>
            <div className="ckin-grid">
              {checkinDepartments.length === 0 ? (
                <div className="text-[12.5px] text-[var(--text3)] p-3">No check-in department data available.</div>
              ) : (
                checkinDepartments.map((dept) => {
                  let color = 'var(--red)';
                  if (dept.rate >= 85) color = 'var(--green)';
                  else if (dept.rate >= 70) color = 'var(--accent)';
                  else if (dept.rate >= 50) color = 'var(--amber)';
                  else if (dept.rate >= 35) color = 'var(--blue)';

                  return (
                    <DeptCard key={dept.name} name={dept.name} val={dept.rate} color={color} />
                  );
                })
              )}
            </div>
          </div>

          {/* Escalation Queue */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Escalation queue</div>
              <span className="badge badge-red">{stats.escalationsCount} open</span>
            </div>
            <div className="p-[14px_20px] flex flex-col gap-[10px] max-h-[260px] overflow-y-auto">
              {escalations.length === 0 ? (
                <div className="text-center py-12 text-[var(--text3)] text-[12.5px] italic">
                  All compliance objectives met. No active escalations!
                </div>
              ) : (
                escalations.map((esc) => (
                  <div key={esc.id} className={cn(
                    "esc-item p-3 border rounded-lg",
                    esc.escalation_type === 'goal_not_submitted' 
                      ? "border-[rgba(224,92,92,0.2)] bg-[var(--red-bg)]" 
                      : "border-[rgba(232,168,58,0.2)] bg-[var(--amber-bg)]"
                  )}>
                    <div className={cn(
                      "text-[12px] font-semibold mb-[3px] capitalize",
                      esc.escalation_type === 'goal_not_submitted' ? "text-[var(--red)]" : "text-[var(--amber)]"
                    )}>
                      {esc.escalation_type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[11.5px] text-[var(--text2)]">
                      {esc.profiles?.name} · {esc.days_overdue} days overdue · {esc.profiles?.department}
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <button 
                        onClick={() => handleNudgeReminder(esc.id, esc.profiles?.name)}
                        className="enterprise-btn-secondary px-2.5 py-1 text-[11px] font-medium rounded flex items-center gap-1 hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
                      >
                        <Send className="w-3 h-3" /> Nudge
                      </button>
                      <button 
                        onClick={() => handleBypassApproval(esc.id, esc.profiles?.name)}
                        className="enterprise-btn-secondary px-2.5 py-1 text-[11px] font-medium rounded flex items-center gap-1 hover:border-[var(--blue)] hover:text-[var(--blue)] transition"
                      >
                        <UserCheck className="w-3 h-3" /> Bypass
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Audit trail</div>
            <div className="flex gap-2">
              <button className="tb-btn tb-btn-ghost text-[11.5px] px-3 py-1" onClick={() => toast.success('Exporting audit log as CSV...')}>Export CSV</button>
              <button className="tb-btn tb-btn-ghost text-[11.5px] px-3 py-1" onClick={() => toast.success('Exporting achievement report...')}>Achievement report</button>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-[var(--text3)] italic text-[12.5px]">
                No logged operations in this cycle.
              </div>
            ) : (
              auditLogs.map((log) => (
                <AuditRow 
                  key={log.id}
                  time={log.time} 
                  actor={log.actor} 
                  actorColor={log.status === 'Approved' ? 'var(--blue)' : log.status === 'Modified' ? 'var(--amber)' : log.status === 'Nudged' ? 'var(--accent)' : 'var(--text2)'} 
                  action={<span dangerouslySetInnerHTML={{ __html: log.action }} />} 
                  status={log.status === 'Approved' ? 'badge-green' : log.status === 'Modified' ? 'badge-amber' : log.status === 'Nudged' ? 'badge-accent' : 'badge-neutral'} 
                  statusText={log.status} 
                />
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function DeptCard({ name, val, color }) {
  return (
    <div className="ckin-card">
      <div className="ckin-dept">{name}</div>
      <div className="ckin-val font-mono" style={{ color }}>{val}%</div>
      <div className="ckin-bar">
        <div className="ckin-fill" style={{ width: `${val}%`, background: color }}></div>
      </div>
    </div>
  );
}

function AuditRow({ time, actor, actorColor, action, status, statusText }) {
  return (
    <div className="audit-row">
      <span className="at-time">{time}</span>
      <span className="at-actor font-medium" style={{ color: actorColor }}>{actor}</span>
      <div className="at-action">{action}</div>
      <span className={cn("badge", status)}>{statusText}</span>
    </div>
  );
}

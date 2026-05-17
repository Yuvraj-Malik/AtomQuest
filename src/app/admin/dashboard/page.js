"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { supabase } from "@/lib/supabase";
import { fetchAdminStats } from "@/lib/data";
import { 
  Users, 
  CheckCircle2, 
  Activity, 
  AlertTriangle,
  History,
  FileDown
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Error loading admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <TopBar 
        title="Admin dashboard" 
        subtitle="AY 2025–26 · 247 employees active" 
        primaryAction={{ label: "Export report", onClick: () => toast.success("Exporting full achievement report...") }}
      />
      
      <main className="content">
        <div className="stats-row">
          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
              <Users size={13} />
            </div>
            <div className="stat-val">247</div>
            <div className="stat-label">Total employees</div>
            <div className="stat-delta" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
              +12 this cycle
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
              <CheckCircle2 size={13} />
            </div>
            <div className="stat-val">89%</div>
            <div className="stat-label">Goals approved</div>
            <div className="stat-delta" style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>
              220 of 247
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
              <Activity size={13} />
            </div>
            <div className="stat-val">74%</div>
            <div className="stat-label">Q1 check-in rate</div>
            <div className="stat-delta" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
              183 of 247
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
              <AlertTriangle size={13} />
            </div>
            <div className="stat-val">14</div>
            <div className="stat-label">Escalations open</div>
            <div className="stat-delta" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
              Needs attention
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
              <DeptCard name="Sales" val={91} color="var(--green)" />
              <DeptCard name="Marketing" val={82} color="var(--green)" />
              <DeptCard name="HR" val={100} color="var(--accent)" />
              <DeptCard name="Operations" val={68} color="var(--amber)" />
              <DeptCard name="Engineering" val={57} color="var(--amber)" />
              <DeptCard name="Finance" val={44} color="var(--red)" />
            </div>
          </div>

          {/* Escalation Queue */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Escalation queue</div>
              <span className="badge badge-red">14 open</span>
            </div>
            <div className="p-[14px_20px] flex flex-col gap-[10px]">
              <div className="esc-item border-[rgba(224,92,92,0.2)] bg-[var(--red-bg)]">
                <div className="text-[12px] font-semibold text-[var(--red)] mb-[3px]">Goal not submitted</div>
                <div className="text-[11px] text-[var(--text2)]">Nisha Pillai · 5 days overdue · Finance</div>
                <div className="mt-[9px]">
                  <button className="bg-[var(--red)] text-white border-none rounded-[6px] px-2.5 py-1 text-[11px] font-medium" onClick={() => toast.success('Reminder sent to Nisha Pillai')}>
                    Send reminder
                  </button>
                </div>
              </div>
              <div className="esc-item border-[rgba(232,168,58,0.2)] bg-[var(--amber-bg)]">
                <div className="text-[12px] font-semibold text-[var(--amber)] mb-[3px]">Approval delayed</div>
                <div className="text-[11px] text-[var(--text2)]">Mgr Raj Sharma · 7 days since submission · 3 pending</div>
                <div className="mt-[9px]">
                  <button className="bg-[var(--amber)] text-white border-none rounded-[6px] px-2.5 py-1 text-[11px] font-medium" onClick={() => toast.info('Escalated to skip-level manager')}>
                    Escalate to L2
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Audit trail</div>
            <div className="flex gap-2">
              <button className="btn-ghost text-[11.5px] px-3 py-1" onClick={() => toast.success('Exporting audit log as CSV...')}>Export CSV</button>
              <button className="btn-ghost text-[11.5px] px-3 py-1" onClick={() => toast.success('Exporting achievement report...')}>Achievement report</button>
            </div>
          </div>
          <div>
            <AuditRow time="11:42 today" actor="Priya Nair" actorColor="var(--blue)" action={<>Approved 6 goals for <strong>Aryan Kumar</strong> — Revenue & Efficiency tracks</>} status="badge-green" statusText="Approved" />
            <AuditRow time="10:15 today" actor="Admin" actorColor="var(--amber)" action={<>Unlocked goal #G-1042 for <strong>Meera Singh</strong> — target revised post lock</>} status="badge-amber" statusText="Modified" />
            <AuditRow time="Yesterday" actor="Raj Sharma" actorColor="var(--blue)" action={<>Returned goals to <strong>Nisha Pillai</strong> — weightage validation error</>} status="badge-red" statusText="Returned" />
            <AuditRow time="3 Jul 09:00" actor="System" actorColor="var(--text3)" action={<>Q1 check-in window opened · All 247 employees notified</>} status="badge-neutral" statusText="System" />
            <AuditRow time="1 May 08:00" actor="System" actorColor="var(--text3)" action={<>AY 2025–26 goal cycle started · Configured by Admin</>} status="badge-accent" statusText="Cycle start" />
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

"use client";

import { useState, useEffect } from "react";
import { 
  CalendarDays, 
  Loader2,
  Clock,
  CheckCircle2,
  PlayCircle,
  StopCircle,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CyclesPage() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadCycles() {
      try {
        const res = await fetch('/api/cycles');
        if (res.ok) {
          const data = await res.json();
          setCycles(data);
        }
      } catch (err) {
        console.error("Error loading cycles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCycles();
  }, []);

  const refreshCycles = async () => {
    const res = await fetch('/api/cycles');
    if (res.ok) {
      setCycles(await res.json());
    }
  };

  const formatCycleDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleStartCycle = async () => {
    setProcessing(true);

    try {
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 3);
      const quarter = `Q${Math.floor(now.getMonth() / 3) + 1}`;
      const res = await fetch('/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${quarter} Performance Cycle`,
          start_date: now.toISOString(),
          end_date: end.toISOString(),
          is_active: true
        })
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || 'Failed to start cycle');
      }

      toast.success('New quarterly cycle started');
      await refreshCycles();
    } catch (error) {
      toast.error(error.message || 'Failed to start cycle');
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseCycle = async () => {
    if (!activeCycle) {
      toast.error('No active cycle to close');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/cycles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeCycle.id, updates: { is_active: false, end_date: new Date().toISOString().slice(0, 10) } })
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || 'Failed to close cycle');
      }

      toast.success('Active cycle closed');
      await refreshCycles();
    } catch (error) {
      toast.error(error.message || 'Failed to close cycle');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const activeCycle = cycles.find(c => c.is_active);
  const pastCycles = cycles.filter(c => !c.is_active);

  return (
    <div className="p-6 space-y-6 bg-[var(--bg)] min-h-screen">
      <div className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,rgba(200,240,96,0.10),rgba(91,156,246,0.06),rgba(255,255,255,0.02))] p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(200,240,96,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(91,156,246,0.12),transparent_32%)]" />
        <div className="relative z-[1] flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text2)] mb-3">
              <CalendarDays className="w-3.5 h-3.5 text-[var(--accent)]" /> Quarterly control
            </div>
            <h2 className="text-[28px] font-semibold text-[var(--text1)] tracking-tight flex items-center gap-2">
              <CalendarDays className="w-7 h-7 text-[var(--accent)]" />
              Cycle Management
            </h2>
            <p className="text-[13.5px] text-[var(--text2)] mt-2 max-w-xl">Configure and manage active performance evaluation periods with a cleaner overview and less visual noise.</p>
          </div>

          <button 
            onClick={handleStartCycle}
            disabled={processing}
            className="tb-btn tb-btn-primary px-4 py-2 flex items-center gap-2 self-start disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {processing ? 'Starting...' : 'Start New Cycle'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-[var(--text3)] mb-1">Active cycle</div>
          <div className="text-[18px] font-semibold text-[var(--text1)]">{activeCycle ? activeCycle.name : 'None'}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-[var(--text3)] mb-1">Past cycles</div>
          <div className="text-[18px] font-semibold text-[var(--text1)]">{pastCycles.length}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-[var(--text3)] mb-1">Control status</div>
          <div className="text-[18px] font-semibold text-[var(--text1)]">{activeCycle ? 'Live' : 'Paused'}</div>
        </div>
      </div>
      
      {activeCycle ? (
        <div className="p-6 rounded-2xl border border-[var(--accent-border)] bg-[var(--surface)] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <CalendarDays className="w-32 h-32 text-[var(--accent)]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge badge-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                Active Now
              </span>
            </div>
            
            <h4 className="text-[22px] font-bold text-[var(--text1)] mb-4">{activeCycle.name}</h4>
            
            <div className="flex flex-wrap gap-6 text-[13.5px] text-[var(--text2)]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text3)]" />
                <span>Start: <strong className="text-[var(--text1)]">{formatCycleDate(activeCycle.start_date)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text3)]" />
                <span>End: <strong className="text-[var(--text1)]">{formatCycleDate(activeCycle.end_date)}</strong></span>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={handleCloseCycle}
                disabled={processing}
                className="tb-btn tb-btn-ghost px-4 py-2 flex items-center gap-2 hover:border-[var(--red)] hover:text-[var(--red)]"
              >
                <StopCircle className="w-4 h-4" /> Close Cycle
              </button>
              <button 
                onClick={() => toast.info('Cycle configuration editing is now driven by the cycle API and date fields. Start/close actions are live.')}
                disabled={processing}
                className="tb-btn tb-btn-ghost px-4 py-2 flex items-center gap-2 hover:border-[var(--blue)] hover:text-[var(--blue)]"
              >
                <Settings className="w-4 h-4" /> Configuration
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-[var(--border)] bg-[var(--surface2)] text-center mb-8">
          <CalendarDays className="w-10 h-10 text-[var(--text3)] mx-auto mb-3" />
          <h4 className="text-[16px] font-semibold text-[var(--text1)] mb-1">No Active Cycle</h4>
          <p className="text-[13px] text-[var(--text2)]">The performance evaluation period is currently paused.</p>
        </div>
      )}

      {/* Past Cycles History */}
      <h3 className="text-[15px] font-semibold text-[var(--text1)] mb-4 uppercase tracking-wider">Cycle History</h3>
      
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-sm">
        <table className="w-full text-left">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
              <th className="enterprise-table-th text-[var(--text2)]">Cycle Name</th>
              <th className="enterprise-table-th text-[var(--text2)]">Start Date</th>
              <th className="enterprise-table-th text-[var(--text2)]">End Date</th>
              <th className="enterprise-table-th text-[var(--text2)] text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {pastCycles.length === 0 ? (
              <tr>
                <td colSpan="4" className="enterprise-table-td text-center py-12 text-[var(--text3)]">
                  No historical cycles found in the database.
                </td>
              </tr>
            ) : (
              pastCycles.map((cycle) => (
                <tr key={cycle.id} className="enterprise-table-tr border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface2)] transition">
                  <td className="enterprise-table-td">
                    <span className="font-semibold text-[13.5px] text-[var(--text1)]">{cycle.name}</span>
                  </td>
                  <td className="enterprise-table-td text-[13px] text-[var(--text2)] font-mono">
                    {formatCycleDate(cycle.start_date)}
                  </td>
                  <td className="enterprise-table-td text-[13px] text-[var(--text2)] font-mono">
                    {formatCycleDate(cycle.end_date)}
                  </td>
                  <td className="enterprise-table-td text-right">
                    <span className="badge badge-neutral flex items-center justify-end gap-1.5 w-fit ml-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

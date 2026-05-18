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

  const handleAction = (actionName) => {
    setProcessing(true);
    toast.info(`Initiating ${actionName}...`);
    setTimeout(() => {
      toast.success(`${actionName} executed successfully. Note: In this demo environment, cycles are statically seeded.`);
      setProcessing(false);
    }, 1500);
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
    <div className="p-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[24px] font-semibold text-[var(--text1)] tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[var(--accent)]" /> 
            Cycle Management
          </h2>
          <p className="text-[13.5px] text-[var(--text2)] mt-1">Configure and manage active performance evaluation periods.</p>
        </div>
        
        <button 
          onClick={() => handleAction("Start New Cycle")}
          disabled={processing}
          className="tb-btn tb-btn-primary px-4 py-2 flex items-center gap-2 self-start"
        >
          <PlayCircle className="w-4 h-4" /> Start New Cycle
        </button>
      </div>

      <div className="h-[1px] bg-[var(--border)] w-full mb-8" />

      {/* Active Cycle Panel */}
      <h3 className="text-[15px] font-semibold text-[var(--text1)] mb-4 uppercase tracking-wider">Current Active Cycle</h3>
      
      {activeCycle ? (
        <div className="p-6 rounded-xl border border-[var(--accent-border)] bg-[var(--surface)] shadow-[0_0_15px_rgba(200,240,96,0.03)] relative overflow-hidden mb-8">
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
                <span>Start: <strong className="text-[var(--text1)]">{activeCycle.start_date}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text3)]" />
                <span>End: <strong className="text-[var(--text1)]">{activeCycle.end_date}</strong></span>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => handleAction("Close Active Cycle")}
                disabled={processing}
                className="tb-btn tb-btn-ghost px-4 py-2 flex items-center gap-2 hover:border-[var(--red)] hover:text-[var(--red)]"
              >
                <StopCircle className="w-4 h-4" /> Close Cycle
              </button>
              <button 
                onClick={() => handleAction("Edit Cycle Config")}
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
      
      <div className="enterprise-table-wrapper border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]">
        <table className="w-full text-left">
          <thead>
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
                    {cycle.start_date}
                  </td>
                  <td className="enterprise-table-td text-[13px] text-[var(--text2)] font-mono">
                    {cycle.end_date}
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

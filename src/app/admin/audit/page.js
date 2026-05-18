"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  Search, 
  Loader2,
  Download,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { downloadReport } from "@/lib/reportDownload";

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch('/api/audit-logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error("Error loading audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const handleExport = () => {
    toast.success("Exporting audit logs to CSV...");
    downloadReport('/api/reports/export?report=audit&format=csv');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const statuses = ["all", ...new Set(logs.map(l => l.status).filter(Boolean))];

  const filteredLogs = logs.filter(log => {
    const searchString = `${log.actor} ${log.action}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-[var(--bg)] min-h-screen">
      <div className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,rgba(91,156,246,0.09),rgba(200,240,96,0.06),rgba(255,255,255,0.02))] p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(91,156,246,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(200,240,96,0.12),transparent_32%)]" />
        <div className="relative z-[1] flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text2)] mb-3">
              <History className="w-3.5 h-3.5 text-[var(--accent)]" /> Governance log
            </div>
            <h2 className="text-[28px] font-semibold text-[var(--text1)] tracking-tight flex items-center gap-2">
              <History className="w-7 h-7 text-[var(--accent)]" />
              Audit Trail
            </h2>
            <p className="text-[13.5px] text-[var(--text2)] mt-2 max-w-xl">Review system activities, security events, and administrative actions in a cleaner, denser layout.</p>
          </div>

          <button 
            onClick={handleExport}
            className="tb-btn tb-btn-ghost px-4 py-2 flex items-center gap-2 self-start bg-[var(--surface)]"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text3)]" />
          <input 
            type="text" 
            placeholder="Search actors, actions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9 text-[var(--text1)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[var(--text3)]" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="form-select w-full md:w-auto py-2 text-[12.5px] text-[var(--text1)]"
          >
            <option value="all">All Events</option>
            {statuses.filter(s => s !== "all").map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-sm">
        <table className="w-full text-left">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
              <th className="enterprise-table-th text-[var(--text2)] w-[140px]">Timestamp</th>
              <th className="enterprise-table-th text-[var(--text2)] w-[180px]">Actor</th>
              <th className="enterprise-table-th text-[var(--text2)]">Action Details</th>
              <th className="enterprise-table-th text-[var(--text2)] text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="enterprise-table-td text-center py-12 text-[var(--text3)]">
                  No audit logs found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="enterprise-table-tr border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface2)] transition">
                  <td className="enterprise-table-td font-mono text-[12px] text-[var(--text3)]">
                    {log.time}
                  </td>
                  <td className="enterprise-table-td">
                    <span className="font-semibold text-[13px] text-[var(--text1)]">{log.actor}</span>
                  </td>
                  <td className="enterprise-table-td text-[13px] text-[var(--text2)]">
                    <span dangerouslySetInnerHTML={{ __html: log.action }} />
                  </td>
                  <td className="enterprise-table-td text-right">
                    <span className={cn(
                      "badge",
                      log.status === 'Approved' ? 'badge-green' : 
                      log.status === 'Modified' ? 'badge-amber' : 
                      log.status === 'Nudged' ? 'badge-accent' : 
                      log.status === 'Created' ? 'badge-blue' : 
                      log.status === 'Unlocked' ? 'badge-amber' :
                      'badge-neutral'
                    )}>
                      {log.status}
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

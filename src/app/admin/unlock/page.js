"use client";

import { useState, useEffect } from "react";
import { 
  Unlock, 
  Search, 
  Loader2,
  Lock,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function GoalUnlockPage() {
  const [goals, setGoals] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [actioning, setActioning] = useState(null);

  async function loadData() {
    try {
      // Fetch all goals
      const goalsRes = await fetch('/api/goals');
      // Fetch all profiles to map employee names
      const profRes = await fetch('/api/profiles?all=true');
      
      if (goalsRes.ok && profRes.ok) {
        const goalsData = await goalsRes.json();
        const profData = await profRes.json();
        
        // Filter only submitted/approved goals
        setGoals(goalsData.filter(g => g.status === 'submitted' || g.status === 'approved'));
        
        const profMap = {};
        profData.forEach(p => { profMap[p.id] = p; });
        setProfiles(profMap);
      }
    } catch (err) {
      console.error("Error loading goal unlock data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleUnlock = async (goalId, title, empName) => {
    setActioning(goalId);
    try {
      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: goalId,
          updates: { status: 'draft' }
        })
      });

      if (res.ok) {
        toast.success(`Unlocked goal sheet "${title}" for ${empName}!`);
        await loadData();
      } else {
        toast.error("Failed to unlock goal.");
      }
    } catch (err) {
      console.error("Unlock error:", err);
      toast.error("An error occurred during unlock.");
    } finally {
      setActioning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const filteredGoals = goals.filter(g => {
    const empName = profiles[g.employee_id]?.name || "";
    const department = profiles[g.employee_id]?.department || "";
    const searchString = `${g.title} ${empName} ${department}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = [
    "all",
    ...new Set(goals.map(g => profiles[g.employee_id]?.department).filter(Boolean))
  ];

  const statuses = [
    "all",
    ...new Set(goals.map(g => g.status).filter(Boolean))
  ];

  const hasActiveFilters = Boolean(searchQuery || statusFilter !== "all" || departmentFilter !== "all");

  return (
    <div className="p-6 space-y-6 bg-[var(--bg)] min-h-screen">
      <div className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,rgba(245,158,11,0.10),rgba(255,255,255,0.02))] p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(91,156,246,0.08),transparent_32%)]" />
        <div className="relative z-[1] max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text2)] mb-3">
            <Unlock className="w-3.5 h-3.5 text-[var(--amber)]" /> Administrative override
          </div>
          <h2 className="text-[28px] font-semibold text-[var(--text1)] tracking-tight flex items-center gap-2">
            <Unlock className="w-7 h-7 text-[var(--amber)]" />
            Goal Sheet Unlock
          </h2>
          <p className="text-[13.5px] text-[var(--text2)] mt-2 max-w-xl">Administratively unlock submitted or approved goals back to draft status with a cleaner queue and less clutter.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text3)]" />
            <input 
              type="text" 
              placeholder="Search goal titles, employee names, or departments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-9 text-[var(--text1)]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select w-full sm:w-[180px]"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="form-select w-full sm:w-[200px]"
            >
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department === "all" ? "All departments" : department}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDepartmentFilter("all");
                }}
                className="tb-btn tb-btn-ghost px-3 py-2 text-[12px] whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-[12.5px] text-[var(--text2)]">
        <div>
          Showing <span className="font-semibold text-[var(--text1)]">{filteredGoals.length}</span> of <span className="font-semibold text-[var(--text1)]">{goals.length}</span> unlocked candidates
        </div>
        {hasActiveFilters && <span className="badge badge-accent w-fit">Filtered queue</span>}
      </div>

      {/* Goals Table */}
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-sm">
        <table className="w-full text-left">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
              <th className="enterprise-table-th text-[var(--text2)]">Employee</th>
              <th className="enterprise-table-th text-[var(--text2)]">Goal Title</th>
              <th className="enterprise-table-th text-[var(--text2)]">Current Status</th>
              <th className="enterprise-table-th text-[var(--text2)] text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredGoals.length === 0 ? (
              <tr>
                <td colSpan="4" className="enterprise-table-td text-center py-12 text-[var(--text3)]">
                  No locked goals found matching your search.
                </td>
              </tr>
            ) : (
              filteredGoals.map((goal) => {
                const empName = profiles[goal.employee_id]?.name || "Unknown Employee";
                return (
                  <tr key={goal.id} className="enterprise-table-tr border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface2)] transition">
                    <td className="enterprise-table-td">
                      <div className="font-semibold text-[13px] text-[var(--text1)]">{empName}</div>
                      <div className="text-[11.5px] text-[var(--text2)] mt-0.5">{profiles[goal.employee_id]?.department || "Unknown"}</div>
                    </td>
                    <td className="enterprise-table-td text-[13px] text-[var(--text1)] font-medium">
                      {goal.title}
                    </td>
                    <td className="enterprise-table-td">
                      <span className={cn(
                        "badge flex items-center gap-1.5 w-fit capitalize",
                        goal.status === 'approved' ? 'badge-green' : 'badge-blue'
                      )}>
                        <Lock className="w-3 h-3" />
                        {goal.status}
                      </span>
                    </td>
                    <td className="enterprise-table-td text-right">
                      <button 
                        onClick={() => handleUnlock(goal.id, goal.title, empName)}
                        disabled={actioning === goal.id}
                        className="tb-btn tb-btn-ghost px-3 py-1.5 text-[12px] flex items-center justify-center gap-1.5 ml-auto hover:text-[var(--amber)] hover:border-[var(--amber)]"
                      >
                        {actioning === goal.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                        Unlock
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

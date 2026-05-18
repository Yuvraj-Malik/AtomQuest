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
    const searchString = `${g.title} ${empName}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[24px] font-semibold text-[var(--text1)] tracking-tight flex items-center gap-2">
            <Unlock className="w-6 h-6 text-[var(--amber)]" /> 
            Goal Sheet Unlock
          </h2>
          <p className="text-[13.5px] text-[var(--text2)] mt-1">Administratively unlock submitted or approved goals back to draft status.</p>
        </div>
      </div>

      <div className="h-[1px] bg-[var(--border)] w-full mb-6" />

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text3)]" />
          <input 
            type="text" 
            placeholder="Search goal titles, employee names..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9 text-[var(--text1)]"
          />
        </div>
      </div>

      {/* Goals Table */}
      <div className="enterprise-table-wrapper border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)] shadow-lg">
        <table className="w-full text-left">
          <thead>
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

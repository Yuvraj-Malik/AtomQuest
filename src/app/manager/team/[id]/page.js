"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  Sparkles,
  Target,
  Clock3,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { fetchUserProfile, fetchEmployeeGoals } from "@/lib/data";

export default function ManagerGoalReview({ params }) {
  const [employee, setEmployee] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviewData() {
      try {
        const empProfile = await fetchUserProfile(params.id);
        const empGoals = await fetchEmployeeGoals(params.id);
        setEmployee(empProfile);
        setGoals(empGoals || []);
      } catch (error) {
        console.error("Error loading goal review data:", error);
        toast.error("Failed to load employee review details.");
      } finally {
        setLoading(false);
      }
    }
    loadReviewData();
  }, [params.id]);

  const handleAction = async (goalId, action) => {
    const status = action === 'approve' ? 'approved' : 'returned';
    const toastId = toast.loading(`${action === 'approve' ? 'Approving' : 'Returning'} goal...`);
    try {
      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalId, updates: { status } })
      });
      if (!res.ok) throw new Error('Failed to update goal status');

      // Update local state in real-time
      setGoals(prevGoals =>
        prevGoals.map(g => g.id === goalId ? { ...g, status } : g)
      );

      toast.success(`Goal ${action === 'approve' ? 'approved' : 'returned'} successfully!`, { id: toastId });
    } catch (err) {
      console.error(`Error updating goal status:`, err);
      toast.error(`Failed to update status: ${err.message}`, { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[var(--bg)] text-[var(--text2)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="text-red mb-3 font-semibold">Error</div>
        <p className="text-[14px] text-secondary max-w-[280px]">
          Could not find a valid direct report profile with the given ID.
        </p>
        <Link href="/manager/team" className="mt-4">
          <button className="enterprise-btn-secondary">Go back to My Team</button>
        </Link>
      </div>
    );
  }

  const approvedCount = goals.filter(g => g.status === 'approved').length;
  const submittedCount = goals.filter(g => g.status === 'submitted').length;
  const returnedCount = goals.filter(g => g.status === 'returned').length;
  const totalWeightage = goals.reduce((sum, g) => sum + Number(g.weightage || 0), 0);

  const averageProgress = goals.length
    ? Math.round(
        goals.reduce((sum, goal) => {
          const score = Number(goal.achievements?.[0]?.computed_score || 0);
          return sum + score;
        }, 0) / goals.length
      )
    : 0;

  return (
    <main className="content space-y-6">
      <div className="enterprise-card relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(200,240,96,0.18)_0%,rgba(200,240,96,0.02)_58%,transparent_75%)] pointer-events-none" />

        <div className="relative z-[1]">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-3">
              <Link href="/manager/team">
                <button className="enterprise-btn-secondary px-2.5 py-1.5 rounded-md" title="Back to My Team">
                  <ArrowLeft size={16} />
                </button>
              </Link>

              <div>
                <h2 className="text-[28px] font-semibold tracking-tight text-primary flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[var(--accent)]" /> Review Goals: {employee.name || employee.email}
                </h2>
                <p className="text-[14px] text-secondary mt-1">
                  {employee.designation || 'Direct Report'} · {employee.department || 'Team'} · {employee.location || 'Location not set'}
                </p>
              </div>
            </div>

            <span className="badge badge-accent">Q1 FY 2026-27</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-[0.08em] text-secondary">Total Goals</div>
              <div className="text-[20px] font-semibold text-primary mt-1 flex items-center gap-2"><Target className="w-4 h-4 text-[var(--blue)]" />{goals.length}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-[0.08em] text-secondary">Approved</div>
              <div className="text-[20px] font-semibold text-primary mt-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[var(--green)]" />{approvedCount}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-[0.08em] text-secondary">Avg Progress</div>
              <div className="text-[20px] font-semibold text-primary mt-1 flex items-center gap-2"><Clock3 className="w-4 h-4 text-[var(--amber)]" />{averageProgress}%</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-[0.08em] text-secondary">Weightage</div>
              <div className="text-[20px] font-semibold text-primary mt-1 flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${totalWeightage === 100 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`} />
                {totalWeightage}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="enterprise-card text-center py-16">
          <p className="text-[13px] text-secondary">This employee has not created any goals for this cycle yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="enterprise-card border-[var(--border)] hover:border-[var(--accent-border)]">
              <div className="flex justify-between items-start gap-4 mb-5">
                <div className="min-w-0">
                  <span className="text-[11px] uppercase tracking-wider text-secondary font-medium block mb-2">
                    {goal.thrust_area || 'Thrust Area'}
                  </span>
                  <h3 className="text-[20px] font-semibold text-primary leading-[1.3]">{goal.title}</h3>
                  {goal.description ? (
                    <p className="text-[13px] text-secondary mt-2 max-w-[78ch] leading-relaxed">{goal.description}</p>
                  ) : null}
                </div>
                <span className={`status-badge ${goal.status}`}>{goal.status}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-3">
                  <label className="text-[10px] uppercase tracking-wider text-secondary font-medium block mb-1">Target</label>
                  <div className="font-mono text-[14px] text-primary">
                    {goal.target_value ? `${goal.target_value}` : goal.target_date ? `By ${new Date(goal.target_date).toLocaleDateString()}` : 'No target set'}
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-3">
                  <label className="text-[10px] uppercase tracking-wider text-secondary font-medium block mb-1">Weightage</label>
                  <div className="font-mono text-[14px] text-primary">{goal.weightage}%</div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-3">
                  <label className="text-[10px] uppercase tracking-wider text-secondary font-medium block mb-1">Current Progress</label>
                  <div className="font-mono text-[14px] text-primary">{Number(goal.achievements?.[0]?.computed_score || 0)}%</div>
                </div>
              </div>

              <div className="h-[6px] rounded-full bg-[var(--surface3)] overflow-hidden mb-6">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, Number(goal.achievements?.[0]?.computed_score || 0)))}%`,
                    background: goal.status === 'approved' ? 'var(--green)' : goal.status === 'returned' ? 'var(--red)' : 'var(--accent)'
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-5 border-t border-border">
                <button 
                  onClick={() => handleAction(goal.id, 'approve')}
                  className="tb-btn tb-btn-primary flex items-center gap-2"
                  disabled={goal.status === 'approved'}
                  style={{ opacity: goal.status === 'approved' ? 0.6 : 1, cursor: goal.status === 'approved' ? 'not-allowed' : 'pointer' }}
                >
                  <CheckCircle2 size={16} />
                  Approve
                </button>
                <button 
                  onClick={() => handleAction(goal.id, 'return')}
                  className="tb-btn tb-btn-ghost flex items-center gap-2 text-red border-red/20"
                  disabled={goal.status === 'returned'}
                  style={{ opacity: goal.status === 'returned' ? 0.6 : 1, cursor: goal.status === 'returned' ? 'not-allowed' : 'pointer' }}
                >
                  <XCircle size={16} />
                  Return for Edit
                </button>
                <button 
                  className="tb-btn tb-btn-ghost flex items-center gap-2 ml-auto"
                  onClick={() => toast("Comments module is coming soon!")}
                >
                  <MessageSquare size={16} />
                  Add Comment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

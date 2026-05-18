"use client";

import { useEffect, useMemo, useState } from "react";
import { getCurrentProfile } from "@/lib/clientProfile";
import { fetchManagerTeam } from "@/lib/data";
import { toast } from "sonner";
import { Loader2, CalendarDays, CheckSquare2, Send } from "lucide-react";

export default function ManagerCheckinsPage() {
  const [team, setTeam] = useState([]);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [plannedValue, setPlannedValue] = useState("");
  const [actualValue, setActualValue] = useState("");
  const [progressStatus, setProgressStatus] = useState("on_track");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getCurrentProfile();
        if (!profile?.id) {
          return;
        }

        const [teamData, checkinsRes, cyclesRes] = await Promise.all([
          fetchManagerTeam(profile.id),
          fetch(`/api/checkins?managerId=${encodeURIComponent(profile.id)}`),
          fetch('/api/cycles')
        ]);

        setTeam(teamData || []);

        if (checkinsRes.ok) {
          const items = await checkinsRes.json();
          setRecentCheckins((items || []).sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()));
        }

        if (cyclesRes.ok) {
          const cycles = await cyclesRes.json();
          setActiveCycle(cycles.find((cycle) => cycle.is_active) || null);
        }
      } catch (error) {
        console.error('Load manager check-ins error:', error);
        toast.error('Failed to load check-in data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const selectedMember = useMemo(() => team.find((member) => member.id === selectedEmployee) || null, [team, selectedEmployee]);
  const availableGoals = selectedMember?.goals || [];

  useEffect(() => {
    if (!selectedEmployee) {
      setSelectedGoal("");
      setPlannedValue("");
      setActualValue("");
      setProgressStatus("on_track");
      return;
    }

    const firstGoal = availableGoals[0];
    if (firstGoal && !selectedGoal) {
      setSelectedGoal(firstGoal.id);
    }
  }, [availableGoals, selectedEmployee, selectedGoal]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedEmployee) {
      toast.error('Select a team member');
      return;
    }

    if (!selectedGoal) {
      toast.error('Select a goal to score');
      return;
    }

    setSubmitting(true);
    try {
      const profile = await getCurrentProfile();
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manager_id: profile?.id,
          manager_name: profile?.name,
          employee_id: selectedEmployee,
          goal_id: selectedGoal,
          cycle_id: activeCycle?.id,
          quarter: activeCycle?.name,
          planned_value: plannedValue || null,
          actual_value: actualValue || null,
          progress_status: progressStatus,
          comment
        })
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to submit check-in');
      }

      toast.success('Quarterly check-in submitted');
      setComment('');
      setPlannedValue('');
      setActualValue('');
      setSelectedGoal('');
      setProgressStatus('on_track');
      setRecentCheckins((prev) => [payload.checkin, ...prev]);
    } catch (error) {
      console.error('Submit check-in error:', error);
      toast.error(error.message || 'Unable to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[360px]">
        <Loader2 className="w-7 h-7 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="enterprise-card relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(200,240,96,0.18)_0%,rgba(200,240,96,0.02)_60%,transparent_75%)] pointer-events-none" />
        <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[28px] font-semibold tracking-tight text-primary flex items-center gap-2">
              <CheckSquare2 className="w-6 h-6 text-[var(--green)]" /> Quarterly check-ins
            </h2>
            <p className="text-secondary mt-1">Record actual vs planned outcomes and compute the goal score for the active cycle.</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2 text-[12px] text-secondary flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[var(--accent)]" /> {activeCycle?.name || 'No active cycle'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="card lg:col-span-5">
          <div className="card-header"><div className="card-title">Submit check-in</div></div>
          <div className="section-pad">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Employee</label>
                <select className="form-select" value={selectedEmployee} onChange={(event) => setSelectedEmployee(event.target.value)}>
                  <option value="">Select team member</option>
                  {team.map((member) => (
                    <option key={member.id} value={member.id}>{member.name || member.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Goal</label>
                <select className="form-select" value={selectedGoal} onChange={(event) => setSelectedGoal(event.target.value)} disabled={!selectedEmployee}>
                  <option value="">Select a goal</option>
                  {availableGoals.map((goal) => (
                    <option key={goal.id} value={goal.id}>{goal.title} · {goal.weightage}%</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Planned value</label>
                  <input className="form-input" value={plannedValue} onChange={(event) => setPlannedValue(event.target.value)} placeholder="e.g. 100" />
                </div>
                <div>
                  <label className="form-label">Actual value</label>
                  <input className="form-input" value={actualValue} onChange={(event) => setActualValue(event.target.value)} placeholder="e.g. 92" />
                </div>
              </div>

              <div>
                <label className="form-label">Progress status</label>
                <select className="form-select" value={progressStatus} onChange={(event) => setProgressStatus(event.target.value)}>
                  <option value="completed">Completed</option>
                  <option value="on_track">On track</option>
                  <option value="at_risk">At risk</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="form-label">Manager note</label>
                <textarea className="form-textarea" rows={5} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Summarize the discussion, blockers, and next actions..." />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="tb-btn tb-btn-primary flex items-center gap-2" disabled={submitting || !activeCycle}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit check-in
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card lg:col-span-7">
          <div className="card-header"><div className="card-title">Recent check-ins</div></div>
          <div className="section-pad space-y-3">
            {recentCheckins.length === 0 ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] text-secondary p-8 text-center">No check-ins recorded yet.</div>
            ) : (
              recentCheckins.map((checkin) => {
                const employee = team.find((member) => member.id === checkin.employee_id);
                return (
                  <div key={checkin.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="font-medium text-primary">{employee?.name || checkin.employee_id}</div>
                      <div className="text-[11px] text-secondary font-mono">{new Date(checkin.completed_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-secondary mb-3">
                      <span className="badge badge-neutral">{checkin.quarter || 'Quarterly'}</span>
                      <span className="badge badge-green">Score {checkin.computed_score ?? 0}%</span>
                      <span className="badge badge-blue">{checkin.goal_ids?.length || 1} goal(s)</span>
                    </div>
                    <p className="text-[13px] text-primary leading-relaxed">{checkin.comment || 'No manager note provided.'}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

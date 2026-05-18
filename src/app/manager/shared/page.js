"use client";

import { useState, useEffect } from "react";
import { getCurrentProfile } from "@/lib/clientProfile";
import { toast } from "sonner";
import { Loader2, SendHorizontal, Users, Target, Sparkles } from "lucide-react";

export default function ManagerSharedGoal() {
  const [team, setTeam] = useState([]);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadTeam() {
      try {
        const profile = await getCurrentProfile();
        if (!profile?.id) return;
        const res = await fetch(`/api/manager/team?managerId=${encodeURIComponent(profile.id)}`);
        if (res.ok) setTeam(await res.json());
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelected(team.map(member => member.id));
  };

  const clearAll = () => {
    setSelected([]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title || selected.length === 0) return toast.error('Provide title and select at least one employee');
    setSubmitting(true);
    try {
      const sharedWeightage = 100;
      const res = await fetch('/api/shared-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: '', target_value: target, weightage: sharedWeightage, employeeIds: selected })
      });
      if (res.ok) {
        toast.success('Shared goal pushed');
        setTitle(''); setTarget(''); setSelected([]);
      } else {
        toast.error('Failed to push');
      }
    } catch (err) {
      console.error('Push shared goal error:', err);
      toast.error('Error pushing shared goal');
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
    <div className="space-y-6">
      <div className="enterprise-card relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(91,156,246,0.16)_0%,rgba(91,156,246,0.02)_58%,transparent_75%)] pointer-events-none" />
        <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[28px] font-semibold tracking-tight text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[var(--blue)]" /> Push Shared Goal
            </h2>
            <p className="text-secondary mt-1">Create a common KPI and push it to selected direct reports in one action.</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2 text-[12px] text-secondary flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--accent)]" /> {selected.length} selected
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-pad">
          <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <label className="form-label">Title</label>
              <input className="form-input mb-3" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Improve quarterly customer retention" />
              <label className="form-label">Target (optional)</label>
              <input className="form-input" value={target} onChange={e=>setTarget(e.target.value)} placeholder="e.g. +8% retention" />
              <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-3 text-[12px] text-secondary flex items-start gap-2">
                <Target className="w-4 h-4 text-[var(--amber)] mt-0.5" />
                Shared goals are pushed as approved templates so each employee can start execution immediately.
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="form-label !mb-0">Select recipients</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="tb-btn tb-btn-ghost !px-2.5 !py-1 text-[11px]"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="tb-btn tb-btn-ghost !px-2.5 !py-1 text-[11px]"
                  >
                    Clear all
                  </button>
                </div>
              </div>
              <div className="mt-2 max-h-[260px] overflow-auto pr-1 space-y-2">
                {team.map(m => (
                  <label key={m.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-2.5 cursor-pointer hover:border-[var(--accent-border)] transition">
                    <input type="checkbox" checked={selected.includes(m.id)} onChange={()=>toggleSelect(m.id)} className="w-4 h-4 accent-[var(--accent)]" />
                    <div className="min-w-0">
                      <span className="text-[13.5px] text-primary block truncate">{m.name || m.email}</span>
                      <span className="text-[11px] text-secondary">{m.designation || 'Employee'} · {m.department || 'Team'}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="lg:col-span-12 flex justify-end gap-2">
              <button type="button" className="tb-btn tb-btn-ghost" onClick={()=>{setTitle(''); setTarget(''); setSelected([]);}}>Cancel</button>
              <button type="submit" className="tb-btn tb-btn-primary flex items-center gap-2" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
                Push to selected
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

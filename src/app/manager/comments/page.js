"use client";

import { useState, useEffect } from "react";
import { getCurrentProfile } from "@/lib/clientProfile";
import { toast } from "sonner";
import { Loader2, MessageSquareText, Send, Users } from "lucide-react";

export default function ManagerCommentsPage() {
  const [comments, setComments] = useState([]);
  const [team, setTeam] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const profile = await getCurrentProfile();
        if (!profile?.id) return;

        const [teamRes, commentsRes] = await Promise.all([
          fetch(`/api/manager/team?managerId=${encodeURIComponent(profile.id)}`),
          fetch(`/api/checkin-comments?managerId=${encodeURIComponent(profile.id)}`)
        ]);

        if (teamRes.ok) setTeam(await teamRes.json());
        if (commentsRes.ok) setComments(await commentsRes.json());
      } catch (err) {
        console.error('Load comments error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !text) return toast.error('Select employee and write a comment');
    setSubmitting(true);
    try {
      const profile = await getCurrentProfile();
      if (!profile?.id) return toast.error('Unable to resolve manager profile');

      const res = await fetch('/api/checkin-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manager_id: profile.id, employee_id: selectedEmployee, comment: text })
      });
      if (res.ok) {
        const payload = await res.json();
        setComments(prev => [payload.comment, ...prev]);
        setText('');
        toast.success('Comment added');
      } else {
        toast.error('Failed to add comment');
      }
    } catch (err) {
      console.error('Submit comment error:', err);
      toast.error('Error adding comment');
    } finally {
      setSubmitting(false);
    }
  };

  const teamById = team.reduce((acc, member) => {
    acc[member.id] = member;
    return acc;
  }, {});

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
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(91,156,246,0.18)_0%,rgba(91,156,246,0.02)_60%,transparent_75%)] pointer-events-none" />
        <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[28px] font-semibold tracking-tight text-primary flex items-center gap-2">
              <MessageSquareText className="w-6 h-6 text-[var(--blue)]" /> Check-in Comments
            </h2>
            <p className="text-secondary mt-1">Capture manager guidance and maintain a clear coaching trail for the quarter.</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2 text-[12px] text-secondary flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--accent)]" /> {team.length} team members
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="card lg:col-span-4">
          <div className="card-header"><div className="card-title">Add Comment</div></div>
          <div className="section-pad">
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="form-label">Employee</label>
                <select className="form-select" value={selectedEmployee} onChange={(e)=>setSelectedEmployee(e.target.value)}>
                  <option value="">Select team member</option>
                  {team.map(m => <option key={m.id} value={m.id}>{m.name || m.email}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Comment</label>
                <textarea rows={6} className="form-textarea" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Write coaching feedback, blockers, and next action..." />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="tb-btn tb-btn-primary flex items-center gap-2" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Add comment
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card lg:col-span-8">
          <div className="card-header"><div className="card-title">Recent comments</div></div>
          <div className="section-pad">
            {comments.length === 0 ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] text-secondary p-8 text-center">No comments yet.</div>
            ) : (
              comments.map(c => {
                const employee = teamById[c.employee_id];
                const employeeName = employee?.name || c.employee_id;
                return (
                <div key={c.id} className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-3.5">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="text-[12px] text-secondary">For <span className="text-primary font-medium">{employeeName}</span></div>
                    <div className="text-[11px] text-secondary font-mono">{new Date(c.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-[13.5px] leading-relaxed text-primary">{c.comment}</div>
                </div>
              )})
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

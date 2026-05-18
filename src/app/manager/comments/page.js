"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ManagerCommentsPage() {
  const [comments, setComments] = useState([]);
  const [team, setTeam] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [teamRes, commentsRes] = await Promise.all([
          fetch(`/api/manager/team?managerId=${user.id}`),
          fetch(`/api/checkin-comments?managerId=${user.id}`)
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch('/api/checkin-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manager_id: user.id, employee_id: selectedEmployee, comment: text })
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
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-primary mb-2">Check-in Comments</h2>
      <p className="text-secondary mb-6">Add and review comments for your team's check-ins.</p>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card col-span-1">
          <div className="section-pad">
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="form-label">Employee</label>
                <select className="form-select" value={selectedEmployee} onChange={(e)=>setSelectedEmployee(e.target.value)}>
                  <option value="">Select</option>
                  {team.map(m => <option key={m.id} value={m.id}>{m.name || m.email}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Comment</label>
                <textarea rows={4} className="form-textarea" value={text} onChange={(e)=>setText(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="tb-btn tb-btn-primary">Add comment</button>
              </div>
            </form>
          </div>
        </div>

        <div className="card col-span-2">
          <div className="card-header"><div className="card-title">Recent comments</div></div>
          <div className="section-pad">
            {comments.length === 0 ? (
              <div className="text-secondary">No comments yet.</div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="mb-4">
                  <div className="text-[13px] font-medium text-primary">{c.comment}</div>
                  <div className="text-[12px] text-secondary">for {c.employee_id} • {new Date(c.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

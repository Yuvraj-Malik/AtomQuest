"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ManagerSharedGoal() {
  const [team, setTeam] = useState([]);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const res = await fetch(`/api/manager/team?managerId=${user.id}`);
      if (res.ok) setTeam(await res.json());
      setLoading(false);
    }
    loadTeam();
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title || selected.length === 0) return toast.error('Provide title and select at least one employee');
    try {
      const res = await fetch('/api/shared-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: '', target_value: target, weightage: 0, employeeIds: selected })
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
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-primary mb-2">Push Shared Goal</h2>
      <p className="text-secondary mb-6">Create a shared KPI and push it to selected team members.</p>

      <div className="card">
        <div className="section-pad">
          <form onSubmit={submit} className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <label className="form-label">Title</label>
              <input className="form-input mb-3" value={title} onChange={e=>setTitle(e.target.value)} />
              <label className="form-label">Target (optional)</label>
              <input className="form-input" value={target} onChange={e=>setTarget(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Select recipients</label>
              <div className="space-y-2 mt-2">
                {team.map(m => (
                  <label key={m.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={selected.includes(m.id)} onChange={()=>toggleSelect(m.id)} />
                    <span className="text-[14px]">{m.name || m.email}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-3 flex justify-end gap-2">
              <button type="button" className="tb-btn tb-btn-ghost" onClick={()=>{setTitle(''); setTarget(''); setSelected([]);}}>Cancel</button>
              <button type="submit" className="tb-btn tb-btn-primary">Push to selected</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

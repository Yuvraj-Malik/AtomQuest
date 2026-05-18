"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Plus } from "lucide-react";

const UOM_HINTS = {
  nm: 'Numeric — higher is better. Score = Achievement ÷ Target × 100',
  nx: 'Numeric — lower is better (e.g. cost). Score = Target ÷ Achievement × 100',
  pct: 'Percentage — measured directly as % of target',
  tl: 'Timeline — completed before deadline is full credit',
  z: 'Zero-based — 0 = success (e.g. incidents)'
};

export default function CreateGoalPage() {
  const router = useRouter();

  // Form state
  const [thrustArea, setThrustArea] = useState('Revenue Growth');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uom, setUom] = useState('nm');
  const [targetValue, setTargetValue] = useState('');
  const [weightage, setWeightage] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors({});
  }, [title, targetValue, weightage]);

  function validate() {
    const err = {};
    if (!title.trim()) err.title = 'Please enter a goal title';
    if (!targetValue.trim()) err.targetValue = 'Please provide a target value';
    if (!weightage || weightage < 10 || weightage > 100) err.weightage = 'Weightage must be 10–100%';
    return err;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setSubmitting(true);
    try {
      // get current user id from supabase client dynamically
      const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
      const payload = {
        employee_id: user?.id || null,
        thrust_area: thrustArea,
        title,
        description,
        uom,
        target_value: targetValue,
        weightage: Number(weightage),
        status: 'submitted'
      };

      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const payloadErr = await res.json().catch(() => ({}));
        throw new Error(payloadErr?.error || 'Failed to create goal');
      }

      toast.success('Goal created and submitted for approval');
      router.push('/employee/goals');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Unable to create goal');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <TopBar title="Create goal" subtitle="Create an objective that your manager can review and approve" />

      <main className="content">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">New goal</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[var(--text3)]">Status</span>
                    <span className="badge badge-amber">Draft</span>
                  </div>
                </div>

                <div className="section-pad space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Thrust area</label>
                      <select className="form-select" value={thrustArea} onChange={(e) => setThrustArea(e.target.value)}>
                        <option>Revenue Growth</option>
                        <option>Market Expansion</option>
                        <option>Efficiency</option>
                        <option>Compliance</option>
                        <option>Safety</option>
                        <option>Learning & Development</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Unit of measurement</label>
                      <select className="form-select" value={uom} onChange={(e) => setUom(e.target.value)}>
                        <option value="nm">Numeric (higher = better)</option>
                        <option value="nx">Numeric (lower = better)</option>
                        <option value="pct">Percentage</option>
                        <option value="tl">Timeline</option>
                        <option value="z">Zero-based</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Goal title</label>
                    <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Achieve ₹45L quarterly sales" />
                    {errors.title && <div className="text-[12px] text-[var(--red)] mt-1">{errors.title}</div>}
                  </div>

                  <div>
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Scope, assumptions, and success criteria" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Target value</label>
                      <input className="form-input" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="e.g. 4500000" />
                      {errors.targetValue && <div className="text-[12px] text-[var(--red)] mt-1">{errors.targetValue}</div>}
                    </div>
                    <div>
                      <label className="form-label">Weightage (%)</label>
                      <input className="form-input font-mono" type="number" min={10} max={100} step={5} value={weightage} onChange={(e) => setWeightage(Number(e.target.value))} />
                      {errors.weightage && <div className="text-[12px] text-[var(--red)] mt-1">{errors.weightage}</div>}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button type="button" className="tb-btn tb-btn-ghost" onClick={() => router.push('/employee/goals')}>Cancel</button>
                    <button type="submit" className="tb-btn tb-btn-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create & submit'}</button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right: preview & tips */}
          <aside>
            <div className="card sticky top-6">
              <div className="card-header">
                <div className="card-title">Preview</div>
                <div className="text-[12px] text-[var(--text3)]">Live preview of the goal</div>
              </div>

              <div className="section-pad space-y-4">
                <div className="p-3 rounded bg-[var(--surface2)]">
                  <div className="text-[13px] text-[var(--text2)]">Thrust</div>
                  <div className="font-medium mt-1">{thrustArea}</div>
                </div>

                <div className="p-3 rounded bg-[var(--surface2)]">
                  <div className="text-[13px] text-[var(--text2)]">Title</div>
                  <div className="font-medium mt-1">{title || <span className="text-[var(--text3)]">— no title yet —</span>}</div>
                </div>

                <div className="p-3 rounded bg-[var(--surface2)]">
                  <div className="text-[13px] text-[var(--text2)]">Target</div>
                  <div className="font-mono mt-1">{targetValue || <span className="text-[var(--text3)]">—</span>}</div>
                </div>

                <div className="p-3 rounded bg-[var(--surface2)]">
                  <div className="text-[13px] text-[var(--text2)]">Weightage</div>
                  <div className="font-mono mt-1">{weightage}%</div>
                </div>

                <div className="p-3 rounded border border-[var(--border)] bg-[var(--surface3)] text-[13px] text-[var(--text2)]">
                  <div className="flex items-center gap-2 mb-2"><Check size={14} className="text-[var(--green)]" /> Tips</div>
                  <ul className="text-[13px] space-y-1 list-disc list-inside">
                    <li>Be specific: include numbers and a deadline where possible.</li>
                    <li>Keep weightage between 10% and 100%.</li>
                    <li>Describe how success will be measured in the description.</li>
                  </ul>
                </div>

                <div className="p-3 rounded bg-[var(--surface2)] text-[13px] text-[var(--text3)]">{UOM_HINTS[uom]}</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

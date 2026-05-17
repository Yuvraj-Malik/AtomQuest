"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const UOM_HINTS = {
  nm: 'Score: Achievement ÷ Target × 100 — higher achievement scores better',
  nx: 'Score: Target ÷ Achievement × 100 — lower achievement scores better (e.g. cost, TAT)',
  pct: 'Score: Actual % ÷ Target % — e.g. 80% actual vs 100% target = 80 score',
  tl: 'Score: completed before deadline → 100%, else proportional deduction',
  z: 'Score: achievement = 0 → 100% success · any non-zero value → 0% (e.g. safety incidents)'
};

export default function CreateGoalPage() {
  const router = useRouter();
  const [uom, setUom] = useState("nm");
  const [weight, setWeight] = useState(20);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Goal submitted for manager approval');
    router.push('/employee/dashboard');
  };

  return (
    <>
      <TopBar 
        title="Create new goal" 
        subtitle="Define a new objective for the current cycle." 
      />
      
      <main className="content">
        <div className="max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <div className="card mb-[14px]">
              <div className="card-header">
                <div className="card-title">New goal</div>
                <span className="badge badge-amber">Draft</span>
              </div>
              
              <div className="section-pad">
                <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-[var(--r)] p-[12px_14px] mb-[16px]">
                  <div className="flex justify-between text-[11.5px] mb-[6px]">
                    <span className="text-[var(--text3)]">Total weightage used</span>
                    <span className="weight-status font-medium text-[var(--green)]">
                      100% — balanced
                    </span>
                  </div>
                  <div className="weight-bar">
                    <div className="weight-fill bg-[var(--green)]" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Thrust area</label>
                    <select className="form-select">
                      <option>Revenue Growth</option>
                      <option>Market Expansion</option>
                      <option>Efficiency</option>
                      <option>Compliance</option>
                      <option>Safety</option>
                      <option>Learning & Development</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit of measurement</label>
                    <select 
                      className="form-select" 
                      value={uom} 
                      onChange={(e) => setUom(e.target.value)}
                    >
                      <option value="nm">Numeric — Min (higher = better)</option>
                      <option value="nx">Numeric — Max (lower = better)</option>
                      <option value="pct">Percentage (%)</option>
                      <option value="tl">Timeline (date-based)</option>
                      <option value="z">Zero-based (0 = success)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Goal title</label>
                  <input className="form-input" type="text" placeholder="e.g. Achieve ₹45L quarterly sales revenue" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows="3" placeholder="Describe scope, success criteria, and measurement approach..."></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Target value</label>
                    <input className="form-input" type="text" placeholder="e.g. 4500000" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weightage (10–100%)</label>
                    <input 
                      className="form-input font-mono" 
                      type="number" 
                      min="10" 
                      max="100" 
                      step="5" 
                      value={weight} 
                      onChange={(e) => setWeight(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-[var(--text3)] bg-[var(--surface2)] border border-[var(--border)] p-[9px_12px] rounded-[7px] mb-[16px]">
                  {UOM_HINTS[uom]}
                </div>

                <div className="flex gap-2 justify-end">
                  <button type="button" className="btn-ghost" onClick={() => router.push('/employee/dashboard')}>Cancel</button>
                  <button type="submit" className="btn-primary">Submit for approval</button>
                </div>
              </div>
            </div>
          </form>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Validation rules</div>
            </div>
            <div className="section-pad">
              <div className="flex flex-col gap-2">
                <ValidationItem label="Total weightage must equal exactly 100%" valid />
                <ValidationItem label="Minimum 10% per individual goal" valid />
                <ValidationItem label="Maximum 8 goals per employee" valid />
                <ValidationItem label="Goals are locked after manager approval — admin intervention required to edit" warning />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function ValidationItem({ label, valid, warning }) {
  return (
    <div className="flex gap-[9px] items-start">
      <span className={cn(
        "text-[12px]",
        valid ? "text-[var(--green)]" : warning ? "text-[var(--amber)]" : "text-[var(--red)]"
      )}>
        {valid ? "✓" : warning ? "⚠" : "✕"}
      </span>
      <span className="text-[12px] text-[var(--text2)]">{label}</span>
    </div>
  );
}

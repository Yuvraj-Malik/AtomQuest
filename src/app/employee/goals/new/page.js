"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Lightbulb, Activity, Users, DollarSign, Settings, Lock } from "lucide-react";
import Link from "next/link";

export default function NewGoalPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thrust_area: "",
    uom_type: "numeric_min",
    target_value: "",
    weightage: 10,
    confidence: "medium"
  });

  const currentTotalWeightage = 70; 
  const currentTotal = currentTotalWeightage + Number(formData.weightage);
  const isOver = currentTotal > 100;
  const isExactly = currentTotal === 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOver) {
      toast.error("Total weightage exceeds 100%. Please adjust.");
      return;
    }
    toast.success("Goal created successfully!");
    router.push("/employee/goals");
  };

  const steps = [
    { num: 1, title: "Thrust Area" },
    { num: 2, title: "Goal Details" },
    { num: 3, title: "Target & Weight" },
    { num: 4, title: "Confidence" }
  ];

  const thrustAreas = [
    { id: "Innovation", icon: Lightbulb, desc: "New products, features, or internal tools." },
    { id: "Operations", icon: Settings, desc: "Process improvements and efficiency." },
    { id: "Customer", icon: Users, desc: "Satisfaction, retention, and engagement." },
    { id: "Finance", icon: DollarSign, desc: "Revenue generation and cost savings." },
    { id: "People", icon: Activity, desc: "Team building, hiring, and culture." },
  ];

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <Link href="/employee/goals">
            <button className="enterprise-btn-secondary px-2 py-1 rounded">
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div>
            <h2 className="text-[24px] font-semibold text-primary">Create New Goal</h2>
            <p className="text-[14px] text-secondary mt-1">Define a new objective for the current cycle.</p>
          </div>
        </div>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      {/* Step Indicator */}
      <div className="flex items-center justify-between max-w-3xl mb-12">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors
                ${step > s.num ? 'bg-accent text-white' : 
                  step === s.num ? 'border-2 border-accent text-accent' : 
                  'bg-subtle text-secondary'}`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-[13px] font-medium ${step >= s.num ? 'text-primary' : 'text-secondary'}`}>
                {s.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[1px] mx-4 ${step > s.num ? 'bg-accent' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="enterprise-card max-w-3xl">
        <form onSubmit={handleSubmit}>
          
          {step === 1 && (
            <div className="space-y-6 slideDown">
              <h3 className="text-[18px] font-semibold">Select Thrust Area</h3>
              <div className="grid grid-cols-2 gap-4">
                {thrustAreas.map((area, i) => {
                  const Icon = area.icon;
                  const isSelected = formData.thrust_area === area.id;
                  return (
                    <div 
                      key={area.id}
                      onClick={() => setFormData({...formData, thrust_area: area.id})}
                      className={`enterprise-card-interactive p-4 rounded-lg border transition-all ${
                        isSelected 
                          ? 'border-accent bg-[var(--accent-soft)]' 
                          : 'border-border bg-subtle hover:bg-elevated'
                      } ${i === thrustAreas.length - 1 && thrustAreas.length % 2 !== 0 ? 'col-span-2' : ''}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon size={20} className={isSelected ? 'text-accent' : 'text-secondary'} />
                        <span className={`text-[15px] font-medium ${isSelected ? 'text-accent' : 'text-primary'}`}>{area.id}</span>
                      </div>
                      <p className="text-[12px] text-secondary">{area.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 slideDown">
              <h3 className="text-[18px] font-semibold">Goal Details</h3>
              <div>
                <label className="block text-[13px] font-medium text-primary mb-[6px]">Goal Title</label>
                <input 
                  required 
                  className="enterprise-input" 
                  placeholder="e.g. Increase Q1 Revenue by 20%" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-primary mb-[6px]">Description</label>
                <textarea 
                  required 
                  className="enterprise-input min-h-[100px] resize-none" 
                  placeholder="Detailed description..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-primary mb-[6px]">Measurement Type</label>
                <select 
                  className="enterprise-input"
                  value={formData.uom_type}
                  onChange={(e) => setFormData({...formData, uom_type: e.target.value})}
                >
                  <option value="numeric_min">Numeric (Higher is Better)</option>
                  <option value="numeric_max">Numeric (Lower is Better)</option>
                  <option value="timeline">Timeline</option>
                  <option value="zero">Zero-based</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 slideDown">
              <h3 className="text-[18px] font-semibold">Target & Weight</h3>
              
              <div className="bg-subtle p-4 rounded-lg border border-border mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[13px] font-medium text-primary">Weightage Allocation</span>
                  <span className="text-[14px] font-mono font-medium text-primary">{currentTotal} / 100%</span>
                </div>
                <div className="h-[6px] rounded-full bg-surface overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(currentTotal, 100)}%`,
                      backgroundColor: isOver ? 'var(--red)' : isExactly ? 'var(--green)' : 'var(--accent)'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-medium text-primary mb-[6px]">Target Value</label>
                  <input 
                    required 
                    className="enterprise-input" 
                    type={formData.uom_type === 'timeline' ? 'date' : 'number'} 
                    value={formData.target_value}
                    onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-primary mb-[6px]">Weightage (%)</label>
                  <input 
                    required 
                    className="enterprise-input font-mono" 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={formData.weightage}
                    onChange={(e) => setFormData({...formData, weightage: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 slideDown">
              <h3 className="text-[18px] font-semibold">Confidence Level</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "high", icon: "🟢", label: "High" },
                  { id: "medium", icon: "🟡", label: "Medium" },
                  { id: "low", icon: "🔴", label: "Low" }
                ].map((opt) => {
                  const isSelected = formData.confidence === opt.id;
                  return (
                    <div 
                      key={opt.id}
                      onClick={() => setFormData({...formData, confidence: opt.id})}
                      className={`enterprise-card-interactive p-6 rounded-lg border text-center transition-all ${
                        isSelected 
                          ? 'border-accent bg-[var(--accent-soft)]' 
                          : 'border-border bg-subtle hover:bg-elevated'
                      }`}
                    >
                      <div className="text-[24px] mb-2">{opt.icon}</div>
                      <div className={`text-[15px] font-medium ${isSelected ? 'text-accent' : 'text-primary'}`}>{opt.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-tertiary justify-center mt-4">
                <Lock size={14} />
                <span>Only visible to HR — not your manager</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="enterprise-btn-secondary">
                Back
              </button>
            )}
            {step < 4 ? (
              <button 
                type="button" 
                disabled={step === 1 && !formData.thrust_area}
                onClick={() => setStep(step + 1)} 
                className="enterprise-btn"
              >
                Continue
              </button>
            ) : (
              <button type="submit" className="enterprise-btn" disabled={isOver}>
                Submit Goal
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

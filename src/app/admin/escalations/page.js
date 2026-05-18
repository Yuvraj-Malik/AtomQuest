"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Loader2, 
  X, 
  Send, 
  CheckCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEsc, setSelectedEsc] = useState(null); // Active escalation selected for drawer
  
  // Drawer states
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [employeeGoals, setEmployeeGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("warning"); // 'warning' | 'alert'
  const [nudgeMessage, setNudgeMessage] = useState("");
  const [actioning, setActioning] = useState(false);

  // Template message configs
  const templates = {
    warning: "Hi {name}, your performance Q1 goals have not been submitted yet. Please finalize your drafts and click Submit today.",
    alert: "URGENT NOTICE: Hi {name}, your Q1 goals are currently 5+ days overdue. Immediate submission is required to prevent talent management blockages."
  };

  async function loadEscalations() {
    try {
      const res = await fetch('/api/escalations');
      if (res.ok) {
        const data = await res.json();
        // Show only unresolved escalations
        setEscalations(data.filter(e => !e.resolved));
      }
    } catch (err) {
      console.error("Error loading escalations:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEscalations();
  }, []);

  // Fetch violator profile and goals when an escalation is selected
  useEffect(() => {
    if (selectedEsc) {
      setGoalsLoading(true);
      
      // Fetch full profile details
      fetch(`/api/profiles?id=${selectedEsc.employee_id}`)
        .then(res => res.ok ? res.json() : null)
        .then(profile => {
          setEmployeeProfile(profile);
          // Update default nudge message with user name
          if (profile) {
            setNudgeMessage(templates[selectedTemplate].replace("{name}", profile.name));
          }
        })
        .catch(err => console.error("Error loading profile:", err));

      // Fetch employee goals
      fetch(`/api/goals?employeeId=${selectedEsc.employee_id}`)
        .then(res => res.ok ? res.json() : [])
        .then(goals => {
          setEmployeeGoals(goals);
          setGoalsLoading(false);
        })
        .catch(err => {
          console.error("Error loading goals:", err);
          setGoalsLoading(false);
        });
    } else {
      setEmployeeProfile(null);
      setEmployeeGoals([]);
    }
  }, [selectedEsc]);

  // Update nudge message when template selection changes
  const handleTemplateChange = (type) => {
    setSelectedTemplate(type);
    if (employeeProfile) {
      setNudgeMessage(templates[type].replace("{name}", employeeProfile.name));
    }
  };

  const handleAction = async (actionType) => {
    if (!selectedEsc) return;
    setActioning(true);

    try {
      const res = await fetch('/api/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escalationId: selectedEsc.id,
          actionType: actionType,
          nudgeMessage: actionType === 'nudge' ? nudgeMessage : undefined
        })
      });

      if (res.ok) {
        toast.success(
          actionType === 'nudge' 
            ? "Compliance nudge dispatched successfully!" 
            : "Admin override processed. Goal sheet approved."
        );
        setSelectedEsc(null);
        await loadEscalations();
      } else {
        toast.error("Failed to complete action. Please try again.");
      }
    } catch (err) {
      console.error("Escalation action error:", err);
      toast.error("An error occurred during submission.");
    } finally {
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="p-6 relative min-h-screen">
      {/* Top Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[24px] font-semibold text-[var(--text1)] tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[var(--red)]" /> 
            Active Exceptions Queue
          </h2>
          <p className="text-[13.5px] text-[var(--text2)] mt-1">Review overdue goals and resolve review locks dynamically.</p>
        </div>
      </div>
      
      <div className="h-[1px] bg-[var(--border)] w-full mb-8" />

      {/* Stats Quick-row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface2)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--red-bg)] text-[var(--red)] flex items-center justify-center font-bold text-[13px] border border-rgba(224,92,92,0.1)">
            {escalations.length}
          </div>
          <div>
            <span className="text-[11px] text-[var(--text3)] uppercase tracking-wider block">Open Exceptions</span>
            <span className="text-[14px] font-bold">{escalations.length} Pending Actions</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface2)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--amber-bg)] text-[var(--amber)] flex items-center justify-center font-bold text-[13px] border border-rgba(232,168,58,0.1)">
            {escalations.filter(e => e.escalation_type === 'goal_not_submitted').length}
          </div>
          <div>
            <span className="text-[11px] text-[var(--text3)] uppercase tracking-wider block">Goal Sheets Drafts</span>
            <span className="text-[14px] font-bold">Unsubmitted Check-ins</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface2)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--blue-bg)] text-[var(--blue)] flex items-center justify-center font-bold text-[13px] border border-rgba(91,156,246,0.1)">
            {escalations.filter(e => e.escalation_type === 'approval_delayed').length}
          </div>
          <div>
            <span className="text-[11px] text-[var(--text3)] uppercase tracking-wider block">Delayed Approvals</span>
            <span className="text-[14px] font-bold">Stuck in Review Stage</span>
          </div>
        </div>
      </div>

      {/* Escalations Table */}
      <div className="enterprise-table-wrapper border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)] shadow-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
              <th className="enterprise-table-th">Violator Profile</th>
              <th className="enterprise-table-th">Exception Details</th>
              <th className="enterprise-table-th">Duration Overdue</th>
              <th className="enterprise-table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {escalations.length === 0 ? (
              <tr>
                <td colSpan="4" className="enterprise-table-td text-center py-12 text-[var(--text3)]">
                  All compliance objectives are 100% active. Zero exceptions found!
                </td>
              </tr>
            ) : (
              escalations.map((esc) => (
                <tr 
                  key={esc.id} 
                  onClick={() => setSelectedEsc(esc)}
                  className="enterprise-table-tr border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface2)] transition cursor-pointer"
                >
                  <td className="enterprise-table-td">
                    <div className="font-semibold text-[13.5px] text-[var(--text1)]">{esc.profiles?.name || "Corporate Profile"}</div>
                    <div className="text-[11.5px] text-[var(--text2)] mt-0.5">{esc.profiles?.department || "Operations"}</div>
                  </td>
                  <td className="enterprise-table-td">
                    <span className="badge badge-red capitalize flex items-center gap-1.5 w-fit">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {esc.escalation_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="enterprise-table-td font-mono text-[13px] text-[var(--red)] font-semibold">
                    {esc.days_overdue} days overdue
                  </td>
                  <td className="enterprise-table-td text-right">
                    <button className="enterprise-btn-secondary px-3 py-1.5 text-[12px] rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition">
                      Review Issue
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- SLIDING COMPLIANCE DRAWER OVERLAY --- */}
      {selectedEsc && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSelectedEsc(null)}
        >
          {/* Drawer Panel */}
          <div 
            className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl p-6 overflow-y-auto transform translate-x-0 transition-transform duration-300 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'var(--text1)' }}
          >
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-6">
                <div>
                  <span className="text-[11px] text-[var(--red)] font-semibold uppercase tracking-wider block">Compliance Exception</span>
                  <h3 className="text-[18px] font-bold mt-1">Intervention Panel</h3>
                </div>
                <button 
                  onClick={() => setSelectedEsc(null)}
                  className="text-text3 hover:text-text1 p-1 hover:bg-[var(--surface2)] rounded-md transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Violator Profile Section */}
              {employeeProfile ? (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[var(--red-bg)] text-[var(--red)] flex items-center justify-center font-bold text-[14px] border border-rgba(224,92,92,0.1)">
                        {employeeProfile.avatar || "EP"}
                      </div>
                      <div>
                        <h4 className="text-[14.5px] font-bold">{employeeProfile.name}</h4>
                        <p className="text-[12px] text-[var(--text2)]">{employeeProfile.designation} · {employeeProfile.department}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[var(--border)] text-[12.5px] text-[var(--text2)]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[var(--text3)]" /> 
                        <span>Tenure: <strong>{employeeProfile.tenure}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--text3)]" /> 
                        <span>Location: <strong>{employeeProfile.location.split(',')[0]}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Violator Goals list */}
                  <div>
                    <h4 className="text-[13px] font-bold text-[var(--text2)] uppercase tracking-wider mb-2">Q1 Goals Drafts</h4>
                    {goalsLoading ? (
                      <div className="flex items-center gap-2 text-[12.5px] text-[var(--text3)] py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Loading goals...
                      </div>
                    ) : employeeGoals.length === 0 ? (
                      <p className="text-[12.5px] text-[var(--text3)] italic py-2">No goals have been initiated by this employee yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {employeeGoals.map((goal) => (
                          <div key={goal.id} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface3)] text-[12.5px]">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold truncate">{goal.title}</span>
                              <span className={cn(
                                "badge text-[10px] scale-90",
                                goal.status === 'approved' ? "badge-green" : goal.status === 'submitted' ? "badge-blue" : "badge-neutral"
                              )}>
                                {goal.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[var(--text2)] mt-1.5">
                              <span>Weight: {goal.weightage}%</span>
                              <span>Progress: {goal.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dispatch Warning Composer */}
                  <div className="pt-4 border-t border-[var(--border)]">
                    <h4 className="text-[13px] font-bold text-[var(--text2)] uppercase tracking-wider mb-3">Nudge Warning Dispatcher</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11.5px] text-[var(--text2)] block mb-1">Select Warning Template</label>
                        <select 
                          value={selectedTemplate}
                          onChange={(e) => handleTemplateChange(e.target.value)}
                          className="form-select text-[12.5px]"
                        >
                          <option value="warning">Template: Gentle Nudge Reminder</option>
                          <option value="alert">Template: URGENT RED ALERT</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11.5px] text-[var(--text2)] block mb-1">Custom dispatch message</label>
                        <textarea 
                          rows={3}
                          value={nudgeMessage}
                          onChange={(e) => setNudgeMessage(e.target.value)}
                          className="form-textarea text-[12.5px] font-sans"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
                </div>
              )}
            </div>

            {/* Drawer Actions Footer */}
            <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border)] mt-6">
              <button 
                onClick={() => handleAction("nudge")}
                disabled={actioning || !employeeProfile}
                className="tb-btn tb-btn-primary py-2.5 w-full flex items-center justify-center gap-2 text-[13px] font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
                {actioning ? "Sending..." : "Send Custom Nudge Warning"}
              </button>

              <button 
                onClick={() => handleAction("override")}
                disabled={actioning || !employeeProfile}
                className="tb-btn tb-btn-ghost py-2.5 w-full flex items-center justify-center gap-2 text-[13px] font-semibold border-[var(--border3)] hover:border-[var(--blue)] hover:text-[var(--blue)] hover:bg-[var(--blue-bg)] transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                {actioning ? "Processing..." : "Direct Administrative Bypass & Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

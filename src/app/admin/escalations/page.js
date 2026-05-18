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
  UserCheck,
  Settings2,
  History,
  AlertCircle,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EscalationsPage() {
  const [activeTab, setActiveTab] = useState("queue"); // "queue" | "rules" | "history"
  const [allEscalations, setAllEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEsc, setSelectedEsc] = useState(null); // Active escalation selected for drawer
  
  // Rules Config state
  const [rules, setRules] = useState({
    goal_submission_days: 10,
    manager_approval_days: 7,
    checkin_completion_days: 15,
    chain_intervals_days: 5
  });
  const [rulesLoading, setRulesLoading] = useState(false);

  // Drawer states
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [employeeGoals, setEmployeeGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("warning"); // 'warning' | 'alert'
  const [nudgeMessage, setNudgeMessage] = useState("");
  const [actioning, setActioning] = useState(false);

  // Template message configs
  const templates = {
    warning: "Hi {name}, your Q1 goals have not been finalized yet. Please check your dashboard and submit today.",
    alert: "URGENT NOTICE: Hi {name}, your performance Q1 goals are currently overdue. Please submit immediately to prevent talent cycle blockages."
  };

  async function loadEscalations() {
    try {
      const res = await fetch('/api/escalations');
      if (res.ok) {
        const data = await res.json();
        setAllEscalations(data || []);
      }
    } catch (err) {
      console.error("Error loading escalations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadRules() {
    setRulesLoading(true);
    try {
      const res = await fetch('/api/escalations/rules');
      if (res.ok) {
        const data = await res.json();
        if (data) setRules(data);
      }
    } catch (err) {
      console.error("Error loading rules:", err);
    } finally {
      setRulesLoading(false);
    }
  }

  useEffect(() => {
    loadEscalations();
    loadRules();
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

  const handleSaveRules = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating rules and sweeping organization...");
    try {
      const res = await fetch('/api/escalations/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules)
      });
      if (res.ok) {
        toast.success("Compliance rules updated & database sweep triggered!", { id: toastId });
        await loadEscalations();
      } else {
        toast.error("Failed to update compliance rules.", { id: toastId });
      }
    } catch (err) {
      console.error("Error saving rules:", err);
      toast.error("An error occurred.", { id: toastId });
    }
  };

  const activeEscalations = allEscalations.filter(e => !e.resolved);
  const resolvedEscalations = allEscalations.filter(e => e.resolved);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  // Get active chain level helper
  const getChainLevelText = (level) => {
    switch (level) {
      case 3: return "Level 3: Skip‑Level & HR Escalated";
      case 2: return "Level 2: Manager Nudged";
      default: return "Level 1: Employee Alerted";
    }
  };

  const getChainLevelBadgeClass = (level) => {
    switch (level) {
      case 3: return "bg-red-500/20 text-red-400 border border-red-500/30";
      case 2: return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      default: return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    }
  };

  return (
    <div className="p-6 space-y-6 relative min-h-screen bg-[var(--bg)]">
      {/* Banner */}
      <div className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,rgba(200,240,96,0.08),rgba(245,158,11,0.06),rgba(255,255,255,0.01))] p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(200,240,96,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_35%)]" />
        <div className="relative z-[1] max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text2)] mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-[#c8f060]" /> Compliance control center
          </div>
          <h2 className="text-[28px] font-semibold text-[var(--text1)] tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-[var(--red)]" />
            Compliance Exceptions & Escalations
          </h2>
          <p className="text-[13.5px] text-[var(--text2)] mt-2 max-w-xl">Configure automated rule thresholds, audit overdue actions, track the multi-stage escalation chain, and review intervention histories.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] gap-6">
        <button
          onClick={() => setActiveTab("queue")}
          className={cn(
            "pb-3 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2",
            activeTab === "queue" ? "border-[#c8f060] text-white" : "border-transparent text-[var(--text3)] hover:text-white"
          )}
        >
          <AlertCircle size={15} /> Active Exceptions ({activeEscalations.length})
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={cn(
            "pb-3 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2",
            activeTab === "rules" ? "border-[#c8f060] text-white" : "border-transparent text-[var(--text3)] hover:text-white"
          )}
        >
          <Settings2 size={15} /> Escalation Rules Config
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "pb-3 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2",
            activeTab === "history" ? "border-[#c8f060] text-white" : "border-transparent text-[var(--text3)] hover:text-white"
          )}
        >
          <History size={15} /> Resolution Log ({resolvedEscalations.length})
        </button>
      </div>

      {/* Stat Cards Row */}
      {activeTab !== "rules" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[var(--red-bg)] text-[var(--red)] flex items-center justify-center font-bold text-[13px] border border-[rgba(224,92,92,0.1)]">
              {activeEscalations.length}
            </div>
            <div>
              <span className="text-[11px] text-[var(--text3)] uppercase tracking-wider block">Open Exceptions</span>
              <span className="text-[14px] font-bold">{activeEscalations.length} Active Targets</span>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[var(--amber-bg)] text-[var(--amber)] flex items-center justify-center font-bold text-[13px] border border-[rgba(232,168,58,0.1)]">
              {activeEscalations.filter(e => e.chain_level === 2).length}
            </div>
            <div>
              <span className="text-[11px] text-[var(--text3)] uppercase tracking-wider block">Level 2 Alerts</span>
              <span className="text-[14px] font-bold">{activeEscalations.filter(e => e.chain_level === 2).length} Active Manager Nudges</span>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[var(--blue-bg)] text-[var(--blue)] flex items-center justify-center font-bold text-[13px] border border-[rgba(91,156,246,0.1)]">
              {activeEscalations.filter(e => e.chain_level === 3).length}
            </div>
            <div>
              <span className="text-[11px] text-[var(--text3)] uppercase tracking-wider block">Level 3 (HR Stage)</span>
              <span className="text-[14px] font-bold">{activeEscalations.filter(e => e.chain_level === 3).length} Critical Breaches</span>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 1: ACTIVE EXCEPTIONS QUEUE --- */}
      {activeTab === "queue" && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[12.5px] text-[var(--text2)] shadow-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              Click on any row to open the Intervention Panel drawer where you can view goal details, dispatch warning messages, or administratively bypass review locks.
            </div>
            <span className="badge badge-red w-fit font-semibold">{activeEscalations.length} unresolved exception{activeEscalations.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
                  <th className="enterprise-table-th">Employee / Corporate Profile</th>
                  <th className="enterprise-table-th">Overdue Violation Category</th>
                  <th className="enterprise-table-th">Escalation Stage Level</th>
                  <th className="enterprise-table-th">Duration Overdue</th>
                  <th className="enterprise-table-th text-right">Intervene</th>
                </tr>
              </thead>
              <tbody>
                {activeEscalations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="enterprise-table-td text-center py-12 text-[var(--text3)]">
                      All compliance objectives are met. Zero exceptions found!
                    </td>
                  </tr>
                ) : (
                  activeEscalations.map((esc) => (
                    <tr 
                      key={esc.id} 
                      onClick={() => setSelectedEsc(esc)}
                      className="enterprise-table-tr border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface2)] transition cursor-pointer"
                    >
                      <td className="enterprise-table-td">
                        <div className="font-semibold text-[13.5px] text-[var(--text1)]">{esc.profiles?.name || "Employee Profile"}</div>
                        <div className="text-[11.5px] text-[var(--text2)] mt-0.5">{esc.profiles?.department || "Corporate"}</div>
                      </td>
                      <td className="enterprise-table-td">
                        <span className="badge badge-red capitalize flex items-center gap-1.5 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          {esc.escalation_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="enterprise-table-td">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10.5px] font-bold block w-fit", getChainLevelBadgeClass(esc.chain_level || 1))}>
                          {getChainLevelText(esc.chain_level || 1)}
                        </span>
                      </td>
                      <td className="enterprise-table-td font-mono text-[13px] text-[var(--red)] font-bold">
                        {esc.days_overdue} days
                      </td>
                      <td className="enterprise-table-td text-right">
                        <button className="enterprise-btn-secondary px-3 py-1.5 text-[12px] rounded hover:border-[#c8f060] hover:text-[#c8f060] transition">
                          Review Issue
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: CONFIGURABLE ESCALATION RULES --- */}
      {activeTab === "rules" && (
        <form onSubmit={handleSaveRules} className="max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-[16px] font-bold text-white">Rule-Based Compliance Thresholds</h3>
            <p className="text-[12.5px] text-[var(--text3)] mt-1">Fine-tune overdue durations (N days) and trigger intervals. Saving changes sweeps active cycles instantly.</p>
          </div>

          {rulesLoading ? (
            <div className="flex items-center gap-2 text-[13px] py-12 text-[var(--text3)] justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" /> Loading current parameters...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--text2)] block">
                    Employee Goal Submission (Days)
                  </label>
                  <p className="text-[11px] text-[var(--text3)]">Days allowed for submission from cycle start</p>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={rules.goal_submission_days}
                    onChange={(e) => setRules({ ...rules, goal_submission_days: parseInt(e.target.value) || 1 })}
                    className="form-input text-[13px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--text2)] block">
                    Manager Goal Approval (Days)
                  </label>
                  <p className="text-[11px] text-[var(--text3)]">Days manager has to review and approve submission</p>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={rules.manager_approval_days}
                    onChange={(e) => setRules({ ...rules, manager_approval_days: parseInt(e.target.value) || 1 })}
                    className="form-input text-[13px]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--text2)] block">
                    Check-in Completion Window (Days)
                  </label>
                  <p className="text-[11px] text-[var(--text3)]">Days allowed to submit check-ins inside open quarter</p>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={rules.checkin_completion_days}
                    onChange={(e) => setRules({ ...rules, checkin_completion_days: parseInt(e.target.value) || 1 })}
                    className="form-input text-[13px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--text2)] block">
                    Auto-Escalation Interval Chain (Days)
                  </label>
                  <p className="text-[11px] text-[var(--text3)]">Days between escalation levels (Level 1 &rarr; 2 &rarr; 3)</p>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={rules.chain_intervals_days}
                    onChange={(e) => setRules({ ...rules, chain_intervals_days: parseInt(e.target.value) || 1 })}
                    className="form-input text-[13px]"
                    required
                  />
                </div>
              </div>

              {/* Graphic Flow Representation */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface2)] mt-6">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text3)] mb-3">Calculated Escalation Progression Flow</h4>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 text-[12px]">
                  <div className="p-3 rounded bg-[var(--surface3)] border border-[var(--border)] text-center w-full">
                    <div className="font-bold text-white">Level 1 Alert</div>
                    <div className="text-[10px] text-[var(--text2)] mt-1 font-mono">1 to {rules.chain_intervals_days} Days Overdue</div>
                    <div className="text-[9px] text-[#c8f060] mt-1">To: Employee</div>
                  </div>
                  <div className="text-white hidden sm:block">&rarr;</div>
                  <div className="p-3 rounded bg-[var(--surface3)] border border-[var(--border)] text-center w-full">
                    <div className="font-bold text-white">Level 2 Alert</div>
                    <div className="text-[10px] text-[var(--text2)] mt-1 font-mono">{rules.chain_intervals_days + 1} to {rules.chain_intervals_days * 2} Days</div>
                    <div className="text-[9px] text-[#c8f060] mt-1">To: Manager + Emp</div>
                  </div>
                  <div className="text-white hidden sm:block">&rarr;</div>
                  <div className="p-3 rounded bg-[var(--surface3)] border border-[var(--border)] text-center w-full">
                    <div className="font-bold text-white">Level 3 Alert</div>
                    <div className="text-[10px] text-[var(--text2)] mt-1 font-mono">{rules.chain_intervals_days * 2 + 1}+ Days</div>
                    <div className="text-[9px] text-[var(--red)] mt-1">To: Skip-Level & HR</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--border)]">
                <button
                  type="submit"
                  className="tb-btn tb-btn-primary px-5 py-2.5 text-[13px] font-bold"
                >
                  Save Configuration Changes
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* --- TAB 3: AUDIT RESOLUTION LOG --- */}
      {activeTab === "history" && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[12.5px] text-[var(--text2)] shadow-sm flex items-center justify-between">
            <div>
              This log represents an immutable administrative record of compliance interventions. It tracks manual overrides and triggered nudges.
            </div>
            <span className="badge badge-neutral w-fit font-mono">{resolvedEscalations.length} records</span>
          </div>

          <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
                  <th className="enterprise-table-th">Target Profile</th>
                  <th className="enterprise-table-th">Intervention Type</th>
                  <th className="enterprise-table-th">Final Breach Days</th>
                  <th className="enterprise-table-th">Resolution State</th>
                  <th className="enterprise-table-th text-right">Audited Time</th>
                </tr>
              </thead>
              <tbody>
                {resolvedEscalations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="enterprise-table-td text-center py-12 text-[var(--text3)]">
                      No historical compliance overrides logged yet.
                    </td>
                  </tr>
                ) : (
                  resolvedEscalations.map((esc) => (
                    <tr 
                      key={esc.id} 
                      className="border-b border-[var(--border)] last:border-b-0 text-[13.5px] bg-[#0c0c0c]"
                    >
                      <td className="enterprise-table-td">
                        <div className="font-semibold text-white">{esc.profiles?.name || "Corporate User"}</div>
                        <div className="text-[11px] text-[var(--text3)] mt-0.5">{esc.profiles?.department || "Corporate"}</div>
                      </td>
                      <td className="enterprise-table-td capitalize text-[var(--text2)]">
                        {esc.escalation_type.replace(/_/g, ' ')}
                      </td>
                      <td className="enterprise-table-td font-mono font-bold text-[var(--text2)]">
                        {esc.days_overdue} days overdue
                      </td>
                      <td className="enterprise-table-td">
                        <span className="badge badge-green flex items-center gap-1 w-fit text-[11px] font-semibold">
                          <CheckCircle className="w-3 h-3 text-[#9bc85c]" /> Approved / Nudged
                        </span>
                      </td>
                      <td className="enterprise-table-td text-right text-[var(--text3)] font-mono text-[11.5px]">
                        {new Date(esc.created_at || Date.now()).toLocaleDateString()} {new Date(esc.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  className="text-[var(--text3)] hover:text-[var(--text1)] p-1 hover:bg-[var(--surface2)] rounded-md transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Violator Profile Section */}
              {employeeProfile ? (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[var(--red-bg)] text-[var(--red)] flex items-center justify-center font-bold text-[14px] border border-[rgba(224,92,92,0.1)]">
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
                        <span>Location: <strong>{employeeProfile.location?.split(',')[0] || 'Remote'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Stage Visual Escalation Chain Stage */}
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[#0e0e0e]">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text3)] mb-3">Multi-Stage Active Chain Step</h4>
                    
                    <div className="relative flex justify-between items-center text-center">
                      <div className="absolute top-[10px] left-[5%] right-[5%] h-0.5 bg-[var(--border)] z-0" />
                      <div 
                        className="absolute top-[10px] left-[5%] h-0.5 bg-[#c8f060] z-0 transition-all duration-500" 
                        style={{ width: selectedEsc.chain_level === 3 ? "90%" : selectedEsc.chain_level === 2 ? "45%" : "0%" }}
                      />
                      
                      <div className="relative z-[1] flex flex-col items-center">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition",
                          selectedEsc.chain_level >= 1 ? "bg-[#c8f060] text-black border-[#c8f060]" : "bg-black text-[var(--text3)] border-[var(--border)]"
                        )}>
                          1
                        </div>
                        <span className="text-[9px] font-semibold text-white mt-1.5">Emp Alert</span>
                      </div>

                      <div className="relative z-[1] flex flex-col items-center">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition",
                          selectedEsc.chain_level >= 2 ? "bg-[#c8f060] text-black border-[#c8f060]" : "bg-black text-[var(--text3)] border-[var(--border)]"
                        )}>
                          2
                        </div>
                        <span className="text-[9px] font-semibold text-white mt-1.5">Mgr Nudge</span>
                      </div>

                      <div className="relative z-[1] flex flex-col items-center">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition",
                          selectedEsc.chain_level >= 3 ? "bg-red-500 text-black border-red-500" : "bg-black text-[var(--text3)] border-[var(--border)]"
                        )}>
                          3
                        </div>
                        <span className="text-[9px] font-semibold text-white mt-1.5">HR Action</span>
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

"use client";

import { useState, useEffect } from "react";
import { Mail, MessageSquare, Terminal, Bell, X, RefreshCw, Send, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NotificationHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("outlook"); // "outlook" | "teams" | "triggers"
  const [notifications, setNotifications] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [filterEmail, setFilterEmail] = useState("all");
  const [selectedMail, setSelectedMail] = useState(null);
  
  // Custom mock trigger state
  const [triggerType, setTriggerType] = useState("goal_submitted");
  const [selectedUser, setSelectedUser] = useState("");
  const [customMsg, setCustomMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // Load all notifications and profiles for mock trigger drop-downs
  const loadData = async () => {
    try {
      const resNotif = await fetch("/api/notifications?all=true");
      if (resNotif.ok) {
        const data = await resNotif.json();
        setNotifications(data || []);
      }
      
      const resProfiles = await fetch("/api/profiles?all=true");
      if (resProfiles.ok) {
        const data = await resProfiles.json();
        setProfiles(data || []);
        if (data && data.length > 0) {
          setSelectedUser(data[0].email);
        }
      }
    } catch (error) {
      console.error("Error loading simulator hub data:", error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleDeepLink = (link) => {
    if (link) {
      router.push(link);
      setIsOpen(false);
      toast.success("Navigated straight via deep-link!");
    }
  };

  // Submit simulated custom alerts
  const handleTriggerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    const toastId = toast.loading("Simulating event...");
    try {
      const targetUser = profiles.find(p => p.email === selectedUser);
      let subject = "Alert notification";
      let body = customMsg || "Simulated notification message.";
      
      if (triggerType === "checkin_reminder") {
        subject = "[Email] REMINDER: Submit Q1 performance check-in";
        body = `Dear ${targetUser.name},\n\nThis is a friendly reminder that your performance check-in rating for Q1 FY 2026-27 is pending. Please click the deep-link below to complete your check-in review sheet.`;
      } else if (triggerType === "goal_submitted") {
        subject = `[Email] Performance Goal Submission: ${targetUser.name}`;
        body = `${targetUser.name} has submitted goals for the active Q1 FY 2026-27 cycle. Click the link to review and approve.`;
      } else if (triggerType === "escalated") {
        subject = `[Email] COMPLIANCE ESCALATION: Aryan Kumar - Overdue Goals`;
        body = `Urgent alert: Aryan Kumar's goals are 8 days overdue. Level 2 Escalation active (Nudged to Manager: Rahul Sharma).`;
      }

      // 1. Send simulated Email
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: targetUser.id,
          recipientEmail: targetUser.email,
          type: "email",
          event: triggerType,
          subject,
          body,
          deepLink: triggerType === "goal_submitted" ? `/manager/team/${targetUser.id}` : `/employee/goals`
        })
      });

      // 2. Send simulated Teams Adaptive Card
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: targetUser.id,
          recipientEmail: targetUser.email,
          type: "teams",
          event: triggerType,
          subject: subject.replace("[Email]", "[MS Teams]"),
          body: body.replace("Dear ", ""),
          deepLink: triggerType === "goal_submitted" ? `/manager/team/${targetUser.id}` : `/employee/goals`
        })
      });

      toast.success("Simulation dispatched successfully!", { id: toastId });
      setCustomMsg("");
      loadData();
    } catch (err) {
      toast.error("Failed to run simulation.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filterEmail === "all") return true;
    return n.recipient_email?.toLowerCase() === filterEmail.toLowerCase();
  });

  const unreadCount = filteredNotifs.filter(n => !n.is_read).length;

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 999999, fontFamily: "var(--font-sans)" }}>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: "linear-gradient(135deg, #c8f060 0%, #a2d216 100%)",
            color: "#050505",
            border: "none",
            borderRadius: "50px",
            padding: "12px 20px",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 32px rgba(200, 240, 96, 0.3)",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="hover:scale-105"
        >
          <Bell size={16} className="animate-bounce" />
          Integration Sim
          {notifications.length > 0 && (
            <span style={{
              background: "#ff4d4f",
              color: "white",
              borderRadius: "10px",
              padding: "2px 6px",
              fontSize: "9px",
              fontWeight: "700"
            }}>
              {notifications.length}
            </span>
          )}
        </button>
      )}

      {/* Main Drawer Simulator */}
      {isOpen && (
        <div style={{
          width: "480px",
          height: "600px",
          backgroundColor: "#0d0d0d",
          border: "1px solid #1e1e1e",
          borderRadius: "16px",
          boxShadow: "0 16px 64px rgba(0,0,0,0.85)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "all 0.3s ease",
          animation: "slideIn 0.3s ease-out"
        }}>
          {/* Header */}
          <div style={{
            padding: "16px",
            borderBottom: "1px solid #1a1a1a",
            background: "#080808",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                <Terminal size={14} className="text-[#c8f060]" /> Integration & Compliance Simulator
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#666" }}>Audit and inspect simulated Emails and Teams notifications</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button 
                onClick={loadData}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
                className="hover:text-white"
                title="Refresh logs"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
                className="hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: "flex",
            background: "#0a0a0a",
            borderBottom: "1px solid #1a1a1a"
          }}>
            <button
              onClick={() => { setActiveTab("outlook"); setSelectedMail(null); }}
              style={{
                flex: 1,
                padding: "10px 0",
                background: activeTab === "outlook" ? "#0d0d0d" : "transparent",
                border: "none",
                color: activeTab === "outlook" ? "#c8f060" : "#666",
                fontSize: "11px",
                fontWeight: "600",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                borderBottom: activeTab === "outlook" ? "2px solid #c8f060" : "none"
              }}
            >
              <Mail size={12} /> Outlook Mailroom
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              style={{
                flex: 1,
                padding: "10px 0",
                background: activeTab === "teams" ? "#0d0d0d" : "transparent",
                border: "none",
                color: activeTab === "teams" ? "#c8f060" : "#666",
                fontSize: "11px",
                fontWeight: "600",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                borderBottom: activeTab === "teams" ? "2px solid #c8f060" : "none"
              }}
            >
              <MessageSquare size={12} /> MS Teams Client
            </button>
            <button
              onClick={() => setActiveTab("triggers")}
              style={{
                flex: 1,
                padding: "10px 0",
                background: activeTab === "triggers" ? "#0d0d0d" : "transparent",
                border: "none",
                color: activeTab === "triggers" ? "#c8f060" : "#666",
                fontSize: "11px",
                fontWeight: "600",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                borderBottom: activeTab === "triggers" ? "2px solid #c8f060" : "none"
              }}
            >
              <Terminal size={12} /> Trigger Events
            </button>
          </div>

          {/* Filter Dropdown */}
          {activeTab !== "triggers" && (
            <div style={{
              padding: "10px 16px",
              background: "#080808",
              borderBottom: "1px solid #1a1a1a",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <label style={{ fontSize: "10px", color: "#666", fontWeight: "600" }}>Recipient Filter:</label>
              <select
                value={filterEmail}
                onChange={(e) => { setFilterEmail(e.target.value); setSelectedMail(null); }}
                style={{
                  background: "#141414",
                  border: "1px solid #222",
                  color: "#aaa",
                  borderRadius: "4px",
                  fontSize: "10px",
                  padding: "4px 8px",
                  outline: "none"
                }}
              >
                <option value="all">All Corporate Users</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.email}>{p.name} ({p.role})</option>
                ))}
              </select>
            </div>
          )}

          {/* Tab Contents Container */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#0d0d0d" }}>
            
            {/* 1. Outlook Simulator */}
            {activeTab === "outlook" && (
              <div style={{ height: "100%" }}>
                {!selectedMail ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filteredNotifs.filter(n => n.type === "email").length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "#444", fontSize: "12px" }}>
                        <Mail size={24} style={{ marginBottom: "8px", opacity: 0.3 }} />
                        No emails sent in this category yet.
                      </div>
                    ) : (
                      filteredNotifs.filter(n => n.type === "email").map(mail => (
                        <div
                          key={mail.id}
                          onClick={() => setSelectedMail(mail)}
                          style={{
                            padding: "12px",
                            background: "#121212",
                            border: "1px solid #1a1a1a",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          className="hover:border-[#c8f060]"
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "10px", fontWeight: "700", color: "#c8f060" }}>
                              TO: {mail.recipient_email}
                            </span>
                            <span style={{ fontSize: "9px", color: "#444" }}>
                              {new Date(mail.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#eee", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {mail.subject}
                          </div>
                          <div style={{ fontSize: "10px", color: "#666", marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {mail.body}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* Expanded Mail View */
                  <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "16px" }}>
                    <button
                      onClick={() => setSelectedMail(null)}
                      style={{ background: "none", border: "none", color: "#c8f060", fontSize: "10px", fontWeight: "600", cursor: "pointer", marginBottom: "12px" }}
                    >
                      &larr; Back to inbox
                    </button>
                    
                    <div style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "12px", marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#666" }}><strong>From:</strong> performance-engine@atomquest.com</div>
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}><strong>To:</strong> {selectedMail.recipient_email}</div>
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}><strong>Date:</strong> {new Date(selectedMail.created_at).toLocaleString()}</div>
                      <h4 style={{ margin: "10px 0 0 0", fontSize: "14px", fontWeight: "700", color: "white" }}>
                        {selectedMail.subject}
                      </h4>
                    </div>

                    <div style={{
                      fontSize: "12px",
                      color: "#aaa",
                      lineHeight: "1.6",
                      whiteSpace: "pre-line",
                      background: "#0c0c0c",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #151515"
                    }}>
                      {selectedMail.body}
                    </div>

                    {selectedMail.deep_link && (
                      <button
                        onClick={() => handleDeepLink(selectedMail.deep_link)}
                        style={{
                          marginTop: "16px",
                          width: "100%",
                          background: "#c8f060",
                          color: "#000",
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        Action Portal Link &rarr;
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. Teams Client Simulator */}
            {activeTab === "teams" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredNotifs.filter(n => n.type === "teams").length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#444", fontSize: "12px" }}>
                    <MessageSquare size={24} style={{ marginBottom: "8px", opacity: 0.3 }} />
                    No Teams messages received yet.
                  </div>
                ) : (
                  filteredNotifs.filter(n => n.type === "teams").map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        padding: "14px",
                        background: "#16151b",
                        border: "1px solid #2f2a3f",
                        borderRadius: "10px",
                        position: "relative"
                      }}
                    >
                      {/* MS Teams Style Bot Header */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", borderBottom: "1px solid #2f2a3f", paddingBottom: "8px" }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: "#5b5fc7", color: "white", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", justifyCenter: "center" }}>
                          AQ
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#ffffff" }}>AtomQuest Performance Bot</div>
                          <div style={{ fontSize: "8px", color: "#777" }}>Official Adaptive Card App</div>
                        </div>
                        <span style={{ fontSize: "8px", color: "#777", marginLeft: "auto" }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* Adaptive Card Details */}
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", marginBottom: "6px" }}>
                        {msg.subject}
                      </div>
                      
                      <div style={{ fontSize: "11px", color: "#b9b9c9", lineHeight: "1.4", marginBottom: "12px" }}>
                        {msg.body}
                      </div>

                      {/* Deep-link Action Button */}
                      {msg.deep_link && (
                        <button
                          onClick={() => handleDeepLink(msg.deep_link)}
                          style={{
                            background: "#5b5fc7",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "6px 12px",
                            fontSize: "10px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          View Goal Sheet
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. Administrative Triggers Panel */}
            {activeTab === "triggers" && (
              <form onSubmit={handleTriggerSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{
                  padding: "10px",
                  background: "#161c10",
                  border: "1px solid #2a3c1a",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "#9bc85c",
                  lineHeight: "1.5"
                }}>
                  Use this screen to mock system-triggered operations (e.g. goals cycle reminders, check-in deadlines) and verify notifications immediately!
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#888" }}>Simulate Scenario</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                    style={{
                      background: "#141414",
                      border: "1px solid #222",
                      color: "#eee",
                      borderRadius: "6px",
                      fontSize: "12px",
                      padding: "8px",
                      outline: "none"
                    }}
                  >
                    <option value="goal_submitted">Employee submits a Goal</option>
                    <option value="checkin_reminder">Compliance sweep check-in reminder</option>
                    <option value="escalated">Compliance Rule Escalation (Level 2)</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#888" }}>Target User</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    style={{
                      background: "#141414",
                      border: "1px solid #222",
                      color: "#eee",
                      borderRadius: "6px",
                      fontSize: "12px",
                      padding: "8px",
                      outline: "none"
                    }}
                  >
                    {profiles.map(p => (
                      <option key={p.id} value={p.email}>{p.name} ({p.role})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#888" }}>Custom Remarks (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Overwrite default alert message content..."
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    style={{
                      background: "#141414",
                      border: "1px solid #222",
                      color: "#eee",
                      borderRadius: "6px",
                      fontSize: "12px",
                      padding: "8px",
                      outline: "none",
                      resize: "none"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: "linear-gradient(135deg, #c8f060 0%, #a2d216 100%)",
                    color: "#000000",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    marginTop: "8px"
                  }}
                >
                  <Send size={12} /> {isSubmitting ? "Firing..." : "Dispatch simulated scenario"}
                </button>
              </form>
            )}

          </div>

          {/* Footer Status */}
          <div style={{
            padding: "10px 16px",
            borderTop: "1px solid #1a1a1a",
            background: "#080808",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "9px",
            color: "#555"
          }}>
            <span>Environment: LOCAL_MOCK_SERVER</span>
            <span style={{ color: "#9bc85c" }}>● Online</span>
          </div>
        </div>
      )}
    </div>
  );
}

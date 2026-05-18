"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Edit3, 
  LogOut, 
  PanelLeftClose, 
  PanelLeftOpen,
  MoreVertical,
  X,
  User,
  Settings,
  Phone,
  MapPin,
  FileText,
  Save,
  Moon,
  Sun,
  Shield
} from "lucide-react";

export default function Sidebar({ role, user, userName, userInitials, refreshProfile }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [escalationsCount, setEscalationsCount] = useState(2); // seeded fallback
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'settings' | 'editDetails' | null

  // Edit details form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync form state when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditLocation(user.location || "");
      setEditBio(user.bio || "");
    }
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  // Poll for active exceptions dynamically in background
  useEffect(() => {
    async function loadEscalationsCount() {
      try {
        const res = await fetch('/api/escalations');
        if (res.ok) {
          const data = await res.json();
          const active = data.filter(e => !e.resolved).length;
          setEscalationsCount(active);
        }
      } catch (error) {
        console.error("Error loading escalations count:", error);
      }
    }
    
    loadEscalationsCount();
    const interval = setInterval(loadEscalationsCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    
    try {
      const res = await fetch('/api/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: editName,
          phone: editPhone,
          location: editLocation,
          bio: editBio
        })
      });

      if (res.ok) {
        toast.success("Profile details updated successfully!");
        if (refreshProfile) await refreshProfile();
        setActiveModal(null);
      } else {
        toast.error("Failed to save details. Please try again.");
      }
    } catch (err) {
      console.error("Save details error:", err);
      toast.error("An error occurred during save.");
    } finally {
      setSaving(false);
    }
  };

  const getNavItems = (role) => {
    switch (role) {
      case 'employee':
        return [
          { group: 'Overview', items: [
            { name: 'My dashboard', href: '/employee/dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
            { name: 'Create goal', href: '/employee/goals/new', icon: 'M12 5v14M5 12h14' },
          ]},
          { group: 'Activity', items: [
            { name: 'Q1 check-in', href: '/employee/checkins', icon: 'M22 12h-4l-3 9L9 3l-3 9H2', badge: 'Due' },
            { name: 'Manager feedback', href: '/employee/feedback', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
          ]}
        ];
      case 'manager':
        return [
          { group: 'Overview', items: [
            { name: 'Team dashboard', href: '/manager/dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
            { name: 'My team', href: '/manager/team', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
          ]},
          { group: 'Actions', items: [
            { name: 'Pending approvals', href: '/manager/dashboard', icon: 'M9 11l3 3L22 4' },
            { name: 'Check-in comments', href: '/manager/comments', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
            { name: 'Push shared goal', href: '/manager/shared', icon: 'M12 5v14M5 12h14' },
          ]}
        ];
      case 'admin':
        return [
          { group: 'Overview', items: [
            { name: 'Admin dashboard', href: '/admin/dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
            { name: 'Org hierarchy', href: '/admin/employees', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
          ]},
          { group: 'Management', items: [
            { 
              name: 'Escalations', 
              href: '/admin/escalations', 
              icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01', 
              badge: escalationsCount > 0 ? String(escalationsCount) : null 
            },
            { name: 'Audit trail', href: '/admin/audit', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
            { name: 'Export reports', href: '/admin/reports', icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' },
          ]},
          { group: 'Config', items: [
            { name: 'Cycle management', href: '/admin/cycles', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4l3 3' },
            { name: 'Goal unlock', href: '/admin/unlock', icon: 'M18 6L6 18M6 6l12 12' },
          ]}
        ];
      default:
        return [];
    }
  };

  const navGroups = getNavItems(role);

  return (
    <aside className={cn("sidebar", isCollapsed && "collapsed")}>
      <div className="sidebar-top">
        <div className="wordmark">
          <div className="wm-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {!isCollapsed && (
            <div style={{ flex: 1 }}>
              <div className="wm-text">GoalTrack</div>
              <div className="wm-sub">Atomberg · AY 2025–26</div>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sidebar-toggle-btn p-1.5 rounded-md text-text2 hover:text-text1"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </div>

      <nav>
        {navGroups.map((group, idx) => (
          <div key={idx} className="nav-group">
            <div className="nav-group-label">{group.group}</div>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className={cn("nav-link", isActive && "active")}>
                  <svg viewBox="0 0 24 24"><path d={item.icon} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>{item.name}</span>
                  {item.badge && !isCollapsed && (
                    <span className="nav-badge alert">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ position: 'relative' }}>
        {/* ChatGPT Style Profile Menu */}
        {isMenuOpen && (
          <div className="profile-popover" onClick={(e) => e.stopPropagation()}>
            <button className="popover-item" onClick={() => { setActiveModal('profile'); setIsMenuOpen(false); }}>
              <UserIcon size={14} />
              My Profile
            </button>
            <button className="popover-item" onClick={() => { setActiveModal('settings'); setIsMenuOpen(false); }}>
              <SettingsIcon size={14} />
              Settings
            </button>
            <button className="popover-item" onClick={() => { setActiveModal('editDetails'); setIsMenuOpen(false); }}>
              <Edit3 size={14} />
              Edit details
            </button>
            <div className="popover-divider" />
            <button className="popover-item text-red" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}

        <div 
          className="user-row" 
          style={{ cursor: 'pointer', padding: isCollapsed ? '0' : '12px 14px' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <div 
            className="u-ava" 
            style={{
              background: 'rgba(255,255,255,0.03)',
              color: 'var(--blue)',
              border: '1px solid var(--border)',
              margin: isCollapsed ? '0' : ''
            }}
          >
            {userInitials}
          </div>
          {!isCollapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="u-name" style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text1)' }}>{userName}</div>
                <div className="u-role-tag" style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>
                  {role === 'employee' ? (user?.designation || 'Designer') : role === 'manager' ? (user?.designation || 'Director') : 'System Admin'}
                </div>
              </div>
              <MoreVertical size={14} className="text-text3" />
            </>
          )}
        </div>
      </div>

      {/* --- GLASSMORPHIC FOOTER MODALS --- */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="w-full max-w-[480px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-6 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'var(--text1)' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-semibold flex items-center gap-2">
                {activeModal === 'profile' && <><User size={18} className="text-[var(--blue)]" /> Personal Profile</>}
                {activeModal === 'settings' && <><Settings size={18} className="text-[var(--accent)]" /> Portal Settings</>}
                {activeModal === 'editDetails' && <><Edit3 size={18} className="text-[var(--amber)]" /> Modify Details</>}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-text3 hover:text-text1 p-1 hover:bg-[var(--surface2)] rounded-md transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Modal */}
            {activeModal === 'profile' && user && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--surface2)] border border-[var(--border)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--blue-bg)] text-[var(--blue)] flex items-center justify-center font-bold text-[18px] border border-[var(--border)]">
                    {userInitials}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold">{user.name}</h4>
                    <p className="text-[12.5px] text-[var(--text2)]">{user.designation} · {user.department}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4 text-[13.5px]">
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-[var(--text3)] flex-shrink-0" />
                    <span className="text-[var(--text2)] w-20">Email:</span>
                    <span className="font-mono">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-[var(--text3)] flex-shrink-0" />
                    <span className="text-[var(--text2)] w-20">Phone:</span>
                    <span className="font-mono">{user.phone || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-[var(--text3)] flex-shrink-0" />
                    <span className="text-[var(--text2)] w-20">Location:</span>
                    <span>{user.location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield size={14} className="text-[var(--text3)] flex-shrink-0" />
                    <span className="text-[var(--text2)] w-20">Tenure:</span>
                    <span>{user.tenure || "N/A"}</span>
                  </div>
                  <div className="pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text2)] block mb-1">Biography:</span>
                    <p className="p-3 rounded bg-[var(--surface3)] text-[12.5px] text-[var(--text2)] leading-relaxed italic">
                      {user.bio || "No employee biography specified."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Modal */}
            {activeModal === 'settings' && (
              <div className="space-y-5">
                <div>
                  <label className="text-[13px] font-medium text-[var(--text2)] block mb-2">Interface Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setTheme('dark')}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg border text-[13px] font-medium transition",
                        theme === 'dark' 
                          ? "bg-[var(--accent-bg)] border-[var(--accent)] text-[var(--accent)]" 
                          : "bg-[var(--surface2)] border-[var(--border)] hover:bg-[var(--surface3)]"
                      )}
                    >
                      <Moon size={14} />
                      Dark Mode
                    </button>
                    <button 
                      onClick={() => setTheme('light')}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg border text-[13px] font-medium transition",
                        theme === 'light' 
                          ? "bg-[var(--accent-bg)] border-[var(--accent)] text-[var(--accent)]" 
                          : "bg-[var(--surface2)] border-[var(--border)] hover:bg-[var(--surface3)]"
                      )}
                    >
                      <Sun size={14} />
                      Light Mode
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13.5px] font-medium block">Desktop Notifications</span>
                      <span className="text-[11px] text-[var(--text3)]">Get live compliance exceptions alerts</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--accent)]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13.5px] font-medium block">Weekly Digests</span>
                      <span className="text-[11px] text-[var(--text3)]">Performance summary report mailer</span>
                    </div>
                    <input type="checkbox" className="w-4 h-4 accent-[var(--accent)]" />
                  </div>
                </div>
              </div>
            )}

            {/* Edit Details Modal */}
            {activeModal === 'editDetails' && (
              <form onSubmit={handleSaveDetails} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[12.5px] text-[var(--text2)] block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required 
                      className="form-input" 
                      placeholder="e.g. System Admin"
                    />
                  </div>
                  <div>
                    <label className="text-[12.5px] text-[var(--text2)] block mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="form-input" 
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="text-[12.5px] text-[var(--text2)] block mb-1">Office Location</label>
                    <input 
                      type="text" 
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="form-input" 
                      placeholder="e.g. Mumbai, India"
                    />
                  </div>
                  <div>
                    <label className="text-[12.5px] text-[var(--text2)] block mb-1">Short Biography</label>
                    <textarea 
                      rows={3} 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="form-textarea" 
                      placeholder="Share a short bio..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
                  <button 
                    type="button" 
                    onClick={() => setActiveModal(null)} 
                    className="tb-btn tb-btn-ghost px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="tb-btn tb-btn-primary px-4 py-2 flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

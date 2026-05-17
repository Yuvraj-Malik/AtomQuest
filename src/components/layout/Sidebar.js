"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { fetchManagerTeam } from "@/lib/data";
import { 
  Settings, 
  User, 
  Edit3, 
  LogOut, 
  ChevronLeft, 
  PanelLeftClose, 
  PanelLeftOpen,
  MoreVertical,
  Bell
} from "lucide-react";

export default function Sidebar({ role, userName, userInitials }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  // Fetch pending count dynamically from DB for Manager role
  useEffect(() => {
    async function loadPendingCount() {
      if (role === 'manager') {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const data = await fetchManagerTeam(user.id);
            const count = data.filter(member => 
              (member.goals || []).some(g => g.status === 'submitted')
            ).length;
            setPendingCount(count);
          }
        } catch (error) {
          console.error("Error loading pending count in sidebar:", error);
        }
      }
    }
    loadPendingCount();
    
    // Subscribe to goals table updates to refresh count in real-time
    const channel = supabase
      .channel('sidebar-goals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        loadPendingCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
            { name: 'Pending approvals', href: '/manager/dashboard', icon: 'M9 11l3 3L22 4', badge: pendingCount > 0 ? String(pendingCount) : null },
            { name: 'Check-in comments', href: '/manager/comments', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
            { name: 'Push shared goal', href: '/manager/shared', icon: 'M12 5v14M5 12h14' },
          ]}
        ];
      case 'admin':
        return [
          { group: 'Overview', items: [
            { name: 'Admin dashboard', href: '/admin/dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
            { name: 'Org hierarchy', href: '/admin/employees', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
          ]},
          { group: 'Management', items: [
            { name: 'Escalations', href: '/admin/escalations', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01', badge: '14' },
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
            className="sidebar-toggle-btn p-1.5 rounded-md"
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
            <div className="popover-item">
              <User />
              Profile
            </div>
            <div className="popover-item">
              <Settings />
              Settings
            </div>
            <div className="popover-item">
              <Edit3 />
              Edit details
            </div>
            <div className="popover-divider" />
            <div className="popover-item text-red" onClick={handleLogout}>
              <LogOut />
              Logout
            </div>
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
                  {role === 'employee' ? 'Sales Associate' : role === 'manager' ? 'Team Lead' : 'System Admin'}
                </div>
              </div>
              <MoreVertical size={14} className="text-text3" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

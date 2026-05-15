"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Target, CheckSquare, BarChart, Users, Settings, AlertTriangle, Lightbulb, Sun, Moon, Hexagon } from 'lucide-react';
import { useTheme } from 'next-themes';

const employeeLinks = [
  { name: 'My Goals', href: '/employee/goals', icon: Target },
  { name: 'Check-ins', href: '/employee/checkins', icon: CheckSquare },
];

const managerLinks = [
  { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
  { name: 'My Team', href: '/manager/team', icon: Users },
  { name: 'Check-ins', href: '/manager/checkins', icon: CheckSquare },
  { name: 'Reports', href: '/manager/reports', icon: BarChart },
];

const adminLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Cycles', href: '/admin/cycles', icon: Settings },
  { name: 'Employees', href: '/admin/employees', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Escalations', href: '/admin/escalations', icon: AlertTriangle },
  { name: 'Insights', href: '/admin/insights', icon: Lightbulb },
];

export function Sidebar({ role = 'employee' }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  let links = employeeLinks;
  let sectionLabel = 'WORKSPACE';
  if (role === 'manager') links = managerLinks;
  if (role === 'admin') {
    links = adminLinks;
    sectionLabel = 'ADMIN';
  }

  // Mock User Info
  const userName = "Yuvraj Malik";
  const userInitials = "YM";

  return (
    <div className="w-[240px] fixed left-0 top-0 h-full bg-surface border-r border-border flex flex-col z-10">
      
      {/* 1. App Name */}
      <div className="px-4 py-5 flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
          <path d="M12 2L2 12l10 10 10-10Z" />
        </svg>
        <span className="font-semibold text-[16px] text-primary">AtomQuest</span>
      </div>

      {/* 2. Thin Divider */}
      <div className="h-[1px] bg-border w-full" />

      {/* 3. User Info */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-[36px] h-[36px] rounded bg-subtle flex items-center justify-center text-primary text-sm font-medium border border-border">
          {userInitials}
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-medium text-primary leading-none mb-1">{userName}</span>
          <span className="text-[11px] text-secondary uppercase tracking-wider leading-none">{role}</span>
        </div>
      </div>

      {/* 4. Thin Divider */}
      <div className="h-[1px] bg-border w-full mb-4" />

      {/* 5. Nav Section Labels */}
      <div className="px-4 mb-2">
        <span className="text-[10px] uppercase tracking-[0.1em] text-tertiary font-medium">{sectionLabel}</span>
      </div>

      {/* 6. Nav Items */}
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md font-medium text-[14px] transition-all duration-150 cursor-pointer",
                  isActive 
                    ? "bg-accent-soft text-accent" 
                    : "text-secondary hover:bg-elevated hover:text-primary"
                )}
              >
                <Icon size={16} strokeWidth={1.5} className={cn(isActive ? "text-accent" : "opacity-80")} />
                {link.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 7. Spacer happens implicitly with flex-1 on nav */}

      {/* 8. Theme Toggle */}
      <div className="p-4 border-t border-border flex justify-between items-center">
        <span className="text-[12px] font-medium text-secondary">Theme</span>
        
        {/* Pill Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative w-[44px] h-[24px] rounded-full bg-subtle border border-border flex items-center px-1 transition-colors hover:bg-elevated"
        >
          <div 
            className={cn(
              "absolute w-[18px] h-[18px] rounded-full bg-surface border border-border flex items-center justify-center transition-transform duration-200",
              theme === 'dark' ? "translate-x-[20px]" : "translate-x-0"
            )}
          >
            {theme === 'dark' ? (
              <Moon size={12} strokeWidth={2} className="text-primary" />
            ) : (
              <Sun size={12} strokeWidth={2} className="text-primary" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

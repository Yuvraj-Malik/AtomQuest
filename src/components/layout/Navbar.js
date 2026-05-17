"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export default function Navbar({ role, userName }) {
  const pathname = usePathname();

  const getLinks = (role) => {
    switch (role) {
      case 'employee':
        return [
          { name: 'My Goals', href: '/employee/goals' },
          { name: 'Check-ins', href: '/employee/checkins' },
          { name: 'Progress', href: '/employee/progress' }
        ];
      case 'manager':
        return [
          { name: 'Dashboard', href: '/manager/dashboard' },
          { name: 'My Team', href: '/manager/team' },
          { name: 'Check-ins', href: '/manager/checkins' },
          { name: 'Reports', href: '/manager/reports' }
        ];
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/dashboard' },
          { name: 'Employees', href: '/admin/employees' },
          { name: 'Analytics', href: '/admin/analytics' },
          { name: 'Insights', href: '/admin/insights' },
          { name: 'Reports', href: '/admin/reports' }
        ];
      default:
        return [];
    }
  };

  const links = getLinks(role);
  const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  return (
    <nav className="h-[52px] w-full bg-[#111] border-b border-[#1e1e1e] flex items-center px-8 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mr-7">
        <div className="w-[26px] h-[26px] rounded-[6px] bg-accent-gradient flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 12l10 10 10-10Z" />
          </svg>
        </div>
        <span className="text-[14px] font-medium text-white">AtomQuest</span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div className={cn(
                "px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer",
                isActive 
                  ? "text-white bg-[#1e1e1e]" 
                  : "text-[#888] hover:text-[#ccc] hover:bg-[#1a1a1a]"
              )}>
                {link.name}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Cycle Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[11px] text-[#666]">
          Cycle: <span className="text-accent font-medium">FY 2025-26</span>
        </div>

        {/* Q1 Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1505] border border-[#3d2e00] text-[11px] font-medium text-[#f59e0b]">
          <Clock size={12} />
          Q1 Check-in Open
        </div>

        {/* Avatar */}
        <button className="w-[30px] h-[30px] rounded-full bg-accent-gradient flex items-center justify-center text-white text-[11px] font-medium border-none cursor-pointer">
          {initials}
        </button>
      </div>
    </nav>
  );
}

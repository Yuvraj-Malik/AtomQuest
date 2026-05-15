"use client";

import Link from "next/link";
import { Target } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center login-bg-dark dark:login-bg-dark light:login-bg-light transition-colors duration-200">
      <div className="w-[400px] bg-surface border border-border rounded-[14px] p-9 shadow-lg">
        
        {/* 1. Geometric diamond icon */}
        <div className="flex justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M12 2L2 12l10 10 10-10Z" />
          </svg>
        </div>

        {/* 2 & 3. Header text */}
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-semibold text-primary mb-2">Welcome back</h1>
          <p className="text-[14px] text-secondary">Sign in to continue</p>
        </div>

        {/* 5 & 6. Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[13px] font-medium text-primary mb-[6px]">Email</label>
            <input type="email" className="enterprise-input" placeholder="you@company.com" defaultValue="demo@atomquest.com" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-primary mb-[6px]">Password</label>
            <input type="password" className="enterprise-input" placeholder="••••••••" defaultValue="password123" />
          </div>
        </div>

        {/* 7. Sign In Button */}
        <button className="enterprise-btn w-full mb-6 py-3 text-[15px]">
          Sign In
        </button>

        {/* 8. Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-[1px] bg-border"></div>
          <span className="text-[12px] text-tertiary uppercase tracking-wider">or demo as</span>
          <div className="flex-1 h-[1px] bg-border"></div>
        </div>

        {/* 9. Ghost demo buttons */}
        <div className="flex justify-between gap-2">
          <Link href="/employee/goals" className="flex-1">
            <button className="enterprise-btn-ghost w-full text-[13px] py-2 rounded-md font-medium border border-border-strong hover:border-accent">
              Employee
            </button>
          </Link>
          <Link href="/manager/dashboard" className="flex-1">
            <button className="enterprise-btn-ghost w-full text-[13px] py-2 rounded-md font-medium border border-border-strong hover:border-accent">
              Manager
            </button>
          </Link>
          <Link href="/admin/dashboard" className="flex-1">
            <button className="enterprise-btn-ghost w-full text-[13px] py-2 rounded-md font-medium border border-border-strong hover:border-accent">
              Admin
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}

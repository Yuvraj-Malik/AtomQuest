"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchEmployeeGoals } from "@/lib/data";
import { Loader2, Plus } from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const data = await fetchEmployeeGoals(user.id);
          setGoals(data);
        }
      } catch (error) {
        console.error("Error loading goals:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="page-content">
      <div className="flex justify-between items-end mb-4">
        <div className="page-header">
          <h1 className="page-title">My Goals</h1>
          <p className="page-subtitle">Define and track your objectives for the current cycle.</p>
        </div>
        <Link href="/employee/goals/new">
          <button className="enterprise-btn">
            <Plus size={16} />
            Create new goal
          </button>
        </Link>
      </div>

      <div className="section-divider" />

      {/* Summary Stats (4-column grid) */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Weightage</div>
          <div className="stat-number">100%</div>
          <div className="stat-description">Across 4 goals</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Approved</div>
          <div className="stat-number">4</div>
          <div className="stat-description">Locked for cycle</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Q1 Actuals</div>
          <div className="stat-number">75%</div>
          <div className="stat-description">Partially filled</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Momentum</div>
          <div className="stat-number">12d</div>
          <div className="stat-description">Consistency streak</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-tertiary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const latestAchievement = goal.achievements?.[0];
            const progress = latestAchievement ? latestAchievement.computed_score || 0 : 0;

            return (
              <div key={goal.id} className={`enterprise-card goal-card ${goal.status} flex flex-col h-full`}>
                {/* 1. Top Row */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-[#555]">{goal.thrust_area}</span>
                  <div className={`status-badge ${goal.status}`}>
                    {goal.status}
                  </div>
                </div>

                {/* 2. Goal Title */}
                <h3 className="text-[14px] font-medium text-white leading-[1.4] mb-4 h-[40px] line-clamp-2">
                  {goal.title}
                </h3>
                
                {/* 3. Meta Row */}
                <div className="flex gap-4 text-[11px] text-[#555] mb-4">
                  <span>Weight: <strong className="text-white font-mono">{goal.weightage}%</strong></span>
                  <span>Target: <strong className="text-white font-mono">{goal.target_value}</strong></span>
                </div>

                {/* 4. Progress Bar */}
                <div className="mt-auto">
                  <div className="relative h-[3px] w-full bg-[#1e1e1e] rounded-full overflow-hidden mb-3">
                    <div 
                      className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>

                  {/* 5. Footer */}
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[12px] text-white">{progress}%</span>
                    <div className="flex items-center gap-2">
                       <div className="w-[6px] h-[6px] rounded-full bg-[#34d399]" title="High Confidence" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Empty Slot Card */}
          <div className="enterprise-card border-dashed border-[#1e1e1e] flex flex-col items-center justify-center min-h-[140px] gap-2 cursor-pointer hover:border-[#2a2a2a] transition-all">
            <Plus size={20} className="text-[#333]" />
            <span className="text-[12px] text-[#444]">Add a goal</span>
            <span className="text-[10px] text-[#333]">1 slot remaining</span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { supabase } from "@/lib/supabase";
import { fetchEmployeeGoals } from "@/lib/data";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function EmployeeDashboard() {
  const router = useRouter();
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
    <div className="main">
      <TopBar 
        title="My dashboard" 
        subtitle="Q1 check-in window · July 2025" 
        primaryAction={{ label: "Log Q1 achievement", onClick: () => {} }}
        secondaryAction={{ label: "+ New goal", onClick: () => router.push('/employee/goals/new') }}
      />
      
      <main className="content">
        <div className="stats-row">
          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div className="stat-val">6</div>
            <div className="stat-label">Goals approved</div>
            <div className="stat-delta" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>of 8 max</div>
          </div>

          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div className="stat-val">100%</div>
            <div className="stat-label">Weightage used</div>
            <div className="stat-delta" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>Balanced ✓</div>
          </div>

          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div className="stat-val">64%</div>
            <div className="stat-label">Q1 avg progress</div>
            <div className="stat-delta" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>+9% vs last qtr</div>
          </div>

          <div className="stat">
            <div className="stat-icon" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="stat-val">Oct</div>
            <div className="stat-label">Next check-in</div>
            <div className="stat-delta" style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>Q2 window</div>
          </div>
        </div>

        <div className="grid-2">
          <div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">My goals · AY 2025–26</div>
                <span className="card-action" onClick={() => router.push('/employee/goals/new')}>+ New goal</span>
              </div>
              <div className="card-body">
                {goals.length > 0 ? (
                  goals.map((goal) => {
                    const latestAchievement = goal.achievements?.[0];
                    const progress = latestAchievement ? latestAchievement.computed_score || 0 : 0;
                    const statusColor = goal.status === 'approved' ? 'var(--green)' : goal.status === 'submitted' ? 'var(--blue)' : 'var(--amber)';

                    return (
                      <div key={goal.id} className="goal-item">
                        <div className="g-dot" style={{ background: statusColor }}></div>
                        <div className="g-info">
                          <div className="g-name">{goal.title}</div>
                          <div className="g-meta">{goal.thrust_area} · {goal.status}</div>
                        </div>
                        <div className="g-weight">{goal.weightage}%</div>
                        <div className="prog-wrap">
                          <div className="prog">
                            <div className="prog-fill" style={{ width: `${progress}%`, background: statusColor }}></div>
                          </div>
                          <div className="prog-val">{progress}%</div>
                        </div>
                        <span className={cn(
                          "badge",
                          goal.status === 'approved' ? "badge-green" : goal.status === 'submitted' ? "badge-blue" : "badge-amber"
                        )}>
                          {goal.status}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-[var(--text3)]">
                    No goals found. Start by creating one.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Weightage breakdown</div>
                <span className="badge badge-green">100% balanced</span>
              </div>
              <div className="section-pad" style={{ paddingTop: '14px', paddingBottom: '16px' }}>
                <div className="w-viz">
                  {goals.map((goal, i) => (
                    <div 
                      key={goal.id} 
                      className="w-seg" 
                      style={{ 
                        width: `${goal.weightage}%`, 
                        background: i % 2 === 0 ? 'var(--green)' : 'var(--blue)',
                        opacity: 1 - (i * 0.1)
                      }} 
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '12px' }}>
                  {goals.map((goal) => (
                    <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: 'var(--text2)' }}>{goal.title}</span>
                      <span style={{ color: 'var(--text3)', fontFamily: "'Geist Mono', monospace" }}>{goal.weightage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Check-in timeline</div>
              </div>
              <div className="section-pad">
                <div className="tl">
                  <div className="tl-item">
                    <div className="tl-dot" style={{ background: 'var(--green)' }}></div>
                    <div className="tl-period">May 2025</div>
                    <div className="tl-title">Goal setting</div>
                    <div className="tl-sub">Submitted & approved</div>
                  </div>
                  <div className="tl-item">
                    <div className="tl-dot" style={{ background: 'var(--accent)' }}></div>
                    <div className="tl-period">July 2025 · Active</div>
                    <div className="tl-title">Q1 check-in</div>
                    <div className="tl-sub">Window open · Due 31 Jul</div>
                  </div>
                  <div className="tl-item">
                    <div className="tl-dot" style={{ background: 'var(--border2)' }}></div>
                    <div className="tl-period">October 2025</div>
                    <div className="tl-title">Q2 check-in</div>
                    <div className="tl-sub">Upcoming</div>
                  </div>
                  <div className="tl-item" style={{ marginBottom: 0 }}>
                    <div className="tl-dot" style={{ background: 'var(--border2)' }}></div>
                    <div className="tl-period">Mar–Apr 2026</div>
                    <div className="tl-title">Annual review</div>
                    <div className="tl-sub">Final achievement capture</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getCurrentProfile } from "@/lib/clientProfile";
import { Users, Loader2, ArrowRight, Target, Clock3, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ManagerTeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const profile = await getCurrentProfile();
        if (profile?.id) {
          const res = await fetch(`/api/manager/team?managerId=${encodeURIComponent(profile.id)}`);
          if (res.ok) {
            const data = await res.json();
            setTeam(data || []);
          }
        }
      } catch (err) {
        console.error('Load manager team error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const totalGoals = team.reduce((sum, member) => sum + (member.goals?.length || 0), 0);
  const avgGoals = team.length ? (totalGoals / team.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div className="enterprise-card relative overflow-hidden">
        <div className="absolute -right-14 -top-14 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(200,240,96,0.18)_0%,rgba(200,240,96,0.02)_55%,transparent_75%)] pointer-events-none" />
        <div className="relative z-[1]">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-[28px] font-semibold tracking-tight text-primary flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[var(--accent)]" /> My Team
              </h2>
              <p className="text-[14px] text-secondary mt-1">Review ownership, active goals, and quarter workload at a glance.</p>
            </div>
            <span className="badge badge-accent">Q1 FY 2026-27</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-[0.08em] text-secondary">Direct Reports</div>
              <div className="text-[20px] font-semibold text-primary mt-1 flex items-center gap-2"><Users className="w-4 h-4 text-[var(--blue)]" />{team.length}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-[0.08em] text-secondary">Active Goals</div>
              <div className="text-[20px] font-semibold text-primary mt-1 flex items-center gap-2"><Target className="w-4 h-4 text-[var(--green)]" />{totalGoals}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-[0.08em] text-secondary">Avg Goals / Member</div>
              <div className="text-[20px] font-semibold text-primary mt-1 flex items-center gap-2"><Clock3 className="w-4 h-4 text-[var(--amber)]" />{avgGoals}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {team.length === 0 ? (
          <div className="col-span-full enterprise-card text-center py-12">
            <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
            <p className="text-secondary">No direct reports assigned to you.</p>
          </div>
        ) : (
          team.map((member) => (
            <div key={member.id} className="enterprise-card flex flex-col h-full gap-5 border-[var(--border)] hover:border-[var(--accent-border)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] font-bold text-lg">
                  {member.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-primary truncate">{member.name}</h3>
                  <p className="text-[13px] text-secondary">{member.designation || 'Individual Contributor'} · {member.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--surface2)] px-2.5 py-2">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-secondary">Goals</div>
                  <div className="text-[16px] font-semibold text-primary mt-0.5">{member.goals?.length || 0}</div>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--surface2)] px-2.5 py-2">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-secondary">Submitted</div>
                  <div className="text-[16px] font-semibold text-primary mt-0.5">{(member.goals || []).filter(g => g.status === 'submitted').length}</div>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border flex justify-between items-center gap-3">
                <span className="text-[12px] text-secondary">Active goals: <strong className="text-primary">{member.goals?.length || 0}</strong></span>
                <Link href={`/manager/team/${member.id}`}>
                  <button className="tb-btn tb-btn-ghost text-[14px] font-medium flex items-center gap-1">
                    Review profile <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

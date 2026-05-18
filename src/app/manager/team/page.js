"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { fetchManagerTeam } from "@/lib/data";
import { Users, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ManagerTeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const res = await fetch(`/api/manager/team?managerId=${user.id}`);
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

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[24px] font-semibold text-primary">My Team</h2>
          <p className="text-[14px] text-secondary mt-1">Manage your direct reports and their performance goals.</p>
        </div>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {team.length === 0 ? (
          <div className="col-span-full enterprise-card text-center py-12">
            <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
            <p className="text-secondary">No direct reports assigned to you.</p>
          </div>
        ) : (
          team.map((member) => (
            <div key={member.id} className="enterprise-card flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-accent font-bold text-lg">
                  {member.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-primary">{member.name}</h3>
                  <p className="text-[13px] text-secondary">{member.department}</p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                <span className="text-[12px] text-secondary">Active Goals: <strong className="text-primary">{member.goals?.length || 0}</strong></span>
                <Link href={`/manager/team/${member.id}`}>
                  <button className="tb-btn tb-btn-ghost text-[14px] font-medium flex items-center gap-1">
                    Review <ArrowRight className="w-4 h-4" />
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

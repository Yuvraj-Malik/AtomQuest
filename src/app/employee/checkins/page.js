"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { getCurrentProfile } from "@/lib/clientProfile";
import { CheckSquare, Loader2 } from "lucide-react";

export default function EmployeeCheckinsPage() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCheckins() {
      const profile = await getCurrentProfile();
      if (profile?.id) {
        const res = await fetch(`/api/checkins?employeeId=${encodeURIComponent(profile.id)}`);
        if (res.ok) {
          const data = await res.json();
          const sorted = (data || []).sort((a, b) => {
            return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
          });
          setCheckins(sorted);
        }
      }
      setLoading(false);
    }
    loadCheckins();
  }, []);

  if (loading) {
    return (
      <div>
        <TopBar title="My Check-ins" subtitle="Review your past performance discussions." />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="My Check-ins" subtitle="Review your past performance discussions." />
      <div className="h-[1px] bg-border w-full mb-8" />

      {checkins.length === 0 ? (
        <div className="enterprise-card flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-subtle flex items-center justify-center mb-4">
            <CheckSquare className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-[16px] font-medium text-primary mb-1">No check-ins yet</h3>
          <p className="text-[14px] text-secondary">Your manager will initiate a check-in at the end of the quarter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checkins.map((checkin) => (
            <div key={checkin.id} className="enterprise-card">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] uppercase tracking-wider text-accent font-semibold">{checkin.quarter} Check-in</span>
                <span className="text-[12px] text-secondary">{new Date(checkin.completed_at).toLocaleDateString()}</span>
              </div>
              <p className="text-[14px] text-primary italic">&ldquo;{checkin.comment}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { getCurrentProfile } from "@/lib/clientProfile";
import { Loader2 } from "lucide-react";

export default function EmployeeFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profile = await getCurrentProfile();
        const employeeId = profile?.id;
        const url = employeeId ? `/api/feedbacks?employeeId=${employeeId}` : `/api/feedbacks`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data || []);
        }
      } catch (err) {
        console.error('Failed to load feedbacks', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <TopBar title="Manager feedback" subtitle="Comments and guidance from your manager" />
      <div className="h-[1px] bg-border w-full mb-6" />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-tertiary" />
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <div className="enterprise-card text-center py-12">
              <h3 className="text-[16px] font-medium text-primary mb-2">No feedback yet</h3>
              <p className="text-[14px] text-secondary">Your manager will leave feedback after check-ins.</p>
            </div>
          ) : (
            feedbacks.map(f => (
              <div key={f.id} className="enterprise-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] font-semibold">{f.from || 'Manager'}</div>
                  <div className="text-[12px] text-secondary">{new Date(f.created_at || f.time || Date.now()).toLocaleDateString()}</div>
                </div>
                <div className="text-[14px] text-primary">{f.comment || f.message || f.body}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle, MessageSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchUserProfile, fetchEmployeeGoals } from "@/lib/data";

export default function ManagerGoalReview({ params }) {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviewData() {
      try {
        const empProfile = await fetchUserProfile(params.id);
        const empGoals = await fetchEmployeeGoals(params.id);
        setEmployee(empProfile);
        setGoals(empGoals || []);
      } catch (error) {
        console.error("Error loading goal review data:", error);
        toast.error("Failed to load employee review details.");
      } finally {
        setLoading(false);
      }
    }
    loadReviewData();
  }, [params.id]);

  const handleAction = async (goalId, action) => {
    const status = action === 'approve' ? 'approved' : 'returned';
    const toastId = toast.loading(`${action === 'approve' ? 'Approving' : 'Returning'} goal...`);
    try {
      const { error } = await supabase
        .from('goals')
        .update({ status })
        .eq('id', goalId);

      if (error) throw error;

      // Update local state in real-time
      setGoals(prevGoals =>
        prevGoals.map(g => g.id === goalId ? { ...g, status } : g)
      );

      toast.success(`Goal ${action === 'approve' ? 'approved' : 'returned'} successfully!`, { id: toastId });
    } catch (err) {
      console.error(`Error updating goal status:`, err);
      toast.error(`Failed to update status: ${err.message}`, { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[var(--bg)] text-[var(--text2)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="text-red mb-3 font-semibold">Error</div>
        <p className="text-[14px] text-secondary max-w-[280px]">
          Could not find a valid direct report profile with the given ID.
        </p>
        <Link href="/manager/team" className="mt-4">
          <button className="enterprise-btn-secondary">Go back to My Team</button>
        </Link>
      </div>
    );
  }

  return (
  <div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <Link href="/manager/team">
            <button className="enterprise-btn-secondary px-2.5 py-1.5 rounded-md" title="Back to My Team">
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div>
            <h2 className="text-[24px] font-semibold text-primary">Review Goals: {employee.name || employee.email}</h2>
            <p className="text-[14px] text-secondary mt-1">
              {employee.department || 'Direct Report'} Department • FY 2025-26
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      {goals.length === 0 ? (
        <div className="enterprise-card text-center py-16">
          <p className="text-[13px] text-secondary">This employee has not created any goals for this cycle yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="enterprise-card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-secondary font-medium block mb-2">
                    {goal.thrust_area || 'Thrust Area'}
                  </span>
                  <h3 className="text-[18px] font-semibold text-primary">{goal.title}</h3>
                </div>
                <span className={`status-badge ${goal.status}`}>{goal.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-secondary font-medium block mb-1">Target</label>
                  <div className="font-mono text-[15px] text-primary">
                    {goal.target_value ? `${goal.target_value}` : goal.target_date ? `By ${new Date(goal.target_date).toLocaleDateString()}` : 'No target set'}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-secondary font-medium block mb-1">Weightage</label>
                  <div className="font-mono text-[15px] text-primary">{goal.weightage}%</div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-border">
                <button 
                  onClick={() => handleAction(goal.id, 'approve')}
                  className="tb-btn tb-btn-primary flex items-center gap-2"
                  disabled={goal.status === 'approved'}
                  style={{ opacity: goal.status === 'approved' ? 0.6 : 1, cursor: goal.status === 'approved' ? 'not-allowed' : 'pointer' }}
                >
                  <CheckCircle2 size={16} />
                  Approve
                </button>
                <button 
                  onClick={() => handleAction(goal.id, 'return')}
                  className="tb-btn tb-btn-ghost flex items-center gap-2 text-red border-red/20"
                  disabled={goal.status === 'returned'}
                  style={{ opacity: goal.status === 'returned' ? 0.6 : 1, cursor: goal.status === 'returned' ? 'not-allowed' : 'pointer' }}
                >
                  <XCircle size={16} />
                  Return for Edit
                </button>
                <button 
                  className="tb-btn tb-btn-ghost flex items-center gap-2 ml-auto"
                  onClick={() => toast("Comments module is coming soon!")}
                >
                  <MessageSquare size={16} />
                  Add Comment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

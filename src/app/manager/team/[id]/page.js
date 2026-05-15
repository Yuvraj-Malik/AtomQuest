"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ManagerGoalReview({ params }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");

  const employee = {
    id: params.id,
    name: "Riya Sharma",
    department: "Finance",
    goals: [
      { id: "1", title: "Increase Q1 Revenue by 20%", thrust_area: "Finance", status: "submitted", weightage: 30, target: "500 units" },
      { id: "2", title: "Automate Monthly Reporting", thrust_area: "Operations", status: "submitted", weightage: 20, target: "100% automation" },
    ]
  };

  const handleAction = (goalId, action) => {
    toast.success(`Goal ${action === 'approve' ? 'approved' : 'returned'} successfully!`);
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <Link href="/manager/dashboard">
            <button className="enterprise-btn-secondary px-2 py-1 rounded">
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div>
            <h2 className="text-[24px] font-semibold text-primary">Review Goals: {employee.name}</h2>
            <p className="text-[14px] text-secondary mt-1">{employee.department} Department • FY 2025-26</p>
          </div>
        </div>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      <div className="space-y-6">
        {employee.goals.map((goal) => (
          <div key={goal.id} className="enterprise-card">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-secondary font-medium block mb-2">{goal.thrust_area}</span>
                <h3 className="text-[18px] font-semibold text-primary">{goal.title}</h3>
              </div>
              <span className={`status-badge ${goal.status}`}>{goal.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-secondary font-medium block mb-1">Target</label>
                <div className="font-mono text-[15px] text-primary">{goal.target}</div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-secondary font-medium block mb-1">Weightage</label>
                <div className="font-mono text-[15px] text-primary">{goal.weightage}%</div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-border">
              <button 
                onClick={() => handleAction(goal.id, 'approve')}
                className="enterprise-btn flex items-center gap-2 bg-green text-white hover:bg-green/90"
              >
                <CheckCircle2 size={16} />
                Approve
              </button>
              <button 
                onClick={() => handleAction(goal.id, 'return')}
                className="enterprise-btn-secondary flex items-center gap-2 text-red border-red/20 hover:bg-red/5"
              >
                <XCircle size={16} />
                Return for Edit
              </button>
              <button className="enterprise-btn-ghost flex items-center gap-2 ml-auto">
                <MessageSquare size={16} />
                Add Comment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

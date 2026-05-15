import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function ManagerDashboard() {
  const teamMembers = [
    { id: "1", name: "Riya Sharma", goalsStatus: "submitted", checkInStatus: "completed", momentum: 85 },
    { id: "2", name: "Alex Johnson", goalsStatus: "approved", checkInStatus: "on_track", momentum: 60 },
    { id: "3", name: "David Smith", goalsStatus: "draft", checkInStatus: "not_started", momentum: 20 },
  ];

  const submittedCount = teamMembers.filter(m => m.goalsStatus === "submitted" || m.goalsStatus === "approved").length;
  const submissionRate = Math.round((submittedCount / teamMembers.length) * 100);

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[24px] font-semibold text-primary">Manager Dashboard</h2>
          <p className="text-[14px] text-secondary mt-1">Overview of your team's goal progress and momentum.</p>
        </div>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      <div className="grid gap-6 md:grid-cols-3 mb-10">
        
        {/* Stat Card 1 */}
        <div className="enterprise-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-accent" />
          <div className="text-[11px] uppercase tracking-wider text-secondary font-medium mb-3">Goal Submission</div>
          <div className="font-mono text-[32px] font-medium text-primary leading-none mb-2">{submissionRate}%</div>
          <div className="text-[13px] text-secondary flex items-center gap-2">
            <div className="flex-1 h-[4px] rounded-full bg-subtle overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-accent rounded-full" style={{ width: `${submissionRate}%` }} />
            </div>
            <span>{submittedCount} of {teamMembers.length}</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="enterprise-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
          <div className="text-[11px] uppercase tracking-wider text-secondary font-medium mb-3">Pending Approvals</div>
          <div className="font-mono text-[32px] font-medium text-primary leading-none mb-2">1</div>
          <div className="text-[13px] text-secondary">Requires your review</div>
        </div>

        {/* Stat Card 3 */}
        <div className="enterprise-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-red" />
          <div className="text-[11px] uppercase tracking-wider text-secondary font-medium mb-3">Team Momentum</div>
          <div className="font-mono text-[32px] font-medium text-primary leading-none mb-2">85<span className="text-tertiary text-[20px]">/100</span></div>
          <div className="text-[13px] text-secondary">Top contributor: Riya Sharma</div>
        </div>
      </div>

      <h3 className="text-[18px] font-semibold text-primary mb-4">Direct Reports</h3>
      
      <div className="enterprise-table-wrapper">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="enterprise-table-th">Employee Name</th>
              <th className="enterprise-table-th">Goals Status</th>
              <th className="enterprise-table-th">Check-in Status</th>
              <th className="enterprise-table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} className="enterprise-table-tr">
                <td className="enterprise-table-td flex items-center gap-3">
                  <div className="w-[28px] h-[28px] rounded bg-subtle flex items-center justify-center text-[11px] font-bold text-secondary border border-border">
                    {member.name.charAt(0)}
                  </div>
                  {member.name}
                </td>
                <td className="enterprise-table-td">
                  <span className={`status-badge ${member.goalsStatus}`}>
                    {member.goalsStatus}
                  </span>
                </td>
                <td className="enterprise-table-td">
                  <span className="text-[13px] text-secondary capitalize">
                    {member.checkInStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="enterprise-table-td text-right">
                  <div className="row-actions inline-block">
                    <Link href={`/manager/team/${member.id}`}>
                      <button className="enterprise-btn-secondary px-3 py-1 text-[13px] rounded">Review</button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

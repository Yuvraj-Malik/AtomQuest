import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[24px] font-semibold text-primary">Admin Dashboard</h2>
          <p className="text-[14px] text-secondary mt-1">Org-wide completion rates and active cycle tracking.</p>
        </div>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Stat Card 1 */}
        <div className="enterprise-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-accent" />
          <div className="text-[11px] uppercase tracking-wider text-secondary font-medium mb-3">Active Cycle</div>
          <div className="font-mono text-[32px] font-medium text-primary leading-none mb-2 text-[28px]">FY 2025-26</div>
          <div className="text-[13px] text-green">Currently in Q1 check-in phase</div>
        </div>

        {/* Stat Card 2 */}
        <div className="enterprise-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-green" />
          <div className="text-[11px] uppercase tracking-wider text-secondary font-medium mb-3">Org Goal Submission</div>
          <div className="font-mono text-[32px] font-medium text-primary leading-none mb-2">85%</div>
          <div className="text-[13px] text-secondary flex items-center gap-2">
            <div className="flex-1 h-[4px] rounded-full bg-subtle overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-green rounded-full" style={{ width: '85%' }} />
            </div>
            <span>On Track</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="enterprise-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-red" />
          <div className="text-[11px] uppercase tracking-wider text-secondary font-medium mb-3">Active Escalations</div>
          <div className="font-mono text-[32px] font-medium text-primary leading-none mb-2 text-red">12</div>
          <Link href="/admin/escalations">
            <p className="text-[13px] text-secondary hover:text-primary transition-colors cursor-pointer">View overdue actions →</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

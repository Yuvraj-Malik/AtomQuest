import Link from "next/link";

export default function GoalsPage() {
  const goals = [
    { id: "1", title: "Increase Q1 Revenue by 20%", thrust_area: "Finance", status: "approved", weightage: 30, target: "500 units", progress: 74 },
    { id: "2", title: "Launch new Customer Portal", thrust_area: "Customer", status: "submitted", weightage: 25, target: "Q2", progress: 0 },
    { id: "3", title: "Reduce Server Costs", thrust_area: "Operations", status: "draft", weightage: 20, target: "$10k", progress: 0 },
  ];

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[24px] font-semibold text-primary">My Goals</h2>
          <p className="text-[14px] text-secondary mt-1">Manage your objectives for the FY 2025-26 cycle.</p>
        </div>
        <Link href="/employee/goals/new">
          <button className="enterprise-btn">New Goal</button>
        </Link>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <div key={goal.id} className="enterprise-card enterprise-card-interactive flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] uppercase tracking-wider text-secondary font-medium">{goal.thrust_area}</span>
              <span className={`status-badge ${goal.status}`}>{goal.status}</span>
            </div>
            <h3 className="text-[18px] font-semibold text-primary mb-6 leading-tight">{goal.title}</h3>
            
            <div className="mt-auto space-y-4">
              <div className="flex justify-between text-[13px] text-secondary">
                <span>Weight: <strong className="text-primary font-mono">{goal.weightage}%</strong></span>
                <span>Target: <strong className="text-primary font-mono">{goal.target}</strong></span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-[6px] rounded-full bg-subtle overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${goal.progress}%`,
                      backgroundColor: goal.progress >= 100 ? 'var(--green)' : goal.progress === 0 ? 'transparent' : 'var(--accent)'
                    }} 
                  />
                </div>
                <span className="font-mono text-[13px] font-medium text-primary w-8 text-right">{goal.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

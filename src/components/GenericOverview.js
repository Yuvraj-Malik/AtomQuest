"use client";

import { LayoutDashboard } from "lucide-react";

export default function GenericOverviewPage({ title, description }) {
  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[24px] font-semibold text-primary">{title}</h2>
          <p className="text-[14px] text-secondary mt-1">{description}</p>
        </div>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      <div className="enterprise-card flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-subtle flex items-center justify-center mb-6 text-secondary">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <h3 className="text-[18px] font-medium text-primary mb-2">{title} Module</h3>
        <p className="text-[14px] text-secondary max-w-[400px]">This section is currently being updated with real-time data. Check back soon for the full feature set.</p>
      </div>
    </div>
  );
}

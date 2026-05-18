"use client";

import { useState, useEffect } from "react";
import { FileDown, FileText, BarChart3, Users, Download } from "lucide-react";
import { toast } from "sonner";
import { downloadReport } from "@/lib/reportDownload";
import { getCurrentProfile } from "@/lib/clientProfile";

export default function Page() {
  const [managerId, setManagerId] = useState(null);

  useEffect(() => {
    getCurrentProfile().then((profile) => setManagerId(profile?.id || null));
  }, []);

  const handleExport = (report, format) => {
    if (!managerId) {
      toast.error('Manager profile not loaded yet');
      return;
    }

    downloadReport(`/api/reports/export?report=${encodeURIComponent(report)}&format=${encodeURIComponent(format)}&managerId=${encodeURIComponent(managerId)}`);
    toast.success(`Exporting ${report}...`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-[24px] font-semibold text-[var(--text1)] tracking-tight flex items-center gap-2">
          <FileDown className="w-6 h-6 text-[var(--accent)]" /> Team reports
        </h2>
        <p className="text-[13.5px] text-[var(--text2)] mt-1">Export direct-report goal, check-in, and directory data for quarterly reviews.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-left hover:bg-[var(--surface2)] transition" onClick={() => handleExport('performance', 'csv')}>
          <div className="flex items-center gap-3 mb-2"><BarChart3 className="w-5 h-5 text-[var(--green)]" /><span className="font-semibold text-[var(--text1)]">Team performance</span></div>
          <p className="text-[13px] text-[var(--text2)]">Goal progress and computed scorecards for your direct reports.</p>
        </button>
        <button className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-left hover:bg-[var(--surface2)] transition" onClick={() => handleExport('checkins', 'csv')}>
          <div className="flex items-center gap-3 mb-2"><FileText className="w-5 h-5 text-[var(--blue)]" /><span className="font-semibold text-[var(--text1)]">Check-ins</span></div>
          <p className="text-[13px] text-[var(--text2)]">Quarterly check-in history for the team.</p>
        </button>
        <button className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-left hover:bg-[var(--surface2)] transition" onClick={() => handleExport('org', 'xls')}>
          <div className="flex items-center gap-3 mb-2"><Users className="w-5 h-5 text-[var(--accent)]" /><span className="font-semibold text-[var(--text1)]">Team directory</span></div>
          <p className="text-[13px] text-[var(--text2)]">A spreadsheet-ready roster of direct reports.</p>
        </button>
      </div>
    </div>
  );
}

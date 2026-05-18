"use client";

import { useState } from "react";
import { 
  FileDown, 
  FileText, 
  BarChart, 
  Download,
  Calendar,
  CheckCircle2,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [exporting, setExporting] = useState(null);

  const handleExport = (reportName) => {
    setExporting(reportName);
    toast.success(`Preparing ${reportName}...`);
    setTimeout(() => {
      toast.success(`${reportName} download started.`);
      setExporting(null);
    }, 2000);
  };

  const reports = [
    {
      id: 'compliance',
      title: 'Compliance & Exceptions Report',
      description: 'Detailed list of all escalations, overdue check-ins, and draft status goals.',
      icon: <FileText className="w-5 h-5 text-[var(--amber)]" />,
      color: 'var(--amber-bg)',
      borderColor: 'rgba(232,168,58,0.2)',
    },
    {
      id: 'performance',
      title: 'Q1 Performance Achievement',
      description: 'Aggregated progress, final ratings, and overall scorecards for all employees.',
      icon: <BarChart className="w-5 h-5 text-[var(--green)]" />,
      color: 'var(--green-bg)',
      borderColor: 'rgba(75,201,138,0.2)',
    },
    {
      id: 'audit',
      title: 'Complete Security Audit Log',
      description: 'Full historical log of all administrative actions, profile edits, and overrides.',
      icon: <FileDown className="w-5 h-5 text-[var(--blue)]" />,
      color: 'var(--blue-bg)',
      borderColor: 'rgba(91,156,246,0.2)',
    },
    {
      id: 'org',
      title: 'Organizational Directory Export',
      description: 'Roster of all employees with contact details, reporting lines, and tenure.',
      icon: <Users className="w-5 h-5 text-[var(--accent)]" />,
      color: 'var(--accent-bg)',
      borderColor: 'var(--accent-border)',
    }
  ];

  return (
    <div className="p-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[24px] font-semibold text-[var(--text1)] tracking-tight flex items-center gap-2">
            <FileDown className="w-6 h-6 text-[var(--accent)]" /> 
            Export Reports
          </h2>
          <p className="text-[13.5px] text-[var(--text2)] mt-1">Generate and download comprehensive performance and compliance datasets.</p>
        </div>
      </div>

      <div className="h-[1px] bg-[var(--border)] w-full mb-8" />

      {/* Quick Stats Context */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface2)]">
          <div className="flex items-center gap-2 text-[var(--text2)] text-[12.5px] font-medium mb-1">
            <Calendar className="w-4 h-4" /> Current Data Cycle
          </div>
          <div className="text-[18px] font-semibold text-[var(--text1)]">Q1 Performance Cycle</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface2)]">
          <div className="flex items-center gap-2 text-[var(--text2)] text-[12.5px] font-medium mb-1">
            <CheckCircle2 className="w-4 h-4 text-[var(--green)]" /> Data Readiness
          </div>
          <div className="text-[18px] font-semibold text-[var(--text1)]">Up to Date (Live)</div>
        </div>
      </div>

      <h3 className="text-[15px] font-semibold text-[var(--text1)] mb-4 uppercase tracking-wider">Available Datasets</h3>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] transition flex flex-col justify-between h-full group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center border"
                  style={{ backgroundColor: report.color, borderColor: report.borderColor }}
                >
                  {report.icon}
                </div>
                <h4 className="text-[15px] font-semibold text-[var(--text1)]">{report.title}</h4>
              </div>
              <p className="text-[13px] text-[var(--text2)] mb-6 leading-relaxed">
                {report.description}
              </p>
            </div>
            
            <div className="flex gap-2 mt-auto border-t border-[var(--border)] pt-4">
              <button 
                onClick={() => handleExport(`${report.title} (CSV)`)}
                disabled={exporting !== null}
                className="tb-btn tb-btn-ghost flex-1 py-2 text-[12.5px] flex justify-center items-center gap-2 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <Download className="w-4 h-4" /> 
                {exporting === `${report.title} (CSV)` ? "Preparing..." : "Export CSV"}
              </button>
              <button 
                onClick={() => handleExport(`${report.title} (PDF)`)}
                disabled={exporting !== null}
                className="tb-btn tb-btn-ghost flex-1 py-2 text-[12.5px] flex justify-center items-center gap-2 hover:border-[var(--blue)] hover:text-[var(--blue)]"
              >
                <FileText className="w-4 h-4" /> 
                {exporting === `${report.title} (PDF)` ? "Preparing..." : "Export PDF"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

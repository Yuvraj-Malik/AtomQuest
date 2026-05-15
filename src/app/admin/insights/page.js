"use client";

import { useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";

export default function AdminInsightsPage() {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const heatmapData = [
    { department: "Sales", Innovation: 10, Operations: 20, Customer: 5, Finance: 0, People: 2 },
    { department: "Engineering", Innovation: 5, Operations: 10, Customer: 2, Finance: 0, People: 5 },
    { department: "Finance", Innovation: 37, Operations: 5, Customer: 0, Finance: 2, People: 1 },
    { department: "HR", Innovation: 12, Operations: 8, Customer: 1, Finance: 5, People: 4 },
  ];

  const generateInsight = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: heatmapData })
      });
      const json = await res.json();
      setInsight(json.recommendation || "Unable to generate insight at this time.");
    } catch (err) {
      setInsight("Error connecting to AI service. Ensure GROQ_API_KEY is set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[24px] font-semibold text-primary">Confidence Map Insights</h2>
          <p className="text-[14px] text-secondary mt-1">Identify areas where employees feel least confident about their goals.</p>
        </div>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      <div className="enterprise-card mb-6">
        <div className="mb-4">
          <h3 className="text-[18px] font-semibold text-primary">Low Confidence Heatmap</h3>
          <p className="text-[13px] text-secondary mt-1">Percentage of goals tagged as "Low Confidence" by department and thrust area.</p>
        </div>
        
        <div className="enterprise-table-wrapper">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="enterprise-table-th text-left border-r border-border">Department</th>
                <th className="enterprise-table-th">Innovation</th>
                <th className="enterprise-table-th">Operations</th>
                <th className="enterprise-table-th">Customer</th>
                <th className="enterprise-table-th">Finance</th>
                <th className="enterprise-table-th">People</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, i) => (
                <tr key={i} className="enterprise-table-tr">
                  <td className="enterprise-table-td text-left font-medium border-r border-border">{row.department}</td>
                  {['Innovation', 'Operations', 'Customer', 'Finance', 'People'].map(area => {
                    const val = row[area];
                    let bgClass = "bg-[var(--green-soft)] text-primary";
                    if (val > 15) bgClass = "bg-[var(--amber-soft)] text-amber";
                    if (val > 30) bgClass = "bg-[var(--red-soft)] text-red font-semibold";
                    return (
                      <td key={area} className={`enterprise-table-td font-mono ${bgClass}`}>
                        {val}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="enterprise-card border-l-2 border-l-accent">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-accent" />
          <h3 className="text-[16px] font-semibold text-primary">AI Recommendation</h3>
        </div>
        
        {insight ? (
          <p className="text-[14px] leading-relaxed text-primary bg-subtle p-4 rounded-md border border-border">
            {insight}
          </p>
        ) : (
          <div className="flex flex-col items-start gap-4">
            <p className="text-[13px] text-secondary">Click below to generate an AI insight based on the current confidence heatmap.</p>
            <button className="enterprise-btn flex items-center gap-2" onClick={generateInsight} disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Generate Insight
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

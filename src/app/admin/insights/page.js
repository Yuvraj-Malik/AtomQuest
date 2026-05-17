"use client";

import { useState } from "react";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AdminInsightsPage() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        body: JSON.stringify({ 
          data: { 
            confidence_distribution: { high: 45, medium: 30, low: 25 },
            overdue_goals: 12,
            active_cycle: "FY 2025-26"
          } 
        }),
      });
      const data = await response.json();
      setInsight(data.recommendation);
    } catch (error) {
      toast.error("Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[800px]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[24px] font-semibold text-primary">AI Business Insights</h2>
          <p className="text-[14px] text-secondary mt-1">Get strategic recommendations based on org-wide data.</p>
        </div>
        <button 
          onClick={generateInsight}
          className="enterprise-btn flex items-center gap-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Insight
        </button>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      {insight ? (
        <div className="enterprise-card border-accent bg-accent-soft/30 p-8">
          <div className="flex items-center gap-3 mb-4 text-accent">
            <Lightbulb className="w-6 h-6" />
            <h3 className="text-[18px] font-semibold">Strategic Recommendation</h3>
          </div>
          <p className="text-[16px] text-primary leading-relaxed">
            {insight}
          </p>
          <div className="mt-6 pt-6 border-t border-accent-border flex gap-4">
            <button className="enterprise-btn text-[13px] py-1.5 px-4">Create Initiative</button>
            <button className="enterprise-btn-secondary text-[13px] py-1.5 px-4 rounded-[7px]">Share with Leaders</button>
          </div>
        </div>
      ) : (
        <div className="enterprise-card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-subtle flex items-center justify-center mb-6">
            <Lightbulb className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-[18px] font-medium text-primary mb-2">No active insights</h3>
          <p className="text-[14px] text-secondary max-w-[400px]">Click the button above to analyze current goal cycle data and generate AI-driven recommendations.</p>
        </div>
      )}
    </div>
  );
}

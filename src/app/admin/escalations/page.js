"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEscalations() {
      const { data, error } = await supabase
        .from('escalations')
        .select('*, profiles(name, department)')
        .eq('resolved', false);
      
      if (!error) setEscalations(data || []);
      setLoading(false);
    }
    loadEscalations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[24px] font-semibold text-primary">Active Escalations</h2>
          <p className="text-[14px] text-secondary mt-1">Manage overdue goals and missing check-ins.</p>
        </div>
      </div>
      
      <div className="h-[1px] bg-border w-full mb-8" />

      <div className="enterprise-table-wrapper">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="enterprise-table-th">Employee</th>
              <th className="enterprise-table-th">Type</th>
              <th className="enterprise-table-th">Days Overdue</th>
              <th className="enterprise-table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {escalations.length === 0 ? (
              <tr>
                <td colSpan="4" className="enterprise-table-td text-center py-8 text-secondary">No active escalations. Everything is on track!</td>
              </tr>
            ) : (
              escalations.map((esc) => (
                <tr key={esc.id} className="enterprise-table-tr">
                  <td className="enterprise-table-td">
                    <div className="font-medium text-primary">{esc.profiles?.name}</div>
                    <div className="text-[12px] text-secondary">{esc.profiles?.department}</div>
                  </td>
                  <td className="enterprise-table-td">
                    <span className="text-[13px] text-red capitalize flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {esc.escalation_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="enterprise-table-td font-mono text-red">{esc.days_overdue}d</td>
                  <td className="enterprise-table-td text-right">
                    <button className="enterprise-btn-secondary px-3 py-1 text-[13px] rounded">Nudge</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

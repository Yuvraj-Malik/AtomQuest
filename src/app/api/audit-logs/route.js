export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getAuditLogs, addAuditLog } from '@/lib/backendDb';

export async function GET() {
  try {
    const logs = getAuditLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error("API Audit Logs GET error:", error);
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { actor, action, status } = await request.json();
    const newLog = addAuditLog(actor, action, status);
    return NextResponse.json({ success: true, log: newLog });
  } catch (error) {
    console.error("API Audit Logs POST error:", error);
    return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 });
  }
}

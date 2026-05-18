export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { updateMessageStatus, init } from '@/lib/chatDb';

export async function POST(request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    }
    init();
    updateMessageStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('chat/messages/status POST', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

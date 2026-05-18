export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { markMessagesAsRead, init } from '@/lib/chatDb';

export async function POST(request) {
  try {
    const { conversation_id, reader_id } = await request.json();
    if (!conversation_id || !reader_id) {
      return NextResponse.json({ error: 'conversation_id and reader_id required' }, { status: 400 });
    }
    init();
    markMessagesAsRead(conversation_id, reader_id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('chat/messages/read POST', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

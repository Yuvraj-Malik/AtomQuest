export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getLastMessagesForUser, init } from '@/lib/chatDb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }
    init();
    const msgs = getLastMessagesForUser(user_id);
    return NextResponse.json({ success: true, messages: msgs });
  } catch (err) {
    console.error('chat/conversations/recent GET', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

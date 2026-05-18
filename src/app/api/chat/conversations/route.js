export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { createConversation, getConversation, init } from '@/lib/chatDb';

export async function POST(request) {
  try {
    const { id, type, name, members } = await request.json();
    if (!id || !members || !Array.isArray(members)) {
      return NextResponse.json({ error: 'id and members[] required' }, { status: 400 });
    }
    init();
    const conv = createConversation({ id, type, name, members });
    return NextResponse.json({ success: true, conversation: conv });
  } catch (err) {
    console.error('chat/conversations POST', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    init();
    const conv = getConversation(id);
    return NextResponse.json({ success: true, conversation: conv });
  } catch (err) {
    console.error('chat/conversations GET', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { addMessage, getMessages, init } from '@/lib/chatDb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, conversation_id, sender_id, ciphertext, content_type } = body;
    let { metadata } = body;
    if (!id || !conversation_id || !sender_id || !ciphertext) {
      return NextResponse.json({ error: 'id, conversation_id, sender_id and ciphertext required' }, { status: 400 });
    }
    if (!metadata) metadata = {};
    if (body.iv && !metadata.iv) {
      metadata.iv = body.iv;
    }
    init();
    const msg = addMessage({ id, conversation_id, sender_id, ciphertext, content_type, metadata });
    return NextResponse.json({ success: true, message: msg });
  } catch (err) {
    console.error('chat/messages POST', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const conversation_id = url.searchParams.get('conversation_id');
    const limit = Number(url.searchParams.get('limit') || '100');
    const after = url.searchParams.get('after') || null;
    if (!conversation_id) return NextResponse.json({ error: 'conversation_id required' }, { status: 400 });
    init();
    const msgs = getMessages(conversation_id, limit, after);
    return NextResponse.json({ success: true, messages: msgs });
  } catch (err) {
    console.error('chat/messages GET', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

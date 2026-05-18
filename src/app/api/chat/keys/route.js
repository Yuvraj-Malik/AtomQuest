export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { saveUserKey, getUserKey, init } from '@/lib/chatDb';

export async function POST(request) {
  try {
    const { user_id, public_key } = await request.json();
    if (!user_id || !public_key) {
      return NextResponse.json({ error: 'user_id and public_key required' }, { status: 400 });
    }
    init();
    const saved = saveUserKey(user_id, public_key);
    return NextResponse.json({ success: true, saved });
  } catch (err) {
    console.error('chat/keys POST', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const user_id = url.searchParams.get('user_id');
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    init();
    const key = getUserKey(user_id);
    return NextResponse.json({ success: true, public_key: key });
  } catch (err) {
    console.error('chat/keys GET', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

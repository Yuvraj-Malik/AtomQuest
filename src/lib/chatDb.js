// chatDb abstraction: prefers SQLite (better-sqlite3) if available, falls back to JSON file `chat.json`.
const fs = typeof window === 'undefined' ? require('fs') : null;
const path = typeof window === 'undefined' ? require('path') : null;
let dbPath = '';
let jsonPath = '';

if (typeof window === 'undefined') {
  dbPath = path.join(process.cwd(), 'chat.sqlite');
  jsonPath = path.join(process.cwd(), 'chat.json');
}

let sqlite = null;
let db = null;
let fallback = null;

function loadBetterSqlite3() {
  try {
    const dynamicRequire = eval('require');
    return dynamicRequire('better-sqlite3');
  } catch (error) {
    return null;
  }
}

function now() {
  return new Date().toISOString();
}

function ensureFallback() {
  if (fallback) return fallback;
  if (!fs) return null;
  if (!fs.existsSync(jsonPath)) {
    const initial = { conversations: [], messages: [], keys: [] };
    fs.writeFileSync(jsonPath, JSON.stringify(initial, null, 2), 'utf8');
  }
  fallback = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  return fallback;
}

function persistFallback() {
  if (!fs || !fallback) return;
  fs.writeFileSync(jsonPath, JSON.stringify(fallback, null, 2), 'utf8');
}

function tryInitSqlite() {
  if (db) return db;
  try {
    sqlite = loadBetterSqlite3();
    if (!sqlite) {
      return null;
    }
    db = new sqlite(dbPath);

    // Create tables if not exist
    db.prepare(`CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      type TEXT,
      name TEXT,
      members TEXT,
      created_at TEXT
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT,
      sender_id TEXT,
      ciphertext TEXT,
      content_type TEXT,
      metadata TEXT,
      created_at TEXT
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS keys (
      user_id TEXT PRIMARY KEY,
      public_key TEXT,
      created_at TEXT
    )`).run();

    return db;
  } catch (e) {
    // sqlite not available
    return null;
  }
}

export function init() {
  const s = tryInitSqlite();
  if (s) return { driver: 'sqlite' };
  ensureFallback();
  return { driver: 'json' };
}

export function createConversation({ id, type = 'direct', name = null, members = [] }) {
  const s = tryInitSqlite();
  if (s) {
    const stmt = db.prepare('INSERT INTO conversations (id,type,name,members,created_at) VALUES (?,?,?,?,?)');
    stmt.run(id, type, name, JSON.stringify(members), now());
    return { id, type, name, members };
  }

  const fb = ensureFallback();
  const conv = { id, type, name, members, created_at: now() };
  fb.conversations.push(conv);
  persistFallback();
  return conv;
}

export function getConversation(id) {
  const s = tryInitSqlite();
  if (s) {
    const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
    if (!row) return null;
    return { ...row, members: JSON.parse(row.members) };
  }

  const fb = ensureFallback();
  return fb.conversations.find(c => c.id === id) || null;
}

export function addMessage({ id, conversation_id, sender_id, ciphertext, content_type = 'text', metadata = {} }) {
  const s = tryInitSqlite();
  if (s) {
    const stmt = db.prepare('INSERT INTO messages (id,conversation_id,sender_id,ciphertext,content_type,metadata,created_at) VALUES (?,?,?,?,?,?,?)');
    stmt.run(id, conversation_id, sender_id, ciphertext, content_type, JSON.stringify(metadata), now());
    return { id, conversation_id, sender_id, ciphertext, content_type, metadata, created_at: now() };
  }

  const fb = ensureFallback();
  const msg = { id, conversation_id, sender_id, ciphertext, content_type, metadata, created_at: now() };
  fb.messages.push(msg);
  persistFallback();
  return msg;
}

export function getMessages(conversation_id, limit = 100, after = null) {
  const s = tryInitSqlite();
  if (s) {
    let stmt;
    if (after) {
      stmt = db.prepare('SELECT * FROM messages WHERE conversation_id = ? AND created_at > ? ORDER BY created_at ASC LIMIT ?');
      return stmt.all(conversation_id, after, limit).map(r => ({ ...r, metadata: JSON.parse(r.metadata || '{}') }));
    }
    stmt = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?');
    return stmt.all(conversation_id, limit).map(r => ({ ...r, metadata: JSON.parse(r.metadata || '{}') }));
  }

  const fb = ensureFallback();
  const msgs = fb.messages.filter(m => m.conversation_id === conversation_id).sort((a,b)=> a.created_at.localeCompare(b.created_at));
  return msgs.slice(-limit);
}

export function saveUserKey(user_id, public_key) {
  const s = tryInitSqlite();
  if (s) {
    const up = db.prepare('INSERT OR REPLACE INTO keys (user_id,public_key,created_at) VALUES (?,?,?)');
    up.run(user_id, public_key, now());
    return { user_id, public_key };
  }

  const fb = ensureFallback();
  const existing = fb.keys.find(k => k.user_id === user_id);
  if (existing) existing.public_key = public_key; else fb.keys.push({ user_id, public_key, created_at: now() });
  persistFallback();
  return { user_id, public_key };
}

export function getUserKey(user_id) {
  const s = tryInitSqlite();
  if (s) {
    const row = db.prepare('SELECT * FROM keys WHERE user_id = ?').get(user_id);
    return row ? row.public_key : null;
  }
  const fb = ensureFallback();
  const k = fb.keys.find(x => x.user_id === user_id);
  return k ? k.public_key : null;
}

export function markMessagesAsRead(conversation_id, reader_id) {
  const s = tryInitSqlite();
  if (s) {
    const stmtFetch = db.prepare('SELECT * FROM messages WHERE conversation_id = ? AND sender_id != ?');
    const rows = stmtFetch.all(conversation_id, reader_id);
    
    const stmtUpdate = db.prepare('UPDATE messages SET metadata = ? WHERE id = ?');
    for (const r of rows) {
      const meta = JSON.parse(r.metadata || '{}');
      meta.status = 'read';
      stmtUpdate.run(JSON.stringify(meta), r.id);
    }
    return true;
  }
  
  const fb = ensureFallback();
  fb.messages.forEach(m => {
    if (m.conversation_id === conversation_id && m.sender_id !== reader_id) {
      if (!m.metadata) m.metadata = {};
      m.metadata.status = 'read';
    }
  });
  persistFallback();
  return true;
}

export function updateMessageStatus(id, status) {
  const s = tryInitSqlite();
  if (s) {
    const stmtGet = db.prepare('SELECT metadata FROM messages WHERE id = ?');
    const row = stmtGet.get(id);
    if (!row) return false;
    const meta = JSON.parse(row.metadata || '{}');
    meta.status = status;
    const stmtUp = db.prepare('UPDATE messages SET metadata = ? WHERE id = ?');
    stmtUp.run(JSON.stringify(meta), id);
    return true;
  }

  const fb = ensureFallback();
  const msg = fb.messages.find(m => m.id === id);
  if (!msg) return false;
  if (!msg.metadata) msg.metadata = {};
  msg.metadata.status = status;
  persistFallback();
  return true;
}

export function getLastMessagesForUser(user_id) {
  const s = tryInitSqlite();
  if (s) {
    const stmt = db.prepare('SELECT * FROM messages WHERE conversation_id LIKE ? ORDER BY created_at DESC');
    const rows = stmt.all(`%${user_id}%`);
    return rows.map(r => ({ ...r, metadata: JSON.parse(r.metadata || '{}') }));
  }
  
  const fb = ensureFallback();
  return fb.messages.filter(m => m.conversation_id.includes(user_id)).sort((a,b)=> b.created_at.localeCompare(a.created_at));
}

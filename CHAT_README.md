Chat feature setup

Overview:
- This project includes a simple in-app chat backend with an optional SQLite store and a WebSocket server skeleton.

Quick start:
1. Install optional dependencies for production realtime and sqlite (recommended):

```bash
npm install ws better-sqlite3
```

2. Start the Next.js app (dev):

```bash
npm run dev
```

3. Start the chat WebSocket server (separate process):

```bash
npm run start-chat-ws
```

APIs:
- `POST /api/chat/keys` { user_id, public_key } — store user's public key
- `GET /api/chat/keys?user_id=...` — fetch public key
- `POST /api/chat/conversations` { id, type, name, members[] } — create conversation
- `GET /api/chat/conversations?id=...` — fetch conversation
- `POST /api/chat/messages` { id, conversation_id, sender_id, ciphertext } — store message
- `GET /api/chat/messages?conversation_id=...&limit=100` — fetch messages

Notes on E2EE:
- This implementation stores ciphertext only; key exchange should be performed client-side using Web Crypto APIs.
- Group conversation key management and ratcheting are out of scope for initial implementation.

Files added:
- `src/lib/chatDb.js` — DB abstraction (SQLite preferred, JSON fallback)
- `src/app/api/chat/*` — API endpoints for keys, conversations, messages
- `server/chat-ws.js` — WebSocket skeleton (requires `ws`)

Next steps:
- Implement client-side key generation and encryption flow.
- Build chat UI and wire to APIs + WebSocket.
- Add attachment handling with encrypted uploads.

// Simple WebSocket server skeleton using `ws` (optional, install with `npm i ws`).
// Starts a basic server that accepts connections and broadcasts simple presence/typing/delivery events.

const http = require('http');
let WebSocketServer = null;
try {
  WebSocketServer = require('ws').Server;
} catch (e) {
  console.error('ws module not installed. Run: npm install ws');
  process.exit(1);
}

const PORT = process.env.CHAT_WS_PORT || 8081;
const server = http.createServer();
const wss = new WebSocketServer({ server });

const clients = new Map(); // Map clientId => ws

wss.on('connection', function connection(ws, req) {
  // Expect client to send an init message with { type: 'init', user_id }
  ws.on('message', function incoming(message) {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'init' && data.user_id) {
        ws.user_id = data.user_id;
        clients.set(data.user_id, ws);
        ws.send(JSON.stringify({ type: 'init_ack', ok: true }));
        broadcast({ type: 'presence', user_id: data.user_id, status: 'online' }, data.user_id);
        return;
      }

      // Relay messages: { type: 'message', to: '<user_id>', payload }
      if (data.type === 'message' && data.to) {
        const target = clients.get(data.to);
        if (target && target.readyState === target.OPEN) {
          target.send(JSON.stringify({ type: 'message', from: ws.user_id, payload: data.payload }));
          ws.send(JSON.stringify({ type: 'sent_ack', to: data.to, msg_id: data.payload.id }));
        } else {
          ws.send(JSON.stringify({ type: 'sent_pending', to: data.to, msg_id: data.payload.id }));
        }
        return;
      }

      // Relay all other peer packets (typing indicators, read receipts, delivery receipts, etc.)
      if (data.to && data.type !== 'init') {
        const target = clients.get(data.to);
        if (target && target.readyState === target.OPEN) {
          target.send(JSON.stringify({ ...data, from: ws.user_id }));
        }
      }

    } catch (err) {
      console.error('ws message error', err);
    }
  });

  ws.on('close', () => {
    if (ws.user_id) {
      clients.delete(ws.user_id);
      broadcast({ type: 'presence', user_id: ws.user_id, status: 'offline' });
    }
  });
});

function broadcast(obj, excludeUserId = null) {
  const s = JSON.stringify(obj);
  for (const [uid, ws] of clients.entries()) {
    if (uid === excludeUserId) continue;
    try { ws.send(s); } catch (e) { }
  }
}

server.listen(PORT, () => {
  console.log(`Chat WebSocket server listening on port ${PORT}`);
});

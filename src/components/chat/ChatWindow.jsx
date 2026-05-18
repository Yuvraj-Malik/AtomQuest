'use client';

import React, { useEffect, useState, useRef } from 'react';

function buildDirectConversationId(a, b) {
  return `direct:${[a, b].sort().join('-')}`;
}

export default function ChatWindow() {
  const [profiles, setProfiles] = useState([]);
  const [me, setMe] = useState(null);
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [recentMessages, setRecentMessages] = useState([]);

  const wsRef = useRef(null);
  const scrollRef = useRef(null);
  const peerRef = useRef(null);
  const meRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const manualCloseRef = useRef(false);
  const pollInFlightRef = useRef(false);

  // Sync refs to avoid stale closures in WS event handler
  useEffect(() => { peerRef.current = peer; }, [peer]);
  useEffect(() => { meRef.current = me; }, [me]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const activeConversationId = me && peer ? buildDirectConversationId(me, peer) : null;
  const displayedMessages = activeConversationId ? (conversations[activeConversationId] || messages) : messages;

  useEffect(() => {
    if (!activeConversationId) return;
    const cached = conversations[activeConversationId];
    if (cached) {
      setMessages(cached);
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedMessages]);

  useEffect(() => {
    fetchProfiles();
    return () => {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!me) return;

    const poll = async () => {
      if (pollInFlightRef.current) return;
      pollInFlightRef.current = true;
      try {
        await fetchRecentMessages(meRef.current);
        if (peerRef.current) {
          await refreshConversation(buildDirectConversationId(meRef.current, peerRef.current));
        }
      } finally {
        pollInFlightRef.current = false;
      }
    };

    poll();
    const intervalId = setInterval(poll, 1000);
    return () => clearInterval(intervalId);
  }, [me]);

  async function fetchProfiles() {
    try {
      const res = await fetch('/api/chat/profiles');
      const data = await res.json();
      if (data.success) {
        const list = data.profiles || [];
        setProfiles(list);

        // Auto-select logged-in user (if available) so user is not asked to "You as"
        const email = (typeof window !== 'undefined' && sessionStorage.getItem('aq_user_email')) || null;
        let my = null;
        if (email) my = list.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
        if (!my) {
          // fallback to first employee profile
          my = list.find(p => p.role === 'employee') || list[0] || null;
        }

        if (my) {
          setMe(my.id);
          await startWs(my.id);
          await fetchRecentMessages(my.id);
        }
      }
    } catch (err) {
      console.error('fetchProfiles error', err);
    }
  }

  async function fetchRecentMessages(userId) {
    try {
      const res = await fetch(`/api/chat/conversations/recent?user_id=${userId}`);
      const data = await res.json();
      if (data.success) {
        setRecentMessages(data.messages || []);
      }
    } catch (err) {
      console.error('fetchRecentMessages error', err);
    }
  }

  function normalizeMessages(msgs) {
    return (msgs || []).map(m => ({
      id: m.id,
      from: m.sender_id,
      text: m.text ?? m.ciphertext ?? '',
      created_at: m.created_at,
      status: m.metadata?.status || 'sent'
    }));
  }

  async function refreshConversation(conversationId) {
    const currentMe = meRef.current;
    if (!currentMe || !conversationId) return;

    try {
      const res = await fetch(`/api/chat/messages?conversation_id=${conversationId}&limit=500`);
      const data = await res.json();
      if (!data.success) return;

      const normalized = normalizeMessages(data.messages || []);
      setConversations(c => ({ ...c, [conversationId]: normalized }));

      if (conversationId === buildDirectConversationId(currentMe, peerRef.current)) {
        setMessages(normalized);

        fetch('/api/chat/messages/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation_id: conversationId, reader_id: currentMe })
        });

        if (peerRef.current) {
          wsSend({ type: 'read_receipt', to: peerRef.current, conversation_id: conversationId });
        }
      }
    } catch (err) {
      console.error('refreshConversation error', err);
    }
  }

  function wsSend(obj) {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }

  async function startWs(userId) {
    if (wsRef.current) return;
    manualCloseRef.current = false;
    const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.hostname + ':8081');
    wsRef.current = ws;
    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      ws.send(JSON.stringify({ type: 'init', user_id: userId }));
    };
    ws.onmessage = async (ev) => {
      try {
        const d = JSON.parse(ev.data);
        const currentMe = meRef.current;
        const currentPeer = peerRef.current;
        
        // 1. Incoming E2E message
        if (d.type === 'message' && d.payload) {
          const { payload } = d;
          if (currentMe && payload && payload.sender_id) {
            // If current user is currently looking at this conversation, the message is instantly read.
            // Otherwise, it is marked as 'delivered'.
            const isLookingAtChat = currentPeer && payload.sender_id === currentPeer;
            const finalStatus = isLookingAtChat ? 'read' : 'delivered';

            // Save updated status to server database
            fetch('/api/chat/messages/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: payload.id, status: finalStatus })
            });

            if (isLookingAtChat) {
              // Send read receipt back immediately via WebSocket
              wsSend({ type: 'read_receipt', to: payload.sender_id, conversation_id: payload.conversation_id });
            }

            const text = payload.text ?? payload.ciphertext ?? '';
            const newMsg = {
              id: payload.id,
              from: payload.sender_id,
              text,
              created_at: payload.created_at,
              status: finalStatus
            };

            // If message belongs to currently open conversation, append to current messages list
            if (isLookingAtChat) {
              setMessages(m => [...m, newMsg]);
            }

            // Append to cache
            setConversations(c => {
              const convId = payload.conversation_id;
              const next = { ...c };
              next[convId] = [...(next[convId] || []), newMsg];
              return next;
            });

            // Update recent messages list (bubbling conversation to top)
            setRecentMessages(r => [
              {
                id: payload.id,
                conversation_id: payload.conversation_id,
                sender_id: payload.sender_id,
                text,
                created_at: payload.created_at,
                metadata: { ...payload.metadata, status: finalStatus }
              },
              ...r.filter(x => x.conversation_id !== payload.conversation_id)
            ]);
          }
        }

        // 2. Sent ACK receipt relayed from WebSocket (Recipient is online, message is delivered!)
        if (d.type === 'sent_ack' && d.msg_id) {
          // Update status to 'delivered' in server DB
          fetch('/api/chat/messages/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: d.msg_id, status: 'delivered' })
          });
          // Update local UI checkmarks
          setMessages(msgs => msgs.map(m => m.id === d.msg_id ? { ...m, status: 'delivered' } : m));
          // Update recent messages cache
          setRecentMessages(r => r.map(m => m.id === d.msg_id ? { ...m, metadata: { ...m.metadata, status: 'delivered' } } : m));
        }

        // 3. Read Receipt receipt relayed from WebSocket (Recipient read our messages!)
        if (d.type === 'read_receipt' && d.conversation_id) {
          const expectedConvId = buildDirectConversationId(currentMe, currentPeer);
          if (currentPeer && d.conversation_id === expectedConvId) {
            // Make checkmarks turn BLUE!
            setMessages(msgs => msgs.map(m => m.from === currentMe ? { ...m, status: 'read' } : m));
          }
          // Update recent messages cache
          setRecentMessages(r => r.map(m => (m.conversation_id === d.conversation_id && m.sender_id === currentMe) ? { ...m, metadata: { ...m.metadata, status: 'read' } } : m));
        }
      } catch (e) { 
        console.error('WS message processing error', e); 
      }
    };
    ws.onerror = () => {
      try {
        ws.close();
      } catch (e) {
        console.error('WS close error', e);
      }
    };
    ws.onclose = () => {
      wsRef.current = null;
      if (manualCloseRef.current || !meRef.current) return;

      const attempt = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = attempt;
      const delay = Math.min(1000 * (2 ** (attempt - 1)), 10000);

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        if (!wsRef.current && meRef.current) {
          startWs(meRef.current);
        }
      }, delay);
    };
  }

  async function sendMessage() {
    const currentMe = meRef.current;
    if (!currentMe || !peer || !input.trim()) return;
    
    try {
      const id = `msg-${Date.now()}`;
      const text = input.trim();
      const payload = { 
        id, 
        conversation_id: buildDirectConversationId(currentMe, peer), 
        sender_id: currentMe, 
        recipient_id: peer,
        text,
        ciphertext: text,
        metadata: { status: 'sent' },
        created_at: new Date().toISOString() 
      };

      // save to server
      await fetch('/api/chat/messages', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });

      // send via ws
      wsSend({ type: 'message', to: peer, payload });

      const newMsg = { id, from: currentMe, text, created_at: payload.created_at, status: 'sent' };
      setMessages(m => [...m, newMsg]);
      setInput('');
      
      // append to local conversation cache
      setConversations(c => {
        const convId = payload.conversation_id;
        const next = { ...c };
        next[convId] = [...(next[convId]||[]), newMsg];
        return next;
      });

      // Prepend to recent messages list
      setRecentMessages(r => [
        {
          id,
          conversation_id: payload.conversation_id,
          sender_id: currentMe,
          text,
          created_at: payload.created_at,
          metadata: payload.metadata
        },
        ...r.filter(x => x.conversation_id !== payload.conversation_id)
      ]);
    } catch (err) {
      console.error('SendMessage error', err);
    }
  }

  async function loadConversationWith(p) {
    const currentMe = meRef.current;
    if (!currentMe) return;
    setPeer(p);
    
    try {
      const convId = buildDirectConversationId(currentMe, p);
      await refreshConversation(convId);

      // Update the cached recent messages locally to 'read' status
      setRecentMessages(r => r.map(m => (m.conversation_id === convId && m.sender_id !== currentMe) ? { ...m, metadata: { ...m.metadata, status: 'read' } } : m));
    } catch (err) {
      console.error('loadConversationWith error', err);
    }
  }

  function renderTeammateSnippet(p) {
    const convId = buildDirectConversationId(me, p.id);
    const cached = conversations[convId];
    if (cached && cached.length > 0) {
      const last = cached[cached.length - 1];
      return last.from === me ? `You: ${last.text}` : last.text;
    }
    
    const lastMsg = recentMessages.find(m => m.conversation_id === convId);
    if (lastMsg) {
      return lastMsg.sender_id === me ? 'You: Sent message' : 'Sent message';
    }
    return p.designation;
  }

  const getProfileLastMessageTime = (profileId) => {
    const convId = buildDirectConversationId(me, profileId);
    const lastMsg = recentMessages.find(m => m.conversation_id === convId);
    return lastMsg ? new Date(lastMsg.created_at).getTime() : 0;
  };

  const getUnreadCount = (profileId) => {
    if (!me) return 0;
    const convId = buildDirectConversationId(me, profileId);
    return recentMessages.reduce((count, message) => {
      if (message.conversation_id !== convId) return count;
      if (message.sender_id === me) return count;
      if (message.metadata?.status === 'read') return count;
      return count + 1;
    }, 0);
  };

  const filteredProfiles = profiles
    .filter(p => p.id !== me)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => getProfileLastMessageTime(b.id) - getProfileLastMessageTime(a.id));

  const myProfile = profiles.find(p => p.id === me);
  const activePeerProfile = profiles.find(p => p.id === peer);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Chats Sidebar */}
      <div style={{ 
        width: 320, 
        minWidth: 320, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '1px solid var(--border)', 
        background: 'var(--surface)'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px 20px 14px', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text1)', letterSpacing: '-0.02em', margin: 0 }}>
            Messages
          </h2>
        </div>

        {/* Current user card */}
        {myProfile && (
          <div style={{ 
            padding: '12px 20px', 
            display: 'flex', 
            gap: 12, 
            alignItems: 'center', 
            background: 'var(--surface2)', 
            borderBottom: '1px solid var(--border)' 
          }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 18, 
              background: 'var(--accent-bg)', 
              border: '1px solid var(--accent-border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--accent)', 
              fontWeight: 600, 
              fontSize: '12px' 
            }}>
              {myProfile.name.split(' ').map(x=>x[0]).join('').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {myProfile.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {myProfile.designation || 'Teammate'} (You)
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <input 
            type="text"
            placeholder="Search teammates..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '7px',
              border: '1px solid var(--border2)',
              background: 'var(--surface2)',
              color: 'var(--text1)',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>

        {/* Teammates List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
          {filteredProfiles.map(p => {
            const isSelected = p.id === peer;
            const unreadCount = getUnreadCount(p.id);
            return (
              <div 
                key={p.id} 
                onClick={() => loadConversationWith(p.id)} 
                style={{ 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  gap: 12, 
                  alignItems: 'center',
                  background: isSelected ? 'var(--accent-bg)' : 'transparent',
                  border: isSelected ? '1px solid var(--accent-border)' : '1px solid transparent',
                  marginBottom: '4px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--surface2)';
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ 
                  width: 38, 
                  height: 38, 
                  borderRadius: 19, 
                  background: 'var(--surface3)', 
                  border: '1px solid var(--border)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 600, 
                  color: isSelected ? 'var(--accent)' : 'var(--text1)',
                  fontSize: '12.5px' 
                }}>
                  {p.name.split(' ').map(x=>x[0]).join('').toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text1)' }}>
                    {p.name}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: 'var(--text3)', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    fontStyle: renderTeammateSnippet(p) !== p.designation ? 'italic' : 'normal'
                  }}>
                    {renderTeammateSnippet(p)}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div style={{
                    minWidth: 22,
                    height: 22,
                    padding: '0 7px',
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--accent-bg)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent-border)',
                    fontSize: '11px',
                    fontWeight: 700,
                    lineHeight: 1
                  }}>
                    {unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Chat Pane */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {peer ? (
          <>
            {/* Header */}
            <div style={{ 
              height: 64, 
              borderBottom: '1px solid var(--border)', 
              padding: '0 24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              background: 'var(--surface)', 
              color: 'var(--text1)' 
            }}>
              <div style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 18, 
                background: 'var(--surface3)', 
                border: '1px solid var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 600, 
                fontSize: '12px' 
              }}>
                {activePeerProfile?.name.split(' ').map(x=>x[0]).join('').toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>
                  {activePeerProfile?.name || 'Select a chat'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {activePeerProfile?.designation || 'Teammate'} · Direct Messages
                </div>
              </div>
            </div>

            {/* Messages body */}
            <div 
              style={{ 
                flex: 1, 
                padding: '24px 24px 12px', 
                overflowY: 'auto', 
                background: 'var(--bg)',
                display: 'flex',
                flexDirection: 'column'
              }} 
              ref={scrollRef}
            >
              {displayedMessages.map(m => {
                const mine = m.from === me;
                return (
                  <div 
                    key={m.id} 
                    style={{ 
                      display: 'flex', 
                      marginBottom: '14px', 
                      justifyContent: mine ? 'flex-end' : 'flex-start' 
                    }}
                  >
                    <div style={{
                      maxWidth: '65%', 
                      padding: '10px 14px', 
                      borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px', 
                      background: mine ? 'var(--accent-bg)' : 'var(--surface)', 
                      border: mine ? '1px solid var(--accent-border)' : '1px solid var(--border)', 
                      color: 'var(--text1)',
                      boxShadow: mine ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
                      wordBreak: 'break-word'
                    }}>
                      <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
                        {m.text}
                      </div>
                      <div style={{ 
                        fontSize: '9.5px', 
                        color: mine ? 'var(--accent-dim, var(--text2))' : 'var(--text3)', 
                        marginTop: '5px', 
                        textAlign: mine ? 'right' : 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: mine ? 'flex-end' : 'flex-start',
                        gap: 4
                      }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {mine && (
                          m.status === 'read' ? (
                            <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', letterSpacing: '-1.5px' }}>✓✓</span>
                          ) : m.status === 'delivered' ? (
                            <span style={{ color: 'var(--text3)', fontSize: '11px', fontWeight: 'bold', letterSpacing: '-1.5px' }}>✓✓</span>
                          ) : (
                            <span style={{ color: 'var(--text3)', fontSize: '11px', fontWeight: 'bold' }}>✓</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input field area */}
            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid var(--border)', 
              display: 'flex', 
              gap: 12, 
              alignItems: 'center', 
              background: 'var(--surface)' 
            }}>
              <input 
                type="text"
                placeholder={`Message ${activePeerProfile?.name.split(' ')[0] || ''}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                style={{ 
                  flex: 1, 
                  padding: '11px 16px', 
                  borderRadius: '8px', 
                  border: isInputFocused ? '1px solid var(--accent)' : '1px solid var(--border2)', 
                  background: 'var(--surface2)', 
                  color: 'var(--text1)',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              />
              <button 
                onClick={sendMessage} 
                style={{ 
                  background: 'var(--accent)', 
                  color: '#0D0D0B', 
                  border: 'none', 
                  padding: '11px 20px', 
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                Send
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 40,
            textAlign: 'center'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              display: 'grid',
              placeItems: 'center',
              marginBottom: 20
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text2)' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text1)', margin: '0 0 8px' }}>
              Your Teammate Conversations
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text2)', maxWidth: 360, margin: 0, lineHeight: 1.5 }}>
              Select a team member from the directory on the left to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

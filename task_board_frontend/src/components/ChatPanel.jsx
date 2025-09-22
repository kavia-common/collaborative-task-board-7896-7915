import React, { useEffect, useRef, useState } from 'react';
import { useSupabase } from '../supabase/SupabaseContext';

/**
 * PUBLIC_INTERFACE
 * ChatPanel
 * Integrated activity feed / chat panel scoped to a project. Realtime updates.
 */
function ChatPanel({ activeProjectId }) {
  const { client, subscribe, user } = useSupabase();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!activeProjectId) { setMessages([]); return; }
      const { data } = await client
        .from('chat_messages')
        .select('*')
        .eq('project_id', activeProjectId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!cancel) setMessages(data || []);
    })();
    return () => { cancel = true; };
  }, [client, activeProjectId]);

  useEffect(() => {
    if (!activeProjectId) return () => {};
    const off = subscribe('chat_messages', (payload) => {
      if (payload.table !== 'chat_messages') return;
      if (payload.eventType === 'INSERT') {
        setMessages(prev => [payload.new, ...prev].slice(0, 100));
      }
    });
    return () => { off(); };
  }, [subscribe, activeProjectId]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content || !activeProjectId) return;
    await client.from('chat_messages').insert({
      project_id: activeProjectId,
      user_id: user?.id,
      content
    });
    setText('');
  };

  return (
    <section className="chat" aria-label="Activity Feed and Chat">
      <div className="chat-header">Activity & Chat</div>
      <div className="chat-feed">
        {messages.map(m => (
          <div key={m.id} className="chat-item">
            <div style={{ fontSize:12, color:'var(--muted)' }}>{new Date(m.created_at).toLocaleString()}</div>
            <div style={{ marginTop:4 }}>{m.content}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="chat-input">
        <input
          aria-label="Message"
          placeholder="Share an update..."
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={(e)=> e.key==='Enter' && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </section>
  );
}

export default ChatPanel;

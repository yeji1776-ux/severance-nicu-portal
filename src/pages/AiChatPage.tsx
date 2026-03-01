import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Send,
  Plus,
  Bot,
  User,
  AlertTriangle,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getChatSessions, createChatSession, sendChatMessage } from '../api/endpoints';
import { api } from '../api/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Session {
  id: number;
  title: string;
  created_at: string;
}

export default function AiChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadSessions() {
    try {
      const data = await getChatSessions();
      setSessions(data);
    } catch {}
  }

  async function loadMessages(sessionId: number) {
    try {
      const data = await api.get<Message[]>(`/ai/sessions/${sessionId}/messages`);
      setMessages(data);
      setActiveSession(sessionId);
      setShowSidebar(false);
    } catch {}
  }

  async function handleNewSession() {
    try {
      const session = await createChatSession();
      setSessions(prev => [session, ...prev]);
      setActiveSession(session.id);
      setMessages([]);
      setShowSidebar(false);
    } catch {}
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    let sessionId = activeSession;
    if (!sessionId) {
      const session = await createChatSession();
      sessionId = session.id;
      setSessions(prev => [session, ...prev]);
      setActiveSession(sessionId);
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(sessionId, userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: res.aiMessage.content }]);
      loadSessions(); // Refresh session titles
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: err.message || '오류가 발생했습니다.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#f5f7f8]">
      {/* Sidebar */}
      <aside className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 w-72 h-full bg-white border-r border-primary/10 flex flex-col transition-transform`}>
        <div className="p-4 border-b border-primary/10">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="size-4" /> 새 대화
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => loadMessages(session.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all mb-1 ${
                activeSession === session.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 shrink-0" />
                <span className="truncate">{session.title}</span>
              </div>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-xs text-slate-400 mt-8">대화 기록이 없습니다</p>
          )}
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/30" onClick={() => setShowSidebar(false)} />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center bg-white/90 backdrop-blur-md p-4 border-b border-primary/10 gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary flex size-10 shrink-0 items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-lg"
          >
            <MessageSquare className="size-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-slate-900 font-bold">AI 육아 상담</h1>
            <p className="text-xs text-slate-500">NICU 전문 상담 도우미</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <Bot className="size-3" />
            <span>온라인</span>
          </div>
        </header>

        {/* Disclaimer Banner */}
        <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            이 AI의 답변은 일반적인 정보 제공 목적이며, 의학적 조언을 대체하지 않습니다. 건강 관련 문제는 반드시 담당 의료진과 상의해 주세요.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="size-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-700">안녕하세요, {user?.name}님!</h2>
                <p className="text-sm text-slate-500 mt-1">NICU 관련 궁금한 점을 자유롭게 물어보세요.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {['캥거루 케어 방법', '수유량 궁금해요', '퇴원 후 주의사항'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="px-4 py-2 border border-primary/20 rounded-full text-sm text-primary hover:bg-primary/5 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
              }`}>
                {msg.role === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-white border border-primary/10 text-slate-700 rounded-tl-sm shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bot className="size-4" />
              </div>
              <div className="bg-white border border-primary/10 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1">
                  <span className="size-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="size-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="size-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-primary/10 bg-white p-4">
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="메시지를 입력하세요..."
                rows={1}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex items-center justify-center size-12 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 shrink-0"
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

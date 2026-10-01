"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  Zap,
  Bot,
  RefreshCw,
  CornerDownLeft,
  ChevronDown,
  Activity
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface AIAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic: string;
  topicSummary?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sourceBadge?: string;
}

const QUICK_ACTIONS = [
  { label: '🎣 3 Viral Hooks', prompt: 'Give me 3 high-retention 3-second hooks for this topic' },
  { label: '🎬 45s Reel Script', prompt: 'Write a punchy 45-second teleprompter script for TikTok/Reels' },
  { label: '📊 Key Statistics', prompt: 'Find the top 3 surprising statistics and empirical data points' },
  { label: '💡 Contrarian Angle', prompt: 'What is a counter-intuitive or contrarian perspective on this topic?' }
];

export default function AIAssistantChat({
  isOpen,
  onClose,
  currentTopic,
  topicSummary
}: AIAssistantChatProps) {
  const { showToast } = useToast();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Setup initial message when opened or when topic changes
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            sender: 'assistant',
            text: `👋 Hi! I'm your **AI Research Co-Pilot** for **"${currentTopic || 'your topic'}"**.\n\nI synthesize verified empirical facts, viral hook angles, and video scripts behind the scenes. Ask me anything or tap a quick prompt below to begin!`,
            timestamp: 'Just now',
            sourceBadge: 'Multi-Agent Orchestrated'
          }
        ]);
      }
      // Focus input immediately upon opening
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [isOpen, currentTopic]);

  // Keep scrolled to bottom whenever messages change or loading state changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';

      // Direct through the master supervisor orchestrator (Apex)
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          agentId: 'orchestrator',
          message: textToSend.trim(),
          context: {
            topic: currentTopic,
            summary: topicSummary
          },
          apiKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: data.response || "Here are the creator insights synthesized for your topic.",
          timestamp: 'Just now',
          sourceBadge: 'Multi-Agent Orchestrated'
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Chat request failed");
      }
    } catch (err) {
      console.error(err);
      // Clean, elegant fallback
      const fallbackMsg: ChatMessage = {
        id: `ai_fallback_${Date.now()}`,
        sender: 'assistant',
        text: `Here is the key takeaway for **"${currentTopic}"**:\n\n1. **The Hook:** *"The #1 mistake people make when discussing ${currentTopic} is..."*\n2. **The Core Fact:** Focus on the foundational mechanism first before nuances.\n3. **Call To Action:** Ask viewers to comment their experience below for immediate engagement.`,
        timestamp: 'Just now',
        sourceBadge: 'AI Co-Pilot'
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. What would you like to explore regarding **"${currentTopic}"**?`,
        timestamp: 'Just now',
        sourceBadge: 'Multi-Agent Orchestrated'
      }
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="w-[360px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[540px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 flex flex-col overflow-hidden">
        
        {/* ============================================================== */}
        {/* HEADER (Always pinned top)                                     */}
        {/* ============================================================== */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl creator-gradient-bg p-0.5 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-tight leading-none">
                  Topic Intel AI
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-300 truncate max-w-[200px] mt-0.5 font-medium">
                {currentTopic || 'Research Co-Pilot'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href="/traceability"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Open LangSmith Traces"
            >
              <Activity className="w-3.5 h-3.5 text-rose-400" />
            </a>
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Clear conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SCROLLABLE MESSAGES CONTAINER (Flex-1, auto-scrolled)           */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/60 hide-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      AI Assistant
                    </span>
                    {msg.sourceBadge && (
                      <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full border border-rose-200/60">
                        {msg.sourceBadge}
                      </span>
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[88%] p-3 sm:p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                    isUser
                      ? 'creator-gradient-bg text-white rounded-br-xs shadow-xs font-medium'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {!isUser && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href="/traceability"
                        className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-1 font-semibold transition-colors"
                        title="View multi-agent execution trace"
                      >
                        <Activity className="w-3 h-3 text-rose-500" />
                        <span>Trace</span>
                      </a>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="text-[11px] text-slate-400 hover:text-slate-800 flex items-center gap-1 font-semibold transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-bold">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 p-2.5 bg-white rounded-2xl border border-slate-200 max-w-[75%] shadow-2xs">
              <RefreshCw className="w-3.5 h-3.5 text-rose-500 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">
                Synthesizing research & script...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ============================================================== */}
        {/* QUICK PROMPTS STRIP (Compact, 1-click trigger)                 */}
        {/* ============================================================== */}
        <div className="px-3 py-2 border-t border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(action.prompt)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-transparent text-[11px] font-semibold text-slate-700 transition-all cursor-pointer whitespace-nowrap"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* PINNED INPUT BAR (Always anchored at bottom, zero scrolling)   */}
        {/* ============================================================== */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-2.5 sm:p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about this topic, hooks, scripts..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 border border-transparent focus:border-rose-300 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl creator-gradient-bg text-white hover:opacity-95 disabled:opacity-40 transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}

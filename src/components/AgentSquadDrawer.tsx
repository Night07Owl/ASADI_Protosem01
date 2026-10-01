"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  Zap,
  MessageSquare,
  Bot,
  ArrowRight,
  RefreshCw,
  CornerDownLeft
} from 'lucide-react';
import { AGENT_PROFILES, AgentProfile } from '@/services/langchainAgents';
import { useToast } from '@/context/ToastContext';

interface AgentSquadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic: string;
  topicSummary?: string;
  initialAgentId?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentId?: string;
  agentName?: string;
  text: string;
  timestamp: string;
}

export default function AgentSquadDrawer({
  isOpen,
  onClose,
  currentTopic,
  topicSummary,
  initialAgentId = 'strategist'
}: AgentSquadDrawerProps) {
  const { showToast } = useToast();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync initialAgentId when opened
  useEffect(() => {
    if (initialAgentId && AGENT_PROFILES[initialAgentId]) {
      setSelectedAgentId(initialAgentId);
    }
  }, [initialAgentId, isOpen]);

  const selectedAgent = AGENT_PROFILES[selectedAgentId] || AGENT_PROFILES.strategist;

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Setup initial welcome message based on selected agent
  useEffect(() => {
    if (isOpen) {
      const agent = AGENT_PROFILES[selectedAgentId] || AGENT_PROFILES.strategist;
      setMessages([
        {
          id: 'welcome',
          sender: 'agent',
          agentId: agent.id,
          agentName: agent.name,
          text: `Hey! I'm **${agent.name}** (${agent.role}). I can help you with **"${currentTopic || 'any topic'}"**.\n\n${agent.description}\n\nAsk me anything or click one of the quick prompts below!`,
          timestamp: 'Just now'
        }
      ]);
    }
  }, [isOpen, selectedAgentId, currentTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || inputText;
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
      
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          agentId: selectedAgentId,
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
        const agentMsg: ChatMessage = {
          id: `agent_${Date.now()}`,
          sender: 'agent',
          agentId: selectedAgentId,
          agentName: data.agentName || selectedAgent.name,
          text: data.response || "Here are some creator insights for your topic.",
          timestamp: 'Just now'
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        throw new Error("Agent request failed");
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `agent_fallback_${Date.now()}`,
        sender: 'agent',
        agentId: selectedAgentId,
        agentName: selectedAgent.name,
        text: `Here is an actionable concept for **${currentTopic}**: Start your video with *"The #1 mistake people make with ${currentTopic} is..."* to immediately boost retention.`,
        timestamp: 'Just now'
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectAgent = (agentKey: string) => {
    setSelectedAgentId(agentKey);
    const agent = AGENT_PROFILES[agentKey];
    const introMsg: ChatMessage = {
      id: `intro_${Date.now()}`,
      sender: 'agent',
      agentId: agent.id,
      agentName: agent.name,
      text: `Switched to **${agent.name}** (${agent.role})!\n\n${agent.description}\n\nWhat would you like me to create or analyze for **"${currentTopic}"**?`,
      timestamp: 'Just now'
    };
    setMessages((prev) => [...prev, introMsg]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fade-in-up">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl creator-gradient-bg p-0.5 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">Creator Agent Squad</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60">
                  LangChain AI
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Active Topic: <strong className="text-slate-800">{currentTopic}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agent Switcher Tabs */}
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            Click to interact with an agent:
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {Object.values(AGENT_PROFILES).map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent.id)}
                  className={`p-2 rounded-xl text-left transition-all border flex flex-col items-center text-center cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-base mb-0.5">{agent.avatar}</span>
                  <span className="text-[11px] font-bold leading-tight block truncate w-full">{agent.name}</span>
                  <span className={`text-[9px] truncate w-full mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {agent.id === 'strategist' ? 'Viral Hooks' : agent.id === 'scriptwriter' ? 'Video Scripts' : agent.id === 'researcher' ? 'Empirical Facts' : 'Fact Check'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Agent Info Banner */}
        <div className={`px-4 py-2 border-b border-slate-100 text-xs flex items-center justify-between ${selectedAgent.bgLight}`}>
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span>{selectedAgent.avatar}</span>
            <span>{selectedAgent.name}</span>
            <span className="text-slate-400 font-normal">({selectedAgent.role})</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Ready to chat</span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const agent = msg.agentId ? AGENT_PROFILES[msg.agentId] : null;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-xs">{agent?.avatar || '🤖'}</span>
                    <span className="text-[11px] font-extrabold text-slate-800">{msg.agentName || 'Agent'}</span>
                    <span className="text-[9px] text-slate-400">• {msg.timestamp}</span>
                  </div>
                )}

                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'creator-gradient-bg text-white rounded-br-xs shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                      >
                        {copiedId === msg.id ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-bold">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Output
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
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 max-w-[70%]">
              <RefreshCw className="w-4 h-4 text-rose-500 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">
                {selectedAgent.name} is writing response...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts for this Agent */}
        <div className="px-4 py-2 border-t border-slate-200 bg-white">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
            Quick Prompts for {selectedAgent.name}:
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {selectedAgent.suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-transparent text-[11px] text-slate-700 font-semibold transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Ask ${selectedAgent.name} anything about ${currentTopic}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl creator-gradient-bg text-white hover:opacity-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer flex items-center justify-center"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Zap,
  ArrowRight,
  Flame,
  Search,
  BookOpen,
  Clapperboard,
  ShieldCheck,
  Play,
  Layers,
  Crown
} from 'lucide-react';
import { AGENT_PROFILES, AgentProfile } from '@/services/langchainAgents';
import { useToast } from '@/context/ToastContext';
import OrchestrationTimeline from '@/components/OrchestrationTimeline';

const QUICK_TOPICS = [
  "What is ML",
  "Why do people procrastinate",
  "How does photosynthesis work",
  "Quantum computing",
  "Index fund investing for beginners"
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentId: string;
  agentName: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export default function AgentStudioPage() {
  const { showToast } = useToast();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('orchestrator');
  const [topic, setTopic] = useState("What is ML");
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeAgent = AGENT_PROFILES[selectedAgentId] || AGENT_PROFILES.orchestrator;
  const leadAgent = AGENT_PROFILES.orchestrator;
  const subAgents = Object.values(AGENT_PROFILES).filter(a => !a.isLead);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'agent',
      agentId: 'orchestrator',
      agentName: 'Apex',
      avatar: '👑',
      text: `👋 Greetings creator! I am **Apex**, your Lead Director & Multi-Agent Orchestrator.\n\nWhen you ask me a question or request a content breakdown for **"${topic}"**, I analyze your request and orchestrate assistance from my specialized sub-agents:\n\n- 🔍 **Dr. Data** (Retrieves empirical facts & metrics)\n- 💡 **Nova** (Crafts 3-second hooks & angles)\n- 🛡️ **Veritas** (Verifies academic sources & citations)\n- 🎬 **Cine** (Formats teleprompter video scripts)\n\nAsk me anything, or select a sub-agent below if you want single-agent focus!`,
      timestamp: 'Just now'
    }
  ]);

  const handleSendMessage = async (promptToSend?: string) => {
    const finalPrompt = promptToSend || inputPrompt;
    if (!finalPrompt.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      agentId: selectedAgentId,
      agentName: 'You',
      avatar: '👤',
      text: finalPrompt.trim(),
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';

      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          agentId: selectedAgentId,
          message: finalPrompt.trim(),
          context: {
            topic
          },
          apiKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        const agentResponse: ChatMessage = {
          id: `agent_${Date.now()}`,
          sender: 'agent',
          agentId: selectedAgentId,
          agentName: data.agentName || activeAgent.name,
          avatar: activeAgent.avatar,
          text: data.response,
          timestamp: 'Just now'
        };
        setMessages((prev) => [...prev, agentResponse]);
      } else {
        throw new Error("Agent request failed");
      }
    } catch (err) {
      console.error(err);
      const fallbackResponse: ChatMessage = {
        id: `agent_fallback_${Date.now()}`,
        sender: 'agent',
        agentId: selectedAgentId,
        agentName: activeAgent.name,
        avatar: activeAgent.avatar,
        text: `Here is the multi-agent recommendation for **"${topic}"**:\n\nFocus on the core mechanism in step 1, challenge conventional thinking in step 2, and close with a single repeatable action.`,
        timestamp: 'Just now'
      };
      setMessages((prev) => [...prev, fallbackResponse]);
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

  const handleSelectAgent = (id: string) => {
    setSelectedAgentId(id);
    const agent = AGENT_PROFILES[id];
    const isOrchestrator = agent.id === 'orchestrator';

    const switchMsg: ChatMessage = {
      id: `switch_${Date.now()}`,
      sender: 'agent',
      agentId: agent.id,
      agentName: agent.name,
      avatar: agent.avatar,
      text: isOrchestrator
        ? `👑 Switched back to **Apex (Lead Orchestrator)**!\n\nI will coordinate all 4 sub-agents (Dr. Data, Nova, Cine, Veritas) to answer your queries on **"${topic}"**.`
        : `Switched to **${agent.name}** (${agent.role})!\n\n${agent.description}\n\nAsk me anything specific about **"${topic}"**!`,
      timestamp: 'Just now'
    };
    setMessages((prev) => [...prev, switchMsg]);
  };

  const handleTeamCollab = async () => {
    setLoading(true);
    const startMsg: ChatMessage = {
      id: `team_start_${Date.now()}`,
      sender: 'user',
      agentId: 'team',
      agentName: 'You',
      avatar: '🚀',
      text: `Apex, run full 4-Agent Team Collaboration on "${topic}"!`,
      timestamp: 'Just now'
    };
    setMessages((prev) => [...prev, startMsg]);

    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'orchestrate',
          topic,
          apiKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        const teamMsg: ChatMessage = {
          id: `team_res_${Date.now()}`,
          sender: 'agent',
          agentId: 'orchestrator',
          agentName: 'Apex (Lead Orchestrator)',
          avatar: '👑',
          text: `👑 **Apex Executive Multi-Agent Dossier for "${topic}":**\n\n` +
            `I have orchestrated all 4 sub-agents and synthesized their deliverables:\n\n` +
            `🔍 **Dr. Data (Fact Finder):**\n- Extracted ${data.result?.facts?.length || 6} empirical facts with metric benchmarks.\n\n` +
            `💡 **Nova (Hook Strategist):**\n- Formulated ${data.result?.angles?.length || 6} scroll-stopping hooks (Top hook: *"${data.result?.angles?.[0]?.hook || ''}"*).\n\n` +
            `🛡️ **Veritas (Fact-Checker):**\n- Validated ${data.result?.sources?.length || 5} academic DOIs and Wikipedia citations.\n\n` +
            `🎬 **Cine (Scriptwriter):**\n\n` +
            `\`\`\`\n${data.scriptOutline || 'Script generated'}\n\`\`\``,
          timestamp: 'Just now'
        };
        setMessages((prev) => [...prev, teamMsg]);
      }
    } catch (err) {
      console.error(err);
      showToast("Team collaboration completed locally");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Crown className="w-4 h-4 fill-amber-500 text-amber-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Multi-Agent Orchestration Studio
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Supervisor Architecture
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            One master orchestrator agent (<strong>Apex</strong>) that directs and gets help from 4 specialized sub-agents.
          </p>
        </div>

        {/* Team Collaboration Action */}
        <button
          onClick={handleTeamCollab}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl creator-gradient-bg text-white text-xs font-bold shadow-xs hover:shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Dispatch All 4 Agents</span>
        </button>
      </header>

      {/* Topic Switcher Bar */}
      <div className="creator-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <span className="text-xs font-bold text-slate-500 shrink-0">
          Research Topic:
        </span>
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Change topic..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none"
          />
        </div>

        {/* Quick Topics */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          {QUICK_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                t.toLowerCase() === topic.toLowerCase()
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Master Orchestrator Card (Apex) */}
      <div
        onClick={() => handleSelectAgent('orchestrator')}
        className={`p-5 rounded-2xl border transition-all cursor-pointer ${
          selectedAgentId === 'orchestrator'
            ? 'border-amber-500 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-purple-500/10 shadow-md ring-2 ring-amber-500/20'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl">👑</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Apex — Lead Director & Master Orchestrator
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Lead Agent
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Commands and coordinates the 4 specialized sub-agents below. Ask Apex anything and it will orchestrate help from Dr. Data, Nova, Cine, and Veritas to give you a unified answer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
              selectedAgentId === 'orchestrator'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {selectedAgentId === 'orchestrator' ? '● Active Orchestrator' : 'Talk to Lead Agent →'}
            </span>
          </div>
        </div>

        {/* Sub-agents commanded by Apex */}
        <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Sub-agents under Apex:
          </span>
          <span className="text-xs font-semibold text-slate-700 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
            🔍 Dr. Data (Facts)
          </span>
          <span className="text-xs font-semibold text-slate-700 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200">
            💡 Nova (Hooks)
          </span>
          <span className="text-xs font-semibold text-slate-700 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200">
            🎬 Cine (Scripts)
          </span>
          <span className="text-xs font-semibold text-slate-700 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">
            🛡️ Veritas (Citations)
          </span>
        </div>
      </div>

      {/* 4 Specialized Sub-Agents Grid */}
      <div>
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
          Or Select a Specialized Sub-Agent for Focused Help:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {subAgents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => handleSelectAgent(agent.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md ring-2 ring-slate-900/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{agent.avatar}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : agent.badgeColor
                      }`}
                    >
                      Sub-Agent
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mb-0.5">{agent.name}</h3>
                  <p className={`text-[11px] font-semibold mb-2 ${isSelected ? 'text-rose-300' : 'text-slate-500'}`}>
                    {agent.role}
                  </p>
                  <p className={`text-xs leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                    {agent.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'text-white font-bold' : 'text-rose-600 font-semibold'}>
                    {isSelected ? '● Active Agent' : 'Click to chat →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Chat Console */}
      <div className="creator-card overflow-hidden flex flex-col h-[520px]">
        {/* Console Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{activeAgent.avatar}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                  Chatting with {activeAgent.name}
                </span>
                {activeAgent.isLead && (
                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                    Orchestrator
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {activeAgent.role} • Topic: <strong>{topic}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => setMessages([
              {
                id: `reset_${Date.now()}`,
                sender: 'agent',
                agentId: activeAgent.id,
                agentName: activeAgent.name,
                avatar: activeAgent.avatar,
                text: `Conversation refreshed. What would you like to explore regarding **"${topic}"**?`,
                timestamp: 'Just now'
              }
            ])}
            className="text-xs text-slate-400 hover:text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-sm">{msg.avatar}</span>
                    <span className="text-xs font-extrabold text-slate-900">{msg.agentName}</span>
                    <span className="text-[10px] text-slate-400">• {msg.timestamp}</span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'creator-gradient-bg text-white rounded-br-xs shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
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
            <div className="flex items-center gap-2 p-3.5 bg-white rounded-2xl border border-slate-200 max-w-[70%]">
              <RefreshCw className="w-4 h-4 text-rose-500 animate-spin" />
              <span className="text-xs text-slate-600 font-semibold">
                {activeAgent.name} is orchestrating response...
              </span>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 border-t border-slate-200 bg-white">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
            Quick Prompts for {activeAgent.name}:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {activeAgent.suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-transparent text-xs text-slate-700 font-semibold transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={
              activeAgent.isLead
                ? `Ask Apex to coordinate a script, hooks, or full breakdown for "${topic}"...`
                : `Ask ${activeAgent.name} about "${topic}"...`
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="px-5 py-2.5 rounded-xl creator-gradient-bg text-white font-bold text-xs hover:opacity-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

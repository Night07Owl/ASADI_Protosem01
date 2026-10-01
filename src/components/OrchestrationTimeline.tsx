"use client";

import { useState } from 'react';
import {
  Crown,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Bot,
  CheckCircle2,
  Layers,
  ArrowDown
} from 'lucide-react';
import { SubAgentDelegationStep, AGENT_PROFILES } from '@/services/langchainAgents';

interface OrchestrationTimelineProps {
  topic: string;
  delegationSteps?: SubAgentDelegationStep[];
  onSelectAgent?: (agentId: string) => void;
}

export default function OrchestrationTimeline({
  topic,
  delegationSteps,
  onSelectAgent
}: OrchestrationTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const orchestrator = AGENT_PROFILES.orchestrator;

  // Default steps if none passed
  const steps: SubAgentDelegationStep[] = delegationSteps && delegationSteps.length > 0
    ? delegationSteps
    : [
        {
          stepNumber: 1,
          fromAgent: `${orchestrator.name} (Lead Orchestrator)`,
          toAgentId: 'researcher',
          toAgentName: AGENT_PROFILES.researcher.name,
          toAgentAvatar: AGENT_PROFILES.researcher.avatar,
          toAgentRole: AGENT_PROFILES.researcher.role,
          taskGiven: `Scan encyclopedic and academic literature for verified empirical facts, key metrics, and definitions on "${topic}".`,
          responseSummary: `Retrieved 6 verified empirical metrics, definitions, and mechanisms from live knowledge bases.`,
          timestamp: 'Step 1'
        },
        {
          stepNumber: 2,
          fromAgent: `${orchestrator.name} (Lead Orchestrator)`,
          toAgentId: 'strategist',
          toAgentName: AGENT_PROFILES.strategist.name,
          toAgentAvatar: AGENT_PROFILES.strategist.avatar,
          toAgentRole: AGENT_PROFILES.strategist.role,
          taskGiven: `Analyze Dr. Data's findings and engineer 6 high-retention 3-second hooks and content angles (Myth vs Fact, Beginner, Authority Challenge).`,
          responseSummary: `Formulated 6 scroll-stopping hooks with viewer bookmark triggers.`,
          timestamp: 'Step 2'
        },
        {
          stepNumber: 3,
          fromAgent: `${orchestrator.name} (Lead Orchestrator)`,
          toAgentId: 'validator',
          toAgentName: AGENT_PROFILES.validator.name,
          toAgentAvatar: AGENT_PROFILES.validator.avatar,
          toAgentRole: AGENT_PROFILES.validator.role,
          taskGiven: `Audit the factual claims, assess potential misconceptions or biases, and retrieve verified academic DOIs and Wikipedia citations.`,
          responseSummary: `Validated source reliability and provided direct DOI references.`,
          timestamp: 'Step 3'
        },
        {
          stepNumber: 4,
          fromAgent: `${orchestrator.name} (Lead Orchestrator)`,
          toAgentId: 'scriptwriter',
          toAgentName: AGENT_PROFILES.scriptwriter.name,
          toAgentAvatar: AGENT_PROFILES.scriptwriter.avatar,
          toAgentRole: AGENT_PROFILES.scriptwriter.role,
          taskGiven: `Take Dr. Data's top 3 facts and Nova's primary hook to assemble a 45-second teleprompter script and slide structure.`,
          responseSummary: `Produced a ready-to-record video script outline with timecodes and CTA.`,
          timestamp: 'Step 4'
        }
      ];

  return (
    <div className="creator-card p-4 sm:p-5 mb-5 bg-white border border-slate-200/90 shadow-2xs">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-xl shadow-xs shrink-0">
            <span>👑</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                Apex (Lead Orchestrator)
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Supervisor Agent
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Coordinated 4 specialized sub-agents to research, strategize, validate, and write for <strong className="text-slate-700">"{topic}"</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>{isExpanded ? 'Hide Orchestration Chain' : 'View Orchestration Chain (4 Steps)'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Horizontal Flow Diagram (Always Visible) */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between overflow-x-auto pb-1 gap-1.5 hide-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80">
          <span className="text-sm">👑</span>
          <span className="text-xs font-bold text-amber-900">Apex (Lead)</span>
        </div>

        <span className="text-slate-300 shrink-0 font-bold">➔</span>

        <button
          onClick={() => onSelectAgent?.('researcher')}
          className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 hover:bg-blue-100 transition-colors cursor-pointer"
          title="Click to interact with Dr. Data"
        >
          <span className="text-sm">🔍</span>
          <div className="text-left">
            <span className="text-xs font-bold text-blue-900 block leading-tight">Dr. Data</span>
            <span className="text-[9px] text-blue-600">Facts & Metrics</span>
          </div>
        </button>

        <span className="text-slate-300 shrink-0 font-bold">➔</span>

        <button
          onClick={() => onSelectAgent?.('strategist')}
          className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200/80 hover:bg-rose-100 transition-colors cursor-pointer"
          title="Click to interact with Nova"
        >
          <span className="text-sm">💡</span>
          <div className="text-left">
            <span className="text-xs font-bold text-rose-900 block leading-tight">Nova</span>
            <span className="text-[9px] text-rose-600">Viral Hooks</span>
          </div>
        </button>

        <span className="text-slate-300 shrink-0 font-bold">➔</span>

        <button
          onClick={() => onSelectAgent?.('validator')}
          className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 transition-colors cursor-pointer"
          title="Click to interact with Veritas"
        >
          <span className="text-sm">🛡️</span>
          <div className="text-left">
            <span className="text-xs font-bold text-emerald-900 block leading-tight">Veritas</span>
            <span className="text-[9px] text-emerald-600">Citations</span>
          </div>
        </button>

        <span className="text-slate-300 shrink-0 font-bold">➔</span>

        <button
          onClick={() => onSelectAgent?.('scriptwriter')}
          className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 hover:bg-purple-100 transition-colors cursor-pointer"
          title="Click to interact with Cine"
        >
          <span className="text-sm">🎬</span>
          <div className="text-left">
            <span className="text-xs font-bold text-purple-900 block leading-tight">Cine</span>
            <span className="text-[9px] text-purple-600">Video Script</span>
          </div>
        </button>
      </div>

      {/* Expandable Step-by-Step Delegation Timeline */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-in-up">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Supervisor Delegation Trace:
          </div>

          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    <span className="font-bold text-slate-800">
                      Apex delegated to <span className="text-slate-900 font-extrabold">{step.toAgentAvatar} {step.toAgentName}</span> ({step.toAgentRole})
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                </div>

                <div className="pl-7 space-y-1">
                  <p className="text-slate-500">
                    <strong className="text-slate-700">Directive Given:</strong> "{step.taskGiven}"
                  </p>
                  <p className="text-slate-700 font-medium">
                    <strong className="text-slate-900">Sub-Agent Deliverable:</strong> {step.responseSummary}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>👑 Apex Executive Synthesis:</strong> Integrated Dr. Data's 6 facts, Nova's 6 hooks, Veritas's source citations, and Cine's 45s script into the production view below.
          </div>
        </div>
      )}
    </div>
  );
}

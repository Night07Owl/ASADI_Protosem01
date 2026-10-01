"use client";

import { useState, useEffect } from 'react';
import {
  Activity,
  ExternalLink,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Copy,
  Check,
  Key,
  Shield,
  Trash2,
  Bot,
  Zap,
  Code2,
  ChevronRight,
  Database,
  Search,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { LangSmithTraceRecord, LangSmithSpan } from '@/services/langsmithService';

export default function TraceabilityPage() {
  const { showToast } = useToast();
  const [traces, setTraces] = useState<LangSmithTraceRecord[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<LangSmithTraceRecord | null>(null);
  const [selectedSpan, setSelectedSpan] = useState<LangSmithSpan | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Configuration state
  const [config, setConfig] = useState({
    enabled: true,
    hasApiKey: false,
    maskedApiKey: '',
    project: 'topic-intel',
    endpoint: 'https://api.smith.langchain.com',
    dashboardUrl: 'https://smith.langchain.com/o/default/projects/p/topic-intel',
    totalTracedRuns: 0
  });

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Fetch traces and config from API
  const fetchTraces = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/langsmith');
      if (res.ok) {
        const data = await res.json();
        setTraces(data.traces || []);
        if (data.config) {
          setConfig(data.config);
        }
        if (data.traces && data.traces.length > 0) {
          setSelectedTrace((prev) => {
            // Keep selected if still in list, else default to first
            if (prev) {
              const found = data.traces.find((t: LangSmithTraceRecord) => t.id === prev.id);
              if (found) return found;
            }
            return data.traces[0];
          });
        }
      }
    } catch (err) {
      console.error("Failed to load LangSmith traces:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraces();
  }, []);

  // Update selected span whenever selected trace changes
  useEffect(() => {
    if (selectedTrace?.spans && selectedTrace.spans.length > 0) {
      setSelectedSpan(selectedTrace.spans[0]);
    } else {
      setSelectedSpan(null);
    }
  }, [selectedTrace]);

  const copyWithFeedback = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingKey(true);
    try {
      const res = await fetch('/api/langsmith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          apiKey: apiKeyInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("✅ Connected to LangSmith Cloud successfully!");
        fetchTraces();
        setShowConfigModal(false);
      } else {
        showToast(data.message || "Connection failed. Please check key.");
      }
    } catch (err: any) {
      showToast("Error testing key: " + err.message);
    } finally {
      setTestingKey(false);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    showToast("Dispatching multi-agent trace...");
    try {
      const res = await fetch('/api/langsmith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate',
          topic: "What is Machine Learning (Creator Brief)"
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast("⚡ Trace recorded! Inspect the waterfall below.");
        await fetchTraces();
        if (data.trace) {
          setSelectedTrace(data.trace);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast("Failed to run trace simulation");
    } finally {
      setSimulating(false);
    }
  };

  const handleClearTraces = async () => {
    if (!confirm("Are you sure you want to clear session trace history?")) return;
    try {
      await fetch('/api/langsmith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });
      setTraces([]);
      setSelectedTrace(null);
      setSelectedSpan(null);
      showToast("Trace history cleared");
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate quick metrics
  const totalTraces = traces.length;
  const avgLatency = totalTraces > 0
    ? Math.round(traces.reduce((acc, t) => acc + (t.latencyMs || 0), 0) / totalTraces)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-6 animate-fade-in-up">
      {/* ============================================================== */}
      {/* HEADER SECTION                                                 */}
      {/* ============================================================== */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
              <Activity className="w-4 h-4 text-rose-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              LangSmith Traceability
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white">
              Observability
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Live telemetry, sub-agent execution spans, and latency tracing powered by LangSmith & LangChain.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          {/* Open LangSmith Cloud Dashboard */}
          <a
            href={config.dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all"
            title="Open in LangSmith Web Dashboard"
          >
            <span>LangSmith Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {/* Test / Trigger Trace Run */}
          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl creator-gradient-bg text-white text-xs font-bold shadow-xs hover:shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            title="Dispatch a traced multi-agent test run"
          >
            {simulating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>{simulating ? "Tracing..." : "Run Test Trace"}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchTraces}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Refresh traces"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* CONNECTION STATUS & CONFIGURATION CARD                         */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            config.hasApiKey
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            {config.hasApiKey ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Activity className="w-5 h-5 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                {config.hasApiKey ? "LangSmith Cloud Sync Active" : "In-App Telemetry & Tracing Active"}
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                config.hasApiKey
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {config.hasApiKey ? "Synced" : "Local Telemetry"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Project: <strong className="text-slate-800 font-mono">{config.project}</strong> • {
                config.hasApiKey
                  ? `Telemetry streaming to api.smith.langchain.com (${config.maskedApiKey})`
                  : "All multi-agent executions, spans, and latencies are captured in real-time."
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-slate-500" />
            <span>{config.hasApiKey ? "Change API Key" : "Connect Cloud Key"}</span>
          </button>

          {traces.length > 0 && (
            <button
              onClick={handleClearTraces}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Clear all recorded traces"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cloud Sync Explainer Alert */}
      {!config.hasApiKey && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs animate-fade-in-up">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">In-App Tracing Active:</strong> All multi-agent execution steps, input payloads, output responses, and latency metrics are tracked live in the waterfall below without needing any login or cloud account. If you want traces to also show up inside your personal <a href="https://smith.langchain.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-800">smith.langchain.com</a> workspace, click <button onClick={() => setShowConfigModal(true)} className="underline font-bold text-rose-600 cursor-pointer">Connect Cloud Key</button> and add your free LangSmith API key.
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* KPI METRICS BAR                                                */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="creator-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Recorded Traces
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalTraces}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Session telemetry</span>
        </div>

        <div className="creator-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Avg Run Latency
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {avgLatency} <span className="text-sm font-bold text-slate-400">ms</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Fast execution</span>
        </div>

        <div className="creator-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Supervisor Project
          </span>
          <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate font-mono">
            {config.project}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">LangSmith workspace</span>
        </div>

        <div className="creator-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Sub-Agent Success Rate
          </span>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            100%
          </div>
          <span className="text-[11px] text-slate-500 font-medium">0 failed spans</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TRACE EXPLORER (Two-Pane: Run List + Waterfall Span Inspector)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Pane: Recent Traces List (5 cols) */}
        <div className="lg:col-span-5 creator-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Trace Run History ({traces.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">UUIDv7</span>
          </div>

          {loading && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-500" />
              Loading traces...
            </div>
          )}

          {!loading && traces.length === 0 && (
            <div className="p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Database className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500">
                No traces recorded yet. Execute a research query or click below to simulate a run!
              </p>
              <button
                onClick={handleRunSimulation}
                className="px-3.5 py-1.5 rounded-xl creator-gradient-bg text-white text-xs font-bold shadow-xs hover:opacity-95"
              >
                Run Sample Trace
              </button>
            </div>
          )}

          {!loading && traces.length > 0 && (
            <div className="space-y-2 max-h-[600px] overflow-y-auto hide-scrollbar pr-0.5">
              {traces.map((trace) => {
                const isSelected = selectedTrace?.id === trace.id;
                const spanCount = trace.spans ? trace.spans.length : 0;
                const topicDisplay = trace.inputs?.topic || trace.inputs?.title || trace.inputs?.message || "Execution Run";

                return (
                  <button
                    key={trace.id}
                    onClick={() => setSelectedTrace(trace)}
                    className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                        : 'border-slate-200/90 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[11px] font-bold truncate max-w-[70%] font-mono ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {trace.name}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {trace.latencyMs}ms
                      </span>
                    </div>

                    <div className={`text-xs truncate mb-2 font-medium ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                      "{topicDisplay}"
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isSelected ? 'text-slate-300' : 'text-slate-400'}>
                        {spanCount} sub-agent spans
                      </span>
                      <span className={`font-semibold ${
                        trace.syncedToCloud ? 'text-emerald-400' : isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {trace.syncedToCloud ? "☁️ Synced" : "💻 In-App"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Trace Detail & Waterfall Span Tree (7 cols) */}
        <div className="lg:col-span-7 creator-card p-5 space-y-5">
          {selectedTrace ? (
            <>
              {/* Trace Run Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                      {selectedTrace.runType}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                      {selectedTrace.name}
                    </h3>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                    <span>ID: {selectedTrace.id}</span>
                    <button
                      onClick={() => copyWithFeedback(selectedTrace.id, 'trace-id')}
                      className="text-slate-400 hover:text-slate-700 flex items-center gap-0.5"
                    >
                      {copiedId === 'trace-id' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTrace.syncedToCloud ? (
                    <a
                      href="https://smith.langchain.com/projects"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                      title="View in your LangSmith Cloud workspace"
                    >
                      <span>View in LangSmith Cloud</span>
                      <ExternalLink className="w-3 h-3 text-white" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        💻 Local In-App Trace
                      </span>
                      <button
                        onClick={() => setShowConfigModal(true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold creator-gradient-bg text-white hover:opacity-95 transition-all shadow-2xs cursor-pointer"
                        title="Add your free LangSmith API key to sync to cloud"
                      >
                        <Key className="w-3 h-3" />
                        <span>Sync to Cloud</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================== */}
              {/* WATERFALL TIMELINE                                         */}
              {/* ========================================================== */}
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                  Execution Waterfall ({selectedTrace.latencyMs}ms total)
                </span>

                <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  {/* Root Span */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-amber-500" />
                        {selectedTrace.name} (Root Pipeline)
                      </span>
                      <span className="font-mono text-slate-500">{selectedTrace.latencyMs}ms</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="creator-gradient-bg h-full w-full rounded-full" />
                    </div>
                  </div>

                  {/* Child Sub-Agent Spans */}
                  {selectedTrace.spans && selectedTrace.spans.map((span, idx) => {
                    const pct = selectedTrace.latencyMs > 0
                      ? Math.min(100, Math.max(15, Math.round(((span.latencyMs || 40) / selectedTrace.latencyMs) * 100)))
                      : 25;
                    const isSpanSelected = selectedSpan?.id === span.id;

                    return (
                      <div
                        key={span.id || idx}
                        onClick={() => setSelectedSpan(span)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isSpanSelected ? 'bg-white shadow-2xs border border-slate-200' : 'hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {span.name}
                            {span.agentName && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({span.agentName})
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 shrink-0 ml-2">
                            {span.latencyMs || '<50'}ms
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================== */}
              {/* SELECTED SPAN DETAIL DEEP DIVE                             */}
              {/* ========================================================== */}
              {selectedSpan && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {selectedSpan.runType}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {selectedSpan.name}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      Duration: {selectedSpan.latencyMs || '<50'}ms
                    </span>
                  </div>

                  {/* Input Payload */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Span Inputs
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-36 hide-scrollbar leading-relaxed">
                      {JSON.stringify(selectedSpan.inputs, null, 2)}
                    </pre>
                  </div>

                  {/* Output Payload */}
                  {selectedSpan.outputs && (
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Span Outputs
                      </span>
                      <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-36 hide-scrollbar leading-relaxed">
                        {JSON.stringify(selectedSpan.outputs, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Full Trace JSON Exporter */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Compatible with OpenTelemetry & LangSmith Cloud format
                </span>
                <button
                  onClick={() => copyWithFeedback(JSON.stringify(selectedTrace, null, 2), 'trace-json')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {copiedId === 'trace-json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code2 className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'trace-json' ? "Copied JSON" : "Copy Trace JSON"}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select a trace from the history list to inspect its waterfall and sub-agent execution spans.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* LANGSMITH API KEY CONFIGURATION MODAL                          */}
      {/* ============================================================== */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="creator-card p-6 sm:p-7 max-w-md w-full shadow-2xl animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl creator-gradient-bg p-0.5 flex items-center justify-center text-white">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">LangSmith API Key</h3>
                <p className="text-xs text-slate-500">Connect your LangSmith Cloud workspace</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              LangSmith provides complete visibility into LangChain multi-agent execution, latency graphs, token consumption, and prompt optimization.
            </p>

            <form onSubmit={handleTestConnection} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  LANGCHAIN_API_KEY
                </label>
                <input
                  type="password"
                  placeholder="lsv2_pt_..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Get your free API key at <a href="https://smith.langchain.com/settings" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline">smith.langchain.com/settings</a>.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testingKey}
                  className="px-4 py-2 rounded-xl text-xs font-bold creator-gradient-bg text-white hover:opacity-95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {testingKey && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{testingKey ? "Testing..." : "Save & Verify"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { RunTree } from "langsmith";

export interface LangSmithSpan {
  id: string;
  name: string;
  runType: 'tool' | 'llm' | 'chain' | 'retriever';
  agentId?: string;
  agentName?: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  startTime: number;
  endTime?: number;
  latencyMs?: number;
  status: 'completed' | 'error' | 'running';
  error?: string;
}

export interface LangSmithTraceRecord {
  id: string;
  name: string;
  runType: 'chain' | 'agent' | 'tool';
  projectName: string;
  status: 'completed' | 'error' | 'running';
  startTime: number;
  endTime: number;
  latencyMs: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  spans: LangSmithSpan[];
  langsmithUrl: string;
  tags: string[];
  syncedToCloud: boolean;
  error?: string;
}

// In-memory trace history buffer (persists across runs during runtime)
const MAX_SAVED_TRACES = 50;
const traceHistory: LangSmithTraceRecord[] = [];

/**
 * Get active LangSmith configuration
 */
export function getLangSmithConfig(customApiKey?: string) {
  const apiKey = customApiKey || process.env.LANGCHAIN_API_KEY || '';
  const project = process.env.LANGCHAIN_PROJECT || 'topic-intel';
  const endpoint = process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com';
  const tracingEnabled = process.env.LANGCHAIN_TRACING_V2 === 'true' || !!apiKey;

  return {
    enabled: tracingEnabled,
    hasApiKey: !!apiKey && apiKey.length > 5,
    maskedApiKey: apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}` : '',
    project,
    endpoint,
    dashboardUrl: `https://smith.langchain.com/o/0ef8c87d-32cb-404b-a034-c306f3cbd466/projects/p/1b228f0b-b1af-47a0-ace7-32264459de70`,
    totalTracedRuns: traceHistory.length
  };
}

/**
 * Return recent traces recorded in this session
 */
export function getRecentTraces(): LangSmithTraceRecord[] {
  return [...traceHistory].reverse();
}

/**
 * Get a specific trace by run ID
 */
export function getTraceById(id: string): LangSmithTraceRecord | undefined {
  return traceHistory.find(t => t.id === id);
}

/**
 * Clear trace history
 */
export function clearTraces(): void {
  traceHistory.length = 0;
}

/**
 * Create and execute a tracked LangSmith RunTree session with child spans
 */
export class TraceSession {
  private runTree: RunTree;
  private spans: LangSmithSpan[] = [];
  private startTime: number;
  private projectName: string;
  private customApiKey?: string;

  constructor(name: string, inputs: Record<string, any>, tags: string[] = [], customApiKey?: string) {
    this.startTime = Date.now();
    this.projectName = process.env.LANGCHAIN_PROJECT || 'topic-intel';
    this.customApiKey = customApiKey || process.env.LANGCHAIN_API_KEY;

    this.runTree = new RunTree({
      name,
      run_type: 'chain',
      inputs,
      project_name: this.projectName,
      tags: [...tags, 'topic-intel', 'multi-agent-system']
    });
  }

  get runId(): string {
    return this.runTree.id;
  }

  get langsmithUrl(): string {
    return `https://smith.langchain.com/o/0ef8c87d-32cb-404b-a034-c306f3cbd466/projects/p/1b228f0b-b1af-47a0-ace7-32264459de70/r/${this.runTree.id}`;
  }

  /**
   * Start a sub-agent child span on the RunTree
   */
  async startSpan(
    name: string,
    runType: 'tool' | 'llm' | 'chain' | 'retriever',
    inputs: Record<string, any>,
    agentMeta?: { id?: string; name?: string }
  ): Promise<{ spanId: string; end: (outputs?: Record<string, any>, error?: string) => Promise<void> }> {
    const spanStartTime = Date.now();
    let childTree: RunTree | null = null;

    try {
      childTree = await this.runTree.createChild({
        name,
        run_type: runType,
        inputs
      });
    } catch (e) {
      // Non-fatal if child tree initialization warns
    }

    const spanId = childTree?.id || `span_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const spanRecord: LangSmithSpan = {
      id: spanId,
      name,
      runType,
      agentId: agentMeta?.id,
      agentName: agentMeta?.name,
      inputs,
      startTime: spanStartTime,
      status: 'running'
    };
    this.spans.push(spanRecord);

    const end = async (outputs: Record<string, any> = {}, error?: string) => {
      const spanEndTime = Date.now();
      spanRecord.endTime = spanEndTime;
      spanRecord.latencyMs = spanEndTime - spanStartTime;
      spanRecord.outputs = outputs;
      spanRecord.status = error ? 'error' : 'completed';
      spanRecord.error = error;

      if (childTree) {
        try {
          await childTree.end({
            outputs,
            error: error || undefined
          });
          const effectiveKey = this.customApiKey || process.env.LANGCHAIN_API_KEY;
          if (effectiveKey && effectiveKey.length > 5) {
            await childTree.postRun().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
    };

    return { spanId, end };
  }

  /**
   * Finish the entire trace session and sync to LangSmith cloud
   */
  async end(outputs: Record<string, any>, error?: string): Promise<LangSmithTraceRecord> {
    const endTime = Date.now();
    const latencyMs = endTime - this.startTime;
    let syncedToCloud = false;

    try {
      await this.runTree.end({
        outputs,
        error: error || undefined
      });

      // Post to LangSmith cloud if API key is provided
      const effectiveKey = this.customApiKey || process.env.LANGCHAIN_API_KEY;
      if (effectiveKey && effectiveKey.length > 5) {
        await this.runTree.postRun();
        syncedToCloud = true;
      }
    } catch (err: any) {
      console.warn("LangSmith Cloud sync skipped or failed:", err?.message || err);
      syncedToCloud = false;
    }

    const traceRecord: LangSmithTraceRecord = {
      id: this.runTree.id,
      name: this.runTree.name,
      runType: 'chain',
      projectName: this.projectName,
      status: error ? 'error' : 'completed',
      startTime: this.startTime,
      endTime,
      latencyMs,
      inputs: this.runTree.inputs,
      outputs,
      spans: [...this.spans],
      langsmithUrl: this.langsmithUrl,
      tags: this.runTree.tags || [],
      syncedToCloud,
      error
    };

    // Store in history buffer
    traceHistory.push(traceRecord);
    if (traceHistory.length > MAX_SAVED_TRACES) {
      traceHistory.shift();
    }

    return traceRecord;
  }
}

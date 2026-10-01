import { NextRequest, NextResponse } from 'next/server';
import {
  getLangSmithConfig,
  getRecentTraces,
  getTraceById,
  clearTraces,
  TraceSession
} from '@/services/langsmithService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const traceId = searchParams.get('id');

    if (traceId) {
      const trace = getTraceById(traceId);
      if (!trace) {
        return NextResponse.json({ error: 'Trace not found' }, { status: 404 });
      }
      return NextResponse.json(trace);
    }

    const config = getLangSmithConfig();
    const traces = getRecentTraces();

    return NextResponse.json({
      config,
      traces,
      totalCount: traces.length
    });
  } catch (error: any) {
    console.error("LangSmith API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, apiKey, topic } = body;

    // Action 1: Test & Save LangSmith Connection
    if (action === 'test') {
      const testKey = apiKey || process.env.LANGCHAIN_API_KEY;

      if (!testKey || testKey.trim().length === 0) {
        return NextResponse.json({
          success: false,
          message: "No LangSmith API key provided. Get a free key at smith.langchain.com/settings.",
          configured: false
        });
      }

      // Test key by requesting user sessions from LangSmith
      try {
        const res = await fetch("https://api.smith.langchain.com/api/v1/sessions?limit=1", {
          headers: {
            "x-api-key": testKey.trim()
          }
        });

        if (res.ok) {
          // Key is genuinely valid and authenticated!
          process.env.LANGCHAIN_API_KEY = testKey.trim();
          process.env.LANGCHAIN_TRACING_V2 = "true";

          // Try persisting to .env.local
          try {
            const fs = await import('fs');
            const path = await import('path');
            const envPath = path.join(process.cwd(), '.env.local');
            let content = '';
            if (fs.existsSync(envPath)) {
              content = fs.readFileSync(envPath, 'utf8');
              if (content.includes('LANGCHAIN_API_KEY=')) {
                content = content.replace(/LANGCHAIN_API_KEY=.*/g, `LANGCHAIN_API_KEY=${testKey.trim()}`);
              } else {
                content += `\nLANGCHAIN_API_KEY=${testKey.trim()}\n`;
              }
            } else {
              content = `LANGCHAIN_TRACING_V2=true\nLANGCHAIN_PROJECT=topic-intel\nLANGCHAIN_ENDPOINT=https://api.smith.langchain.com\nLANGCHAIN_API_KEY=${testKey.trim()}\n`;
            }
            fs.writeFileSync(envPath, content, 'utf8');
          } catch (fileErr) {
            console.warn("Could not write .env.local:", fileErr);
          }

          return NextResponse.json({
            success: true,
            message: "Successfully verified and connected to your LangSmith account!",
            configured: true,
            project: process.env.LANGCHAIN_PROJECT || 'topic-intel'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: `LangSmith rejected the key (Status ${res.status}). Please make sure you copied the entire key (starting with lsv2_pt_...).`,
            configured: false
          }, { status: 400 });
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          message: `Network error connecting to LangSmith: ${err.message}`,
          configured: false
        }, { status: 500 });
      }
    }

    // Action 2: Clear Trace Buffer
    if (action === 'clear') {
      clearTraces();
      return NextResponse.json({ success: true, message: "Trace history cleared." });
    }

    // Action 3: Simulate / Run Sample Traced Agent Flow
    if (action === 'simulate') {
      const sampleTopic = topic || "Machine Learning Fundamentals";
      const session = new TraceSession("supervisor_orchestration_run", { topic: sampleTopic }, ["simulation", "demo"], apiKey);

      // Span 1: Fact Finder
      const span1 = await session.startSpan("dr_data_fact_retrieval", "tool", { query: sampleTopic }, { id: 'researcher', name: 'Dr. Data' });
      await new Promise(r => setTimeout(r, 60));
      await span1.end({ facts_extracted: 3, benchmarks_found: true, status: 'verified' });

      // Span 2: Hook Synthesis
      const span2 = await session.startSpan("nova_hook_synthesis", "chain", { topic: sampleTopic }, { id: 'strategist', name: 'Nova' });
      await new Promise(r => setTimeout(r, 45));
      await span2.end({ hooks_count: 3, top_hook: `Stop doing ${sampleTopic} the hard way!` });

      // Span 3: Source Verification
      const span3 = await session.startSpan("veritas_source_validator", "tool", { topic: sampleTopic }, { id: 'validator', name: 'Veritas' });
      await new Promise(r => setTimeout(r, 40));
      await span3.end({ verified_sources: 2, credibility_score: '98%' });

      // Span 4: Script Assembly
      const span4 = await session.startSpan("cine_scriptwriter", "chain", { format: '45s_reel' }, { id: 'scriptwriter', name: 'Cine' });
      await new Promise(r => setTimeout(r, 50));
      await span4.end({ duration_sec: 45, sections: ['Hook', 'Mechanism', 'Call to Action'] });

      // End trace
      const trace = await session.end({
        topic: sampleTopic,
        status: 'success',
        total_subagents: 4,
        synthesis: "Comprehensive creator breakdown assembled successfully."
      });

      return NextResponse.json({
        success: true,
        trace,
        message: "Simulation trace created successfully."
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("LangSmith POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  AGENT_PROFILES,
  orchestrateMultiAgentResearch,
  chatWithAgent
} from '@/services/langchainAgents';

export async function GET() {
  return NextResponse.json({
    agents: Object.values(AGENT_PROFILES),
    framework: "LangChain Multi-Agent System",
    description: "4 specialized AI agents working together to research facts, synthesize angles, structure scripts, and validate sources for content creators."
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, topic, agentId, message, context, apiKey } = body;
    const effectiveKey = apiKey || request.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY || '';

    // Action 1: Full multi-agent orchestration
    if (action === 'orchestrate') {
      if (!topic || typeof topic !== 'string') {
        return NextResponse.json({ error: 'Topic is required for multi-agent orchestration' }, { status: 400 });
      }

      const multiAgentResult = await orchestrateMultiAgentResearch(topic, effectiveKey);
      return NextResponse.json(multiAgentResult);
    }

    // Action 2: Direct chat/interaction with a specific agent
    if (action === 'chat') {
      if (!agentId || !message) {
        return NextResponse.json({ error: 'agentId and message are required for agent chat' }, { status: 400 });
      }

      const response = await chatWithAgent(agentId, message, context, effectiveKey);
      const agent = AGENT_PROFILES[agentId];

      return NextResponse.json({
        agentId,
        agentName: agent?.name || 'Agent',
        role: agent?.role || 'Creator Assistant',
        response
      });
    }

    return NextResponse.json({ error: 'Invalid action. Supported actions: orchestrate, chat' }, { status: 400 });
  } catch (error: any) {
    console.error("Agents API error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error in agents system' }, { status: 500 });
  }
}

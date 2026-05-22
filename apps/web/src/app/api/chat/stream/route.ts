import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chatId, prompt, model, systemPrompt } = body;

    // Forward the request to the Python FastAPI Orchestrator
    // In local development, this is typically http://localhost:8001
    const AGENT_ENGINE_URL = process.env.AGENT_ENGINE_URL || 'http://localhost:8001/api/orchestrator/chat';

    const response = await fetch(AGENT_ENGINE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        prompt: prompt,
        model: model,
        system_prompt: systemPrompt
      }),
    });

    if (!response.ok) {
      throw new Error(`Agent Engine responded with ${response.status}`);
    }

    // Currently, the agent-engine returns a static JSON response.
    // We'll wrap it in a stream for the frontend to consume.
    const data = await response.json();
    const resultText = data.response || "No response received from AI engine.";
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream the result text in chunks to simulate a real streaming experience
        const chunks = resultText.split(' ');
        for (let i = 0; i < chunks.length; i++) {
          controller.enqueue(encoder.encode((i > 0 ? ' ' : '') + chunks[i]));
          await new Promise((r) => setTimeout(r, 20)); // Small delay for effect
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Streaming gateway error:', error);
    return new Response(JSON.stringify({ error: `Streaming gateway error: ${error.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

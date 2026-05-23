import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chatId, prompt, model, systemPrompt } = body;

    // Forward the request to the Java Spring Boot Backend
    // The Java backend handles security, RAG, and multi-model routing.
    const JAVA_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const STREAM_ENDPOINT = `${JAVA_BACKEND_URL}/aibh/chat/stream`;

    // 1. Orchestrate Chat via Java Backend (which handles its own memory/RAG)
    const response = await fetch(`${STREAM_ENDPOINT}?message=${encodeURIComponent(prompt)}&sessionId=${chatId}`, {
      method: 'GET',
      headers: {
        // In production, forward the user's JWT from the session
        // 'Authorization': req.headers.get('Authorization') || '',
      }
    });

    if (!response.ok) {
      throw new Error(`Java Backend responded with ${response.status}`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // SSE parsing: extract the "data:" part from the Java stream
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data:')) {
                const data = line.slice(5).trim();
                controller.enqueue(encoder.encode(data));
              }
            }
          }
        } finally {
          controller.close();
        }
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

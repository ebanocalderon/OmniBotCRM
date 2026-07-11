import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Default Ollama local endpoint
    // If the server is running inside Docker, host.docker.internal resolves to the host machine.
    // If running directly on the host (e.g. npm run dev), localhost works.
    const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
    
    // We connect to the native Ollama /api/chat endpoint
    const response = await fetch(`${ollamaHost}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: body.model || "qwen-0.8b", // default to qwen-0.8b as requested
        messages: body.messages || [],
        stream: true,
        options: {
          temperature: body.temperature ?? 0.7,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Ollama error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    // Return the readable stream directly to the client
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Ollama Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to local Ollama instance. Is it running on port 11434?" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are the TechNest assistant — a friendly, concise helper for TechNest, a Nigerian marketplace for buying, selling and swapping gadgets (phones and laptops).

You help users with things like:
- How to value or list a device for sale/swap
- How IMEI verification and battery health checks work
- How pricing and vendor bids work on the marketplace
- General navigation ("where do I go to sell my phone?", "how do swaps work?")
- Basic gadget buying advice

Keep answers short (2-4 sentences unless the user asks for detail), friendly, and specific to TechNest. If you don't know something about the user's actual account, listings, or order status, say so and suggest they check their dashboard or contact support via WhatsApp — don't make up account details.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI chat is not configured yet. Add ANTHROPIC_API_KEY to .env to enable it.",
      },
      { status: 503 }
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("empty");
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low" },
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const reply = response.content.find((b) => b.type === "text");
    return NextResponse.json({
      reply: reply && reply.type === "text" ? reply.text : "",
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "AI chat is misconfigured (invalid API key)." },
        { status: 503 }
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "The assistant is busy right now — try again in a moment." },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "The assistant hit an error. Try again." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}

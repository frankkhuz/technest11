import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import { gadgets, formatPrice } from "@/app/data/gadget";

const CATALOG_CONTEXT = JSON.stringify(
  gadgets.map((g) => ({
    id: g.id,
    name: g.name,
    brand: g.brand,
    category: g.gadgetCategory,
    spec: g.spec,
    priceUsed: formatPrice(g.priceUkUsed),
    priceNew: formatPrice(g.priceBrandNew),
    tags: g.tags ?? [],
  }))
);

const SYSTEM_PROMPT = `You are the TechNest Gadget Recommender — an expert gadget consultant for TechNest, a Nigerian gadget marketplace.

A user describes a need in plain language (e.g. "I want 4 cameras for my house", "I need a camera to cover a wedding"). Your job:

1. If the request is ambiguous or you're missing a detail that would change the recommendation (power availability, budget, indoor/outdoor, portability needs, how many people, experience level, etc.), ask ONE short, specific clarifying question before recommending anything. Don't interrogate — one good question at a time, and only if it would actually change your answer.
2. Once you have enough to recommend, give a final recommendation. Always consider two things:
   - catalogMatches: real items from TechNest's own catalog below that fit, referencing them by their exact "id". Only use ids that appear in the catalog JSON — never invent one.
   - generalSuggestions: genuinely expert advice even if TechNest doesn't currently stock it (e.g. a specific real product like "DJI Osmo Pocket 3" for a mobile wedding shoot, or "solar panel + power station" if the user has no stable electricity). The vendor can source items on request, so don't hold back good advice just because it's not in stock yet.
3. Explain WHY each suggestion fits their specific situation (budget, use case, power situation, portability) — don't just list products.

TechNest's current gadget catalog (JSON):
${CATALOG_CONTEXT}

Always respond by calling the provide_response tool — never plain text.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const RESPONSE_TOOL: Anthropic.Tool = {
  name: "provide_response",
  description:
    "Send a structured reply to the user: either a clarifying question or a final recommendation.",
  input_schema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["question", "recommendation"],
        description:
          "'question' if you need more info before recommending, 'recommendation' if this message contains your suggestions.",
      },
      message: {
        type: "string",
        description:
          "The natural-language reply shown to the user — the question itself, or the recommendation narrative explaining the reasoning.",
      },
      catalogMatches: {
        type: "array",
        description:
          "Real TechNest catalog items that fit, referencing an exact id from the provided catalog JSON. Omit or leave empty if type is 'question' or nothing fits.",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            reason: { type: "string" },
          },
          required: ["id", "reason"],
        },
      },
      generalSuggestions: {
        type: "array",
        description:
          "Expert advice on real products/categories not necessarily in TechNest's catalog. Omit or leave empty if type is 'question'.",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            reason: { type: "string" },
          },
          required: ["name", "reason"],
        },
      },
    },
    required: ["type", "message"],
  },
};

export type RecommenderReply = {
  type: "question" | "recommendation";
  message: string;
  catalogMatches?: { id: string; reason: string }[];
  generalSuggestions?: { name: string; reason: string }[];
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "The AI recommender is not configured yet. Add ANTHROPIC_API_KEY to .env to enable it.",
      },
      { status: 503 }
    );
  }

  let messages: ChatMessage[];
  let conversationId: string | undefined;
  try {
    const body = await req.json();
    messages = body.messages;
    conversationId =
      typeof body.conversationId === "string" ? body.conversationId : undefined;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("empty");
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  let reply: RecommenderReply;
  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      output_config: { effort: "medium" },
      tools: [RESPONSE_TOOL],
      tool_choice: { type: "tool", name: "provide_response" },
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json(
        { error: "The assistant returned an unexpected response. Try again." },
        { status: 502 }
      );
    }
    reply = toolUse.input as RecommenderReply;
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "The AI recommender is misconfigured (invalid API key)." },
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

  // Best-effort persistence — only for logged-in users, never blocks the reply.
  let savedConversationId: string | undefined = conversationId;
  try {
    const user = await getCurrentUser(req);
    if (user) {
      const mongo = await clientPromise;
      const db = mongo.db();
      const collection = db.collection("gadgetConversations");
      const fullMessages = [
        ...messages,
        { role: "assistant" as const, content: JSON.stringify(reply) },
      ];

      if (conversationId) {
        const { ObjectId } = await import("mongodb");
        await collection.updateOne(
          { _id: new ObjectId(conversationId), userId: user.id },
          { $set: { messages: fullMessages, updatedAt: new Date() } }
        );
      } else {
        const firstUserMessage =
          messages.find((m) => m.role === "user")?.content ?? "Gadget recommendation";
        const result = await collection.insertOne({
          userId: user.id,
          title: firstUserMessage.slice(0, 80),
          messages: fullMessages,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        savedConversationId = result.insertedId.toString();
      }
    }
  } catch {
    // Persistence is a bonus, not a requirement — the recommendation still works for guests
    // and keeps working even if MONGODB_URI is unset or the database is unreachable.
  }

  return NextResponse.json({ reply, conversationId: savedConversationId });
}

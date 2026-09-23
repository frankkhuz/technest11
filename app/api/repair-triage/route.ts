import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { repairServices } from "@/app/data/repairs";
import { gadgets, formatPrice } from "@/app/data/gadget";

const REPAIR_CONTEXT = JSON.stringify(
  repairServices.map((r) => ({
    id: r.id,
    issue: r.issue,
    appliesTo: r.appliesTo,
    priceRange: `${formatPrice(r.priceMin)} - ${formatPrice(r.priceMax)} (estimated)`,
    note: r.note,
  }))
);

// Only products genuinely relevant to a "my device broke" conversation —
// chargers/cables/power banks for charging issues, screen protectors etc.
// Keeps the AI from randomly upselling cameras mid-repair-triage.
const RELEVANT_CATEGORIES = new Set(["accessory", "power"]);
const PRODUCT_CONTEXT = JSON.stringify(
  gadgets
    .filter((g) => RELEVANT_CATEGORIES.has(g.gadgetCategory))
    .map((g) => ({
      id: g.id,
      name: g.name,
      spec: g.spec,
      price: formatPrice(g.priceUkUsed),
    }))
);

const WHATSAPP_NUMBER = "2348186450477";

const SYSTEM_PROMPT = `You are the TechNest Repair Assistant — you help someone whose gadget (phone, laptop, tablet, or gaming console) is broken or misbehaving.

Your job, in order:
1. Ask short, specific diagnostic questions ONE at a time — what device, what exactly happens, did it fall or get wet, has it been acting up gradually or suddenly, have they already tried a restart/force-restart. Don't interrogate — stop asking once you have enough to give a useful answer.
2. Once you understand the problem, respond with a diagnosis that may include:
   - Quick, safe DIY steps to try first (force restart, check the cable/port for lint, try a different charger, etc.) — only when genuinely worth trying before paying for a repair.
   - A real repair service from the price list below, if the issue sounds like it needs a technician — reference it by id and explain briefly why. These prices are ESTIMATES, always say so.
   - A real product from the accessories list below (charger, cable, power bank), if the issue is clearly about a bad charger/cable/power source rather than the device's own port being damaged.
   - Whether to suggest they contact TechNest's repair partner on WhatsApp for an exact quote and booking (suggestRepairerContact: true) — do this whenever you've recommended a paid repair, or the issue is beyond simple troubleshooting (water damage, won't turn on, physical damage).

Be concrete and reassuring, not alarmist. If quick fixes might solve it, always suggest trying those before assuming a paid repair is needed.

Repair price list (JSON, estimated Nigerian market ranges):
${REPAIR_CONTEXT}

Relevant accessories in stock (JSON):
${PRODUCT_CONTEXT}

Always respond by calling the provide_triage tool — never plain text.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const TRIAGE_TOOL: Anthropic.Tool = {
  name: "provide_triage",
  description: "Send a structured diagnostic reply to the user.",
  input_schema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["question", "diagnosis"],
        description: "'question' if you need more info, 'diagnosis' once you have an answer.",
      },
      message: {
        type: "string",
        description: "The natural-language reply — the question itself, or the diagnosis summary.",
      },
      quickFixSteps: {
        type: "array",
        items: { type: "string" },
        description: "Safe DIY steps to try first, in order. Omit if none apply.",
      },
      repairMatches: {
        type: "array",
        items: {
          type: "object",
          properties: { id: { type: "string" }, reason: { type: "string" } },
          required: ["id", "reason"],
        },
        description: "Repair services from the price list, referenced by exact id.",
      },
      productMatches: {
        type: "array",
        items: {
          type: "object",
          properties: { id: { type: "string" }, reason: { type: "string" } },
          required: ["id", "reason"],
        },
        description: "Accessories from the in-stock list, referenced by exact id.",
      },
      suggestRepairerContact: {
        type: "boolean",
        description: "True if the user should be pointed to TechNest's repair partner on WhatsApp.",
      },
    },
    required: ["type", "message"],
  },
};

export type TriageReply = {
  type: "question" | "diagnosis";
  message: string;
  quickFixSteps?: string[];
  repairMatches?: { id: string; reason: string }[];
  productMatches?: { id: string; reason: string }[];
  suggestRepairerContact?: boolean;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The repair assistant is not configured yet. Add ANTHROPIC_API_KEY to .env to enable it." },
      { status: 503 }
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("empty");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      output_config: { effort: "medium" },
      tools: [TRIAGE_TOOL],
      tool_choice: { type: "tool", name: "provide_triage" },
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json(
        { error: "The assistant returned an unexpected response. Try again." },
        { status: 502 }
      );
    }
    const reply = toolUse.input as TriageReply;
    return NextResponse.json({ reply, whatsapp: WHATSAPP_NUMBER });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "The repair assistant is misconfigured (invalid API key)." },
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
      return NextResponse.json({ error: "The assistant hit an error. Try again." }, { status: 502 });
    }
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

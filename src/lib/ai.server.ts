// Server-only Lovable AI Gateway helper.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
export const DEFAULT_MODEL = "google/gemini-3.7-flash";

export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "file"; file: { filename: string; file_data: string } };

export class AiGatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function stripFence(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  return trimmed;
}

export async function aiJson<T>(options: {
  system: string;
  content: string | ContentBlock[];
  model?: string;
}): Promise<T> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured (missing LOVABLE_API_KEY).");

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: options.model ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.content },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body;
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
      message = parsed.error?.message ?? parsed.message ?? body;
    } catch {
      /* keep raw body */
    }
    if (response.status === 429)
      throw new AiGatewayError(429, "AI analysis is rate limited right now. Please retry shortly.");
    if (response.status === 402)
      throw new AiGatewayError(402, message || "AI credits are exhausted for this workspace.");
    if (response.status === 403)
      throw new AiGatewayError(403, message || "AI access is blocked by workspace policy.");
    throw new AiGatewayError(response.status, message || "AI analysis failed.");
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = payload.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("The AI returned an empty response.");
  try {
    return JSON.parse(stripFence(text)) as T;
  } catch {
    throw new Error("The AI returned an unreadable response.");
  }
}

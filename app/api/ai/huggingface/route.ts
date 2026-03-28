import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocale, type Locale } from "@/lib/i18n/translations";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  locale: z.string().optional(),
});

function responseLanguage(locale: Locale) {
  switch (locale) {
    case "am":
      return "Amharic";
    case "om":
      return "Afaan Oromoo";
    case "en":
    default:
      return "English";
  }
}

function extractText(payload: unknown): string | null {
  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (typeof item === "string" && item.trim()) return item.trim();
      if (
        typeof item === "object" &&
        item !== null &&
        "generated_text" in item &&
        typeof item.generated_text === "string" &&
        item.generated_text.trim()
      ) {
        return item.generated_text.trim();
      }
    }
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "generated_text" in payload &&
    typeof payload.generated_text === "string"
  ) {
    return payload.generated_text.trim();
  }

  return null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const locale = isLocale(parsed.data.locale) ? parsed.data.locale : "en";
  const token = process.env.HUGGINGFACE_API_TOKEN?.trim();
  const model = process.env.HUGGINGFACE_MODEL?.trim() || "google/flan-t5-base";

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        code: "missing_config",
        error: "Missing HUGGINGFACE_API_TOKEN",
      },
      { status: 503 }
    );
  }

  const prompt = [
    "You are the Tamagn marketplace assistant.",
    `Respond in ${responseLanguage(locale)}.`,
    "Be concise, practical, and trustworthy.",
    "Focus on shopping, services, escrow, delivery, and marketplace guidance.",
    `User question: ${parsed.data.message}`,
  ].join("\n");

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 220,
        return_full_text: false,
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const errorMessage =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Hugging Face request failed";

    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
      },
      { status: response.status }
    );
  }

  const answer = extractText(payload);
  if (!answer) {
    return NextResponse.json(
      {
        ok: false,
        error: "No answer returned from Hugging Face",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, answer });
}

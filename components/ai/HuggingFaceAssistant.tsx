"use client";

import { useState, useTransition } from "react";
import { Bot, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n/translations";

type Props = {
  locale: Locale;
  labels: {
    kicker: string;
    title: string;
    body: string;
    placeholder: string;
    submit: string;
    loading: string;
    empty: string;
    poweredBy: string;
    missingConfig: string;
    genericError: string;
    suggestions: string[];
  };
};

type AssistantResponse = {
  ok?: boolean;
  answer?: string;
  error?: string;
  code?: string;
};

export function HuggingFaceAssistant({ locale, labels }: Props) {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="editorial-card relative overflow-hidden p-6 md:p-8">
      <div className="absolute -right-16 top-0 size-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start gap-3">
          <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-primary text-on-primary">
            <Bot className="size-5" />
          </span>
          <div>
            <p className="section-kicker">{labels.kicker}</p>
            <h2 className="text-2xl font-bold tracking-[-0.04em]">{labels.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-secondary">{labels.body}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {labels.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-semibold text-secondary transition hover:bg-surface-container-highest"
              onClick={() => setMessage(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setAnswer("");

            startTransition(async () => {
              try {
                const response = await fetch("/api/ai/huggingface", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    message,
                    locale,
                  }),
                });

                const data = (await response.json()) as AssistantResponse;
                if (!response.ok || !data.ok || !data.answer) {
                  setError(
                    data.code === "missing_config"
                      ? labels.missingConfig
                      : data.error || labels.genericError
                  );
                  return;
                }

                setAnswer(data.answer);
              } catch {
                setError(labels.genericError);
              }
            });
          }}
        >
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={labels.placeholder}
            className="tamagn-textarea"
            rows={4}
          />
          <button
            type="submit"
            disabled={pending || !message.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="size-4" />
            {pending ? labels.loading : labels.submit}
          </button>
        </form>

        <div className="mt-6 rounded-[1.5rem] bg-surface-container-low p-5">
          <p className="section-kicker">{labels.poweredBy}</p>
          {error ? (
            <p className="mt-3 text-sm leading-7 text-destructive">{error}</p>
          ) : answer ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
              {answer}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-7 text-secondary">{labels.empty}</p>
          )}
        </div>
      </div>
    </div>
  );
}

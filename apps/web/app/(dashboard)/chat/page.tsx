"use client";

import { FormEvent, useMemo, useState } from "react";

import { apiFetch } from "../../../lib/api";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function fallbackReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("python")) {
    return "Start with one full beginner Python course, then practice daily with mini-projects (calculator, to-do app, file organizer).";
  }
  if (q.includes("roadmap") || q.includes("plan")) {
    return "Use this roadmap: fundamentals -> loops/functions -> OOP -> projects -> interview questions. Build at least 1 project per week.";
  }
  if (q.includes("paid")) {
    return "For paid courses, pick one with projects and complete it fully before buying another. Consistency matters more than quantity.";
  }
  if (q.includes("time") || q.includes("schedule")) {
    return "Try 90 minutes daily: 45 min video learning + 30 min coding + 15 min revision/notes.";
  }
  return "Good question. Focus on clear goals, daily practice, and project-based learning. If you want, I can give you a week-by-week plan.";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I am your LMS AI Assistant. Ask about courses, roadmap, and study planning."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !isTyping, [input, isTyping]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsTyping(true);

    try {
      const res = await apiFetch("/api/ai/chat", {
        method: "POST",
        auth: false,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(err?.message ?? "AI request failed");
      }

      const data = (await res.json()) as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const shouldUseFallback =
        /not found|api is not configured|cannot reach api|failed to fetch/i.test(message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: shouldUseFallback
            ? fallbackReply(text)
            : err instanceof Error
              ? `I couldn't generate a response right now. ${err.message}`
              : "I couldn't generate a response right now."
        }
      ]);
    }
    setIsTyping(false);
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 pt-6">
      <h1 className="text-xl font-bold text-white">Chat with AI</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Ask questions about courses, learning paths, and study planning.
      </p>

      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900/80 p-4">
        <div className="h-[52vh] space-y-3 overflow-y-auto rounded-md border border-neutral-700 bg-neutral-950 p-3">
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-brand text-neutral-900"
                  : "mr-auto bg-neutral-800 text-neutral-100"
              }`}
            >
              {m.content}
            </div>
          ))}
          {isTyping ? (
            <div className="mr-auto max-w-[85%] rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-300">
              AI is typing...
            </div>
          ) : null}
        </div>

        <form onSubmit={onSend} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your question..."
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}


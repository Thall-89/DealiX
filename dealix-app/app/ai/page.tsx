'use client';

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { aiMessages } from "@/lib/mockData";

const prompts = [
  "What should I work on today?",
  "Which build has the best projected return?",
  "What information is missing?",
  "Show my confirmed profit",
  "Help me evaluate a deal",
];

const responseMap: Record<string, string> = {
  "What should I work on today?": "Focus on Blue Titan pricing and the missing motherboard for Legacy Powerhouse.",
  "Which build has the best projected return?": "Blue Titan has the strongest projected range right now, but the estimate is still a projection.",
  "What information is missing?": "Final sale data for Legacy Powerhouse and the RTX 3070 location still need confirmation.",
  "Show my confirmed profit": "Your confirmed profit is $244.50 from the completed sale.",
  "Help me evaluate a deal": "Use the mock deal cards to compare price, fees, shipping, and risk before you buy.",
};

export default function AiPage() {
  const [messages, setMessages] = useState(aiMessages);
  const [input, setInput] = useState("");

  const handlePrompt = (prompt: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}`, role: "user", content: prompt }, { id: `${Date.now()}-a`, role: "assistant", content: responseMap[prompt] ?? "Demo response ready." }]);
  };

  const assistantName = useMemo(() => "DealiX Assistant (Demo Mode)", []);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Demo Mode" title="AI Assistant" description="This assistant is a mock conversation experience for now. It does not call a real AI API yet." />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <div className="text-xl font-semibold text-white">Suggested prompts</div>
          <div className="mt-4 space-y-2">
            {prompts.map((prompt) => (
              <button key={prompt} onClick={() => handlePrompt(prompt)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-sky-400/30 hover:bg-sky-500/10">
                <span>{prompt}</span>
                <span className="text-sky-300">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-purple-400/20 bg-purple-500/10 p-6 shadow-[0_20px_60px_rgba(147,51,234,0.16)] backdrop-blur-xl">
          <div className="text-xl font-semibold text-white">{assistantName}</div>
          <div className="mt-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`rounded-2xl border px-4 py-3 text-sm leading-7 ${message.role === "assistant" ? "border-white/10 bg-slate-950/40 text-zinc-300" : "border-sky-400/20 bg-sky-500/10 text-zinc-100"}`}>
                {message.content}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask the assistant" className="flex-1 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" />
            <button onClick={() => input.trim() && handlePrompt(input.trim())} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

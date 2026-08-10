"use client";

import { useState, useTransition } from "react";
import { inspectConversation } from "@/app/actions/admin";
import { RibbonLoader } from "@/components/ReconlyMark";

interface ConvSummary {
  id: string;
  title: string;
  owner: string;
  updated: string;
}

export default function ConversationInspector({ conversations }: { conversations: ConvSummary[] }) {
  const [opened, setOpened] = useState<{
    id: string;
    title: string;
    messages: { role: string; content: string; created_at: string }[];
  } | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="glass light-seam rounded-xl p-5">
      <p className="text-sm font-medium text-white">Conversation inspector</p>
      <p className="mt-1 text-[11px] leading-relaxed text-[#6B7280]">
        Read-only, for support and debugging. Every access requires a reason and is written to the
        audit log.
      </p>

      <ul className="mt-4 divide-y divide-white/6">
        {conversations.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-xs text-[#D1D5DB]">{c.title}</p>
              <p className="font-mono text-[10px] text-[#6B7280]">
                {c.owner.slice(0, 22)} · {c.updated}
              </p>
            </div>
            <button
              className="btn-ghost shrink-0 border !border-white/15 !px-4 !py-1.5 text-xs"
              onClick={() => {
                const reason = prompt("Reason for inspecting this conversation (required, audit-logged):");
                if (!reason?.trim()) return;
                setError(null);
                start(async () => {
                  try {
                    const res = await inspectConversation(c.id, reason);
                    setOpened({ id: c.id, title: res.title, messages: res.messages as never });
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Failed");
                  }
                });
              }}
            >
              {pending ? <RibbonLoader size={14} /> : "Inspect"}
            </button>
          </li>
        ))}
        {conversations.length === 0 && <p className="py-4 text-xs text-[#6B7280]">No conversations yet.</p>}
      </ul>
      {error && <p className="mt-2 text-xs text-red-300/80">{error}</p>}

      {opened && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="glass-strong flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-white">{opened.title}</p>
              <button onClick={() => setOpened(null)} className="text-[#9CA3AF] hover:text-white" aria-label="Close">
                ×
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {opened.messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-8 rounded-xl border border-white/14 bg-white/8 px-3.5 py-2 text-xs text-white"
                      : "border-l border-white/12 pl-3 text-xs leading-relaxed text-[#D1D5DB] whitespace-pre-wrap"
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] text-[#6B7280]">Read-only view · access was audit-logged</p>
          </div>
        </div>
      )}
    </div>
  );
}

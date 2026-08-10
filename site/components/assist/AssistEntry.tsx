"use client";

import { useAssist, type AssistContextChip } from "./AssistProvider";

/** Inline "Ask Assist" ghost button with the thin ribbon glyph. */
export function AskAssistButton({
  prompt,
  context,
  children,
}: {
  prompt: string;
  context: AssistContextChip;
  children: React.ReactNode;
}) {
  const { open, enabled } = useAssist();
  if (!enabled) return null;
  return (
    <button
      type="button"
      onClick={() => open({ chip: context, prompt })}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3.5 py-1.5 text-[11px] text-[#9CA3AF] transition-all duration-200 hover:border-white/30 hover:text-white"
    >
      <svg viewBox="0 0 120 120" className="h-3 w-3" fill="none" aria-hidden="true">
        <path
          d="M30 22 C30 22 30 68 30 78 C30 96 44 106 58 100 C66 96 70 90 74 82 L92 44 C96 36 92 28 84 28 C78 28 74 32 71 38 L58 66 C55 72 50 74 46 71 C43 69 42 65 42 60 L42 22"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
      {children}
    </button>
  );
}

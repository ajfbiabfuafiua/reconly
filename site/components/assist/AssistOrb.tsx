"use client";

import ReconlyMark from "@/components/ReconlyMark";
import { useAssist } from "./AssistProvider";

export default function AssistOrb() {
  const { isOpen, open } = useAssist();
  if (isOpen) return null;
  return (
    <button
      onClick={() => open()}
      aria-label="Open Reconly Assist (⌘K)"
      title="Reconly Assist (⌘K)"
      className="glass-strong fixed bottom-20 right-5 z-[60] flex h-13 w-13 items-center justify-center rounded-full p-3 shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-200 hover:shadow-[0_0_36px_rgba(255,255,255,0.3)] md:bottom-6 md:right-6"
      style={{ width: 52, height: 52 }}
    >
      <ReconlyMark size={26} />
    </button>
  );
}

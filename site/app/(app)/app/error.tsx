"use client";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="glass max-w-sm rounded-xl p-7 text-center">
        <p className="text-sm font-medium text-white">Something went wrong</p>
        <p className="mt-2 text-xs leading-relaxed text-[#6B7280]">
          We couldn&apos;t load this view. Your data is safe — try again.
        </p>
        <button onClick={reset} className="btn-ghost mt-5 border !border-white/15 !py-2 text-sm">
          Retry
        </button>
      </div>
    </div>
  );
}

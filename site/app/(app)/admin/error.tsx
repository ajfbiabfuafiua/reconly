"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="glass max-w-sm rounded-xl p-7 text-center">
        <p className="text-sm font-medium text-white">Something went wrong</p>
        <button onClick={reset} className="btn-ghost mt-5 border !border-white/15 !py-2 text-sm">
          Retry
        </button>
      </div>
    </div>
  );
}

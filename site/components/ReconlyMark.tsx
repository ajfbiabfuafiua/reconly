/**
 * The Reconly brand mark: a folded glass ribbon "R" abstraction with luminous
 * edge seams. `animate` plays the draw-in sequence once; `loader` loops the
 * edge stroke — used as THE spinner across the entire product.
 */
export default function ReconlyMark({
  size = 28,
  animate = false,
  loader = false,
  className = "",
}: {
  size?: number;
  animate?: boolean;
  loader?: boolean;
  className?: string;
}) {
  const id = loader ? "rml" : animate ? "rma" : "rms";
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`reconly-mark ${animate ? "animate" : ""} ${loader ? "loader" : ""} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`glassFill-${id}`} x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id={`edgeLight-${id}`} x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`seamSweep-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={`softGlow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {!loader && (
        <path
          className="ribbon-fill"
          d="M30 22 C30 22 30 68 30 78 C30 96 44 106 58 100 C66 96 70 90 74 82 L92 44 C96 36 92 28 84 28 C78 28 74 32 71 38 L58 66 C55 72 50 74 46 71 C43 69 42 65 42 60 L42 22 Z"
          fill={`url(#glassFill-${id})`}
        />
      )}

      {!loader && (
        <path
          className="ribbon-fold"
          d="M58 66 C55 72 50 74 46 71 C48 76 54 78 59 75 C63 72 65 68 66 64 Z"
          fill="#000000"
          opacity="0.35"
        />
      )}

      <path
        className="ribbon-edge"
        d="M30 22 C30 22 30 68 30 78 C30 96 44 106 58 100 C66 96 70 90 74 82 L92 44 C96 36 92 28 84 28 C78 28 74 32 71 38 L58 66 C55 72 50 74 46 71 C43 69 42 65 42 60 L42 22"
        stroke={`url(#edgeLight-${id})`}
        strokeWidth={loader ? 6 : 1.5}
        strokeLinecap="round"
        fill="none"
        filter={loader ? undefined : `url(#softGlow-${id})`}
        pathLength={1}
      />

      {animate && (
        <rect
          className="ribbon-seam"
          x="38"
          y="58"
          width="34"
          height="20"
          fill={`url(#seamSweep-${id})`}
          opacity="0"
          transform="rotate(-24 55 68)"
        />
      )}
    </svg>
  );
}

/** Small looping inline spinner — use everywhere instead of generic spinners. */
export function RibbonLoader({ size = 20, className = "" }: { size?: number; className?: string }) {
  return <ReconlyMark size={size} loader className={className} />;
}

/**
 * Flat-style hero illustration inspired by LMS login concepts (person + laptop + lock).
 */
export function LoginHeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 320"
      className="h-auto w-full max-w-md"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Laptop */}
      <rect x="60" y="140" width="220" height="130" rx="8" fill="#374151" />
      <rect x="70" y="150" width="200" height="100" rx="4" fill="#E5E7EB" />
      <path d="M40 270 H360 L340 290 H60 Z" fill="#1F2937" />
      {/* Person */}
      <circle cx="280" cy="95" r="28" fill="#FBBF24" />
      <path
        d="M255 125 Q250 180 245 230 L285 235 Q290 180 295 125 Z"
        fill="#F59E0B"
      />
      <rect x="230" y="125" width="90" height="18" rx="6" fill="#FBBF24" />
      {/* Lock badge */}
      <circle cx="130" cy="100" r="36" fill="#FFC107" />
      <rect x="118" y="95" width="24" height="22" rx="3" fill="white" />
      <path
        d="M122 95 V88 Q122 76 130 76 Q138 76 138 88 V95"
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

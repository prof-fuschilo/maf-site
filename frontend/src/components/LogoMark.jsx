export function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0D1117" stroke="rgba(16,185,129,0.35)" />
      <path d="M10 46 L22 34 L30 40 L44 20" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="46" r="4" fill="#10B981" />
      <circle cx="22" cy="34" r="4" fill="#34D399" />
      <circle cx="30" cy="40" r="4" fill="#0284C7" />
      <circle cx="44" cy="20" r="4.5" fill="#10B981" />
      <circle cx="44" cy="20" r="9" stroke="#10B981" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M44 20 L54 12" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
      <circle cx="54" cy="12" r="2.5" fill="#34D399" />
    </svg>
  );
}

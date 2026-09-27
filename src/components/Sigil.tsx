export function Sigil({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="43" stroke="currentColor" strokeOpacity=".28" strokeWidth="1.2" strokeDasharray="2 6" />
      <path d="M50 13L87 78H13L50 13Z" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="50" cy="46" rx="15" ry="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="46" r="4" fill="currentColor" />
      <path d="M35 69H65" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

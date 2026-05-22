export default function VibeChip({ label }: { label: string }) {
  return (
    <span className="inline-block px-2 py-0.5 text-xs text-muted border border-border rounded-full">
      {label}
    </span>
  )
}

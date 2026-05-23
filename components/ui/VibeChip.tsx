export default function VibeChip({ label }: { label: string }) {
  return (
    <span className="inline-block px-[7px] py-[2px] text-[9px] tracking-[0.14em] uppercase font-sans text-muted border border-border">
      {label}
    </span>
  )
}

export default function PriceDots({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <span className="text-accent text-sm font-medium">
      {'฿'.repeat(value)}
      <span className="text-border">{'฿'.repeat(4 - value)}</span>
    </span>
  )
}

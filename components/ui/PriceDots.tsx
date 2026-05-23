export default function PriceDots({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <span className="flex gap-[3px] items-center">
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-[5px] h-[5px] rounded-full ${
            i < value ? 'bg-foreground' : 'bg-border'
          }`}
        />
      ))}
    </span>
  )
}

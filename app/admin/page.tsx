import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createServiceClient()
  const { data: spots } = await supabase
    .from('spots')
    .select('id,name,category,area,status,rating,source,created_at')
    .order('created_at', { ascending: false })

  const all = spots ?? []
  const counts = {
    total: all.length,
    active: all.filter((s) => s.status === 'active').length,
    unvisited: all.filter((s) => s.status === 'unvisited').length,
    date: all.filter((s) => s.category === 'date').length,
    nightlife: all.filter((s) => s.category === 'nightlife').length,
    day: all.filter((s) => s.category === 'day').length,
    meet: all.filter((s) => s.category === 'meet').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/spots" className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 transition-colors">
            + Add Spot
          </Link>
          <Link href="/admin/import" className="px-4 py-2 border border-border text-sm rounded-lg hover:border-accent transition-colors">
            Import
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: counts.total },
          { label: 'Active', value: counts.active },
          { label: 'Unvisited', value: counts.unvisited },
          { label: 'Date', value: counts.date },
          { label: 'Nightlife', value: counts.nightlife },
          { label: 'Day', value: counts.day },
          { label: 'Meet', value: counts.meet },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent spots */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Spots</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-6 py-3 text-muted font-medium">Name</th>
              <th className="px-6 py-3 text-muted font-medium">Category</th>
              <th className="px-6 py-3 text-muted font-medium">Area</th>
              <th className="px-6 py-3 text-muted font-medium">Status</th>
              <th className="px-6 py-3 text-muted font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {all.slice(0, 20).map((spot) => (
              <tr key={spot.id} className="border-b border-border/50 hover:bg-background/50">
                <td className="px-6 py-3 text-foreground font-medium">{spot.name}</td>
                <td className="px-6 py-3 text-muted">{spot.category}</td>
                <td className="px-6 py-3 text-muted">{spot.area ?? '—'}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    spot.status === 'active' ? 'bg-green-100 text-green-700' :
                    spot.status === 'closed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {spot.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-muted">{spot.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

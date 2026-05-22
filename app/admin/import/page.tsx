'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { importFromMapsUrl, saveImportedSpot, importFromChatLog, saveChatImportedSpots } from '@/actions/import'
import type { ParsedMapsSpot, ExtractedChatSpot, SpotCategory } from '@/types/spot'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors">
      {pending ? 'Processing...' : label}
    </button>
  )
}

const inputCls = 'w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent transition-colors'
const labelCls = 'block text-sm font-medium text-foreground mb-1'

function MapsImportSection() {
  const [parseState, parseAction] = useActionState(importFromMapsUrl, null)
  const [saveState, saveAction] = useActionState(saveImportedSpot, null)
  const result = parseState?.result

  if (saveState === null && result) {
    return <p className="text-green-600 text-sm mt-4">Spot saved!</p>
  }

  return (
    <div className="space-y-6">
      <form action={parseAction} className="space-y-3">
        <label className={labelCls}>Google Maps URL</label>
        <input name="maps_url" type="url" required placeholder="https://www.google.com/maps/place/..." className={inputCls} />
        {parseState?.error && <p className="text-red-500 text-sm">{parseState.error}</p>}
        <SubmitButton label="Parse" />
      </form>

      {result && (
        <form action={saveAction} className="space-y-3 border-t border-border pt-6">
          <p className="text-sm font-medium text-foreground mb-4">Review and confirm:</p>
          <input type="hidden" name="source" value="maps_import" />
          <input type="hidden" name="google_maps_url" value={result.google_maps_url} />

          <div><label className={labelCls}>Name</label>
            <input name="name" defaultValue={result.name} required className={inputCls} /></div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Category</label>
              <select name="category" defaultValue={result.category} className={inputCls}>
                {(['date', 'nightlife', 'day', 'meet'] as SpotCategory[]).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div><label className={labelCls}>Subcategory</label>
              <input name="subcategory" defaultValue={result.subcategory ?? ''} className={inputCls} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Area</label>
              <input name="area" defaultValue={result.area ?? ''} className={inputCls} /></div>
            <div><label className={labelCls}>Price (1-4)</label>
              <input name="price_range" type="number" min="1" max="4" defaultValue={result.price_range ?? ''} className={inputCls} /></div>
          </div>

          <div><label className={labelCls}>Description</label>
            <textarea name="description" rows={2} defaultValue={result.description} className={inputCls} /></div>

          <div><label className={labelCls}>Vibe (comma-separated)</label>
            <input name="vibe" defaultValue={result.vibe.join(', ')} className={inputCls} /></div>

          {saveState?.error && <p className="text-red-500 text-sm">{saveState.error}</p>}
          <SubmitButton label="Save Spot" />
        </form>
      )}
    </div>
  )
}

function ChatImportSection() {
  const [parseState, parseAction] = useActionState(importFromChatLog, null)
  const [saveState, saveAction] = useActionState(saveChatImportedSpots, null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const results = parseState?.results ?? []

  if (saveState === null && results.length > 0) {
    return <p className="text-green-600 text-sm mt-4">Spots saved!</p>
  }

  function toggleAll() {
    if (selected.size === results.length) setSelected(new Set())
    else setSelected(new Set(results.map((_, i) => i)))
  }

  const selectedSpots = results.filter((_, i) => selected.has(i))

  return (
    <div className="space-y-6">
      <form action={parseAction} className="space-y-3">
        <label className={labelCls}>Paste conversation text</label>
        <textarea name="chat_text" required rows={8} placeholder="Paste your WhatsApp, Line, or iMessage conversation here..." className={inputCls} />
        {parseState?.error && <p className="text-red-500 text-sm">{parseState.error}</p>}
        <SubmitButton label="Extract Spots" />
      </form>

      {results.length > 0 && (
        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{results.length} spots found</p>
            <button onClick={toggleAll} type="button" className="text-xs text-accent hover:underline">
              {selected.size === results.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          {results.map((spot, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.has(i)}
                onChange={() => {
                  const next = new Set(selected)
                  next.has(i) ? next.delete(i) : next.add(i)
                  setSelected(next)
                }}
                className="mt-1"
              />
              <div className="bg-surface border border-border rounded-xl p-3 flex-1 group-hover:border-accent transition-colors">
                <p className="font-medium text-foreground text-sm">{spot.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {spot.category} · {spot.area ?? 'area unknown'}
                </p>
                {spot.why && <p className="text-xs text-muted mt-1 italic">"{spot.why}"</p>}
              </div>
            </label>
          ))}

          {selectedSpots.length > 0 && (
            <form action={saveAction}>
              <input type="hidden" name="spots" value={JSON.stringify(selectedSpots)} />
              {saveState?.error && <p className="text-red-500 text-sm mb-2">{saveState.error}</p>}
              <SubmitButton label={`Save ${selectedSpots.length} spot${selectedSpots.length > 1 ? 's' : ''}`} />
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default function ImportPage() {
  const [mode, setMode] = useState<'maps' | 'chat'>('maps')

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-8">Import Spots</h1>

      <div className="flex gap-2 mb-8">
        {(['maps', 'chat'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              mode === m ? 'bg-accent text-white border-accent' : 'border-border text-muted hover:border-accent'
            }`}>
            {m === 'maps' ? 'Google Maps URL' : 'Chat Log'}
          </button>
        ))}
      </div>

      {mode === 'maps' ? <MapsImportSection /> : <ChatImportSection />}
    </div>
  )
}

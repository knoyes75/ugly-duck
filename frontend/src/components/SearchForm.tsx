import { Shuffle, Search, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
  onScan: (businessType: string, city: string, limit: number) => void
  onStop: () => void
  scanning: boolean
}

export default function SearchForm({ onScan, onStop, scanning }: Props) {
  const [businessType, setBusinessType] = useState('')
  const [city, setCity] = useState('')
  const [limit, setLimit] = useState(15)

  const randomize = async () => {
    const res = await fetch('/api/randomize')
    const data = await res.json()
    setBusinessType(data.business_type)
    setCity(data.city)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (businessType && city) onScan(businessType, city, limit)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-duck-card border border-duck-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🦆</span>
        <div>
          <h1 className="text-xl font-bold text-white">Ugly Duck</h1>
          <p className="text-xs text-slate-400">Find ugly websites. Build your prospect list.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Business Type</label>
          <input
            value={businessType}
            onChange={e => setBusinessType(e.target.value)}
            placeholder="e.g. plumber"
            className="w-full bg-duck-dark border border-duck-border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-duck-yellow"
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">City</label>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Tampa FL"
            className="w-full bg-duck-dark border border-duck-border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-duck-yellow"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-400 whitespace-nowrap">Results limit:</label>
        <input
          type="range" min={5} max={20} step={5}
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          className="flex-1 accent-duck-yellow"
        />
        <span className="text-xs text-duck-yellow font-mono w-4">{limit}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={randomize}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-duck-border text-sm text-slate-300 hover:border-duck-yellow hover:text-duck-yellow transition-colors"
        >
          <Shuffle size={14} /> Randomize
        </button>

        {scanning ? (
          <button
            type="button"
            onClick={onStop}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
          >
            <Loader2 size={14} className="animate-spin" /> Stop Scan
          </button>
        ) : (
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-duck-yellow text-duck-dark font-semibold text-sm hover:brightness-110 transition-all"
          >
            <Search size={14} /> Find Ugly Websites
          </button>
        )}
      </div>
    </form>
  )
}

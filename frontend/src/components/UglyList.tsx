import { Download, Trash2, X } from 'lucide-react'
import { Business } from '../types'

interface Props {
  businesses: Business[]
  onRemove: (placeId: string) => void
  onClear: () => void
}

function ScoreBar({ score }: { score: number }) {
  const w = `${(score / 10) * 100}%`
  const color = score >= 8 ? 'bg-red-500' : score >= 6 ? 'bg-orange-500' : score >= 4 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="w-full h-1 bg-duck-dark rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: w }} />
    </div>
  )
}

export default function UglyList({ businesses, onRemove, onClear }: Props) {
  const exportCSV = async () => {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(businesses),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ugly-duck-prospects.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-duck-card border border-duck-border rounded-2xl flex flex-col h-full">
      <div className="p-4 border-b border-duck-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white text-sm">Ugly List</h2>
          <p className="text-xs text-slate-500">{businesses.length} prospects</p>
        </div>
        <div className="flex gap-2">
          {businesses.length > 0 && (
            <>
              <button onClick={onClear} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                <Trash2 size={14} />
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-duck-yellow text-duck-dark text-xs font-semibold hover:brightness-110 transition-all"
              >
                <Download size={12} /> Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-600">
            <span className="text-4xl mb-3">🦆</span>
            <p className="text-sm">Your ugly list is empty.</p>
            <p className="text-xs mt-1">Add businesses from the results.</p>
          </div>
        ) : (
          businesses.map(b => (
            <div key={b.place_id} className="bg-duck-dark border border-duck-border rounded-lg p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white leading-tight">{b.name}</p>
                <button onClick={() => onRemove(b.place_id)} className="text-slate-600 hover:text-red-400 flex-shrink-0 mt-0.5">
                  <X size={12} />
                </button>
              </div>
              {b.critique && <ScoreBar score={b.critique.ugly_score} />}
              <p className="text-xs text-slate-500">{b.address}</p>
              {b.phone && <p className="text-xs text-slate-400">{b.phone}</p>}
              {b.website && (
                <a href={b.website} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-duck-yellow hover:underline truncate block">
                  {b.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {b.critique?.summary && (
                <p className="text-xs text-slate-500 italic">"{b.critique.summary}"</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

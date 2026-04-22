import { Plus, Check, ExternalLink, Star } from 'lucide-react'
import { Business } from '../types'

interface Props {
  business: Business
  inList: boolean
  onAdd: (b: Business) => void
}

function ScoreBadge({ score }: { score: number }) {
  if (score === 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">No site</span>
  const color =
    score >= 8 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    score >= 6 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
    score >= 4 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                 'bg-green-500/20 text-green-400 border-green-500/30'
  const label = score >= 8 ? 'Very Ugly' : score >= 6 ? 'Ugly' : score >= 4 ? 'Mediocre' : 'Decent'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${color}`}>
      {score}/10 · {label}
    </span>
  )
}

export default function BusinessCard({ business, inList, onAdd }: Props) {
  const { name, address, phone, website, rating, reviews, screenshot, critique } = business

  return (
    <div className="bg-duck-card border border-duck-border rounded-xl overflow-hidden flex flex-col hover:border-slate-600 transition-colors">
      {/* Screenshot */}
      <div className="relative h-40 bg-duck-dark flex items-center justify-center overflow-hidden">
        {screenshot ? (
          <img src={screenshot} alt={name} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <span className="text-3xl">🚫</span>
            <span className="text-xs">No website</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <ScoreBadge score={critique?.ugly_score ?? 0} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-tight">{name}</h3>
            {rating > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                {rating} ({reviews})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{address}</p>
          {phone && <p className="text-xs text-slate-400 mt-0.5">{phone}</p>}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-duck-yellow hover:underline mt-0.5 truncate">
              <ExternalLink size={10} />
              {website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        {critique && (
          <div className="space-y-2">
            <p className="text-xs text-slate-300 italic">"{critique.summary}"</p>
            {critique.issues?.length > 0 && (
              <ul className="space-y-1">
                {critique.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                    <span className="text-red-400 mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            )}
            {critique.recommendation && (
              <p className="text-xs text-duck-yellow">💡 {critique.recommendation}</p>
            )}
          </div>
        )}

        <button
          onClick={() => onAdd(business)}
          disabled={inList}
          className={`mt-auto flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            inList
              ? 'bg-green-500/10 border border-green-500/30 text-green-400 cursor-default'
              : 'bg-duck-yellow/10 border border-duck-yellow/30 text-duck-yellow hover:bg-duck-yellow/20'
          }`}
        >
          {inList ? <><Check size={12} /> Added to List</> : <><Plus size={12} /> Add to Ugly List</>}
        </button>
      </div>
    </div>
  )
}

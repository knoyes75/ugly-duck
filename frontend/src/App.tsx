import { useState, useRef } from 'react'
import SearchForm from './components/SearchForm'
import BusinessCard from './components/BusinessCard'
import UglyList from './components/UglyList'
import { Business, Progress, ScanStatus } from './types'

export default function App() {
  const [results, setResults]     = useState<Business[]>([])
  const [uglyList, setUglyList]   = useState<Business[]>([])
  const [status, setStatus]       = useState<ScanStatus>('idle')
  const [progress, setProgress]   = useState<Progress>({ message: '', current: 0, total: 0 })
  const [error, setError]         = useState<string | null>(null)
  const readerRef                 = useRef<ReadableStreamDefaultReader | null>(null)

  const inList = (b: Business) => uglyList.some(x => x.place_id === b.place_id)

  const addToList = (b: Business) => {
    if (!inList(b)) setUglyList(prev => [b, ...prev])
  }

  const removeFromList = (placeId: string) => {
    setUglyList(prev => prev.filter(b => b.place_id !== placeId))
  }

  const stopScan = () => {
    readerRef.current?.cancel()
    setStatus('done')
  }

  const startScan = async (businessType: string, city: string, limit: number) => {
    setResults([])
    setError(null)
    setStatus('scanning')
    setProgress({ message: 'Starting…', current: 0, total: 0 })

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_type: businessType, city, limit }),
      })

      const reader = res.body!.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'progress') {
              setProgress({ message: event.message, current: event.current, total: event.total })
            } else if (event.type === 'result') {
              setResults(prev => [...prev, event.business])
            } else if (event.type === 'done') {
              setStatus('done')
            } else if (event.type === 'error') {
              setError(event.message)
              setStatus('error')
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setError(e?.message ?? 'Unknown error')
        setStatus('error')
      }
    } finally {
      if (status !== 'error') setStatus('done')
    }
  }

  const sortedResults = [...results].sort((a, b) => (b.critique?.ugly_score ?? 0) - (a.critique?.ugly_score ?? 0))

  return (
    <div className="min-h-screen bg-duck-dark text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-5 h-screen">

        {/* Left panel */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          <SearchForm onScan={startScan} onStop={stopScan} scanning={status === 'scanning'} />

          {/* Progress */}
          {status === 'scanning' && (
            <div className="bg-duck-card border border-duck-border rounded-xl p-4 space-y-2">
              <p className="text-xs text-slate-400 truncate">{progress.message}</p>
              {progress.total > 0 && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-duck-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-duck-yellow rounded-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 text-right">{progress.current}/{progress.total}</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Stats */}
          {results.length > 0 && (
            <div className="bg-duck-card border border-duck-border rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-white">{results.length}</p>
                <p className="text-xs text-slate-500">Scanned</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">
                  {results.filter(b => (b.critique?.ugly_score ?? 0) >= 7).length}
                </p>
                <p className="text-xs text-slate-500">Ugly</p>
              </div>
              <div>
                <p className="text-lg font-bold text-duck-yellow">{uglyList.length}</p>
                <p className="text-xs text-slate-500">In List</p>
              </div>
            </div>
          )}

          {/* Ugly List */}
          <div className="flex-1 min-h-0">
            <UglyList businesses={uglyList} onRemove={removeFromList} onClear={() => setUglyList([])} />
          </div>
        </div>

        {/* Results grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {results.length === 0 && status === 'idle' && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 gap-4">
              <span className="text-7xl">🦆</span>
              <p className="text-lg font-semibold text-slate-400">Ready to find ugly websites</p>
              <p className="text-sm max-w-sm">
                Enter a business type and city, or hit Randomize to discover untapped markets.
              </p>
            </div>
          )}

          {sortedResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
              {sortedResults.map(b => (
                <BusinessCard
                  key={b.place_id}
                  business={b}
                  inList={inList(b)}
                  onAdd={addToList}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

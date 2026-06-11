import { useState } from 'react'
import type { Match } from '../types'

type Props = {
  match: Match
  onResult: (matchId: string, scoreA: number, scoreB: number) => void
  compact?: boolean
}

export default function MatchCard({ match, onResult, compact = false }: Props) {
  const [editing, setEditing] = useState(false)
  const [sA, setSA] = useState(match.result?.scoreA?.toString() ?? '')
  const [sB, setSB] = useState(match.result?.scoreB?.toString() ?? '')

  function save() {
    const a = parseInt(sA)
    const b = parseInt(sB)
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) return
    onResult(match.id, a, b)
    setEditing(false)
  }

  function startEdit() {
    setSA(match.result?.scoreA?.toString() ?? '')
    setSB(match.result?.scoreB?.toString() ?? '')
    setEditing(true)
  }

  const played = match.result !== null
  const isBye = (!match.teamA || !match.teamB)

  if (isBye) {
    const team = match.teamA ?? match.teamB
    return (
      <div className={`bg-slate-700/50 rounded-xl p-3 flex items-center gap-2 ${compact ? 'text-sm' : ''}`}>
        <span className="text-slate-400 text-xs">Freilos:</span>
        <span className="text-green-400 font-medium">{team?.name ?? '—'}</span>
      </div>
    )
  }

  return (
    <div
      className={`bg-slate-700 rounded-xl ${compact ? 'p-2' : 'p-4'} cursor-pointer hover:bg-slate-600 transition-colors`}
      onClick={() => !editing && startEdit()}
    >
      {editing ? (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <span className="flex-1 text-sm font-medium truncate">{match.teamA?.name}</span>
          <input
            autoFocus
            type="number"
            min={0}
            value={sA}
            onChange={e => setSA(e.target.value)}
            className="w-12 text-center bg-slate-900 border border-slate-500 rounded-lg p-1 text-white focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-400">:</span>
          <input
            type="number"
            min={0}
            value={sB}
            onChange={e => setSB(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            className="w-12 text-center bg-slate-900 border border-slate-500 rounded-lg p-1 text-white focus:outline-none focus:border-blue-500"
          />
          <span className="flex-1 text-sm font-medium truncate text-right">{match.teamB?.name}</span>
          <button onClick={save} className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-medium">✓</button>
          <button onClick={() => setEditing(false)} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-lg text-xs">✕</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className={`flex-1 text-sm font-medium truncate ${played && match.result!.scoreA > match.result!.scoreB ? 'text-yellow-300' : ''}`}>
            {match.teamA?.name}
          </span>
          {played ? (
            <div className="flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-lg min-w-[64px] justify-center">
              <span className={`font-bold ${match.result!.scoreA > match.result!.scoreB ? 'text-yellow-300' : 'text-slate-300'}`}>
                {match.result!.scoreA}
              </span>
              <span className="text-slate-500 text-xs">:</span>
              <span className={`font-bold ${match.result!.scoreB > match.result!.scoreA ? 'text-yellow-300' : 'text-slate-300'}`}>
                {match.result!.scoreB}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-slate-800 rounded-lg min-w-[64px] text-center text-slate-500 text-xs">
              — : —
            </div>
          )}
          <span className={`flex-1 text-sm font-medium truncate text-right ${played && match.result!.scoreB > match.result!.scoreA ? 'text-yellow-300' : ''}`}>
            {match.teamB?.name}
          </span>
        </div>
      )}
    </div>
  )
}

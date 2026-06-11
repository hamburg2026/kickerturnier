import { useState } from 'react'
import type { Match } from '../types'

type Props = {
  match: Match
  onResult: (matchId: string, scoreA: number, scoreB: number) => void
}

export default function MatchCard({ match, onResult }: Props) {
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
  const isBye = !match.teamA || !match.teamB

  if (isBye) {
    const team = match.teamA ?? match.teamB
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-500">
        <span>Freilos</span>
        <span className="text-zinc-300">{team?.name ?? '—'}</span>
      </div>
    )
  }

  const winnerA = played && match.result!.scoreA > match.result!.scoreB
  const winnerB = played && match.result!.scoreB > match.result!.scoreA

  return (
    <div
      className="group flex items-center gap-2 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded cursor-pointer hover:border-zinc-600 transition-colors"
      onClick={() => !editing && startEdit()}
    >
      {editing ? (
        <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
          <span className="flex-1 text-sm truncate text-zinc-300">{match.teamA?.name}</span>
          <input
            autoFocus type="number" min={0} value={sA}
            onChange={e => setSA(e.target.value)}
            className="w-11 text-center bg-zinc-950 border border-zinc-600 rounded p-1 text-sm text-white focus:outline-none focus:border-zinc-400 font-mono"
          />
          <span className="text-zinc-600 text-xs">:</span>
          <input
            type="number" min={0} value={sB}
            onChange={e => setSB(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            className="w-11 text-center bg-zinc-950 border border-zinc-600 rounded p-1 text-sm text-white focus:outline-none focus:border-zinc-400 font-mono"
          />
          <span className="flex-1 text-sm truncate text-right text-zinc-300">{match.teamB?.name}</span>
          <button onClick={save} className="ml-1 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-zinc-200">✓</button>
          <button onClick={() => setEditing(false)} className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-400">✕</button>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <span className={`flex-1 text-sm truncate ${winnerA ? 'text-zinc-100 font-medium' : 'text-zinc-400'}`}>
            {match.teamA?.name}
          </span>
          <div className="flex items-center gap-1 font-mono text-sm min-w-[52px] justify-center">
            {played ? (
              <>
                <span className={winnerA ? 'text-zinc-100 font-semibold' : 'text-zinc-500'}>{match.result!.scoreA}</span>
                <span className="text-zinc-700">:</span>
                <span className={winnerB ? 'text-zinc-100 font-semibold' : 'text-zinc-500'}>{match.result!.scoreB}</span>
              </>
            ) : (
              <span className="text-zinc-700 text-xs group-hover:text-zinc-500 transition-colors">· · ·</span>
            )}
          </div>
          <span className={`flex-1 text-sm truncate text-right ${winnerB ? 'text-zinc-100 font-medium' : 'text-zinc-400'}`}>
            {match.teamB?.name}
          </span>
        </div>
      )}
    </div>
  )
}

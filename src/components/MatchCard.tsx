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
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-500">
        Freilos: <span className="text-emerald-400">{team?.name ?? '—'}</span>
      </div>
    )
  }

  const winA = played && match.result!.scoreA > match.result!.scoreB
  const winB = played && match.result!.scoreB > match.result!.scoreA

  return (
    <div
      className="group flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-sky-600 hover:bg-gray-750 transition-colors"
      onClick={() => !editing && startEdit()}
    >
      {editing ? (
        <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
          <span className="flex-1 text-sm truncate text-gray-200">{match.teamA?.name}</span>
          <input
            autoFocus type="number" min={0} value={sA}
            onChange={e => setSA(e.target.value)}
            className="w-11 text-center bg-gray-900 border border-gray-600 rounded p-1 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
          />
          <span className="text-gray-600 text-xs font-mono">:</span>
          <input
            type="number" min={0} value={sB}
            onChange={e => setSB(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            className="w-11 text-center bg-gray-900 border border-gray-600 rounded p-1 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
          />
          <span className="flex-1 text-sm truncate text-right text-gray-200">{match.teamB?.name}</span>
          <button onClick={save} className="ml-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs text-white font-medium">✓</button>
          <button onClick={() => setEditing(false)} className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">✕</button>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <span className={`flex-1 text-sm truncate transition-colors ${winA ? 'text-white font-semibold' : 'text-gray-300'}`}>
            {match.teamA?.name}
          </span>
          <div className="flex items-center gap-1 font-mono text-sm min-w-[56px] justify-center">
            {played ? (
              <>
                <span className={winA ? 'text-emerald-400 font-bold' : 'text-gray-500'}>{match.result!.scoreA}</span>
                <span className="text-gray-700">:</span>
                <span className={winB ? 'text-emerald-400 font-bold' : 'text-gray-500'}>{match.result!.scoreB}</span>
              </>
            ) : (
              <span className="text-gray-600 text-xs group-hover:text-gray-400 transition-colors">vs</span>
            )}
          </div>
          <span className={`flex-1 text-sm truncate text-right transition-colors ${winB ? 'text-white font-semibold' : 'text-gray-300'}`}>
            {match.teamB?.name}
          </span>
        </div>
      )}
    </div>
  )
}

import type { KnockoutRound, Match } from '../types'
import { getKnockoutWinner } from '../tournament'

type Props = {
  rounds: KnockoutRound[]
  onResult: (matchId: string, scoreA: number, scoreB: number) => void
  champion: import('../types').Team | null
}

function BracketMatch({
  match,
  onResult,
  isFinal,
}: {
  match: Match
  onResult: Props['onResult']
  isFinal: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [sA, setSA] = useState(match.result?.scoreA?.toString() ?? '')
  const [sB, setSB] = useState(match.result?.scoreB?.toString() ?? '')

  function save() {
    const a = parseInt(sA)
    const b = parseInt(sB)
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0 || a === b) return
    onResult(match.id, a, b)
    setEditing(false)
  }

  const winner = getKnockoutWinner(match)
  const isBye = !match.teamA || !match.teamB
  const canPlay = match.teamA && match.teamB && !isBye
  const played = match.result !== null

  return (
    <div
      className={`bg-slate-700 rounded-xl overflow-hidden select-none ${canPlay && !editing ? 'cursor-pointer hover:bg-slate-600 transition-colors' : ''} ${isFinal ? 'ring-2 ring-yellow-500' : ''}`}
      style={{ minWidth: 200 }}
      onClick={() => canPlay && !editing && !played ? setEditing(true) : canPlay && !editing && played ? setEditing(true) : undefined}
    >
      {/* Team A */}
      <div className={`px-3 py-2 flex items-center justify-between gap-2 border-b border-slate-600 ${winner === match.teamA ? 'bg-yellow-500/20' : ''}`}>
        <span className={`text-sm font-medium truncate ${!match.teamA ? 'text-slate-500 italic' : winner === match.teamA ? 'text-yellow-300' : 'text-slate-200'}`}>
          {match.teamA?.name ?? 'TBD'}
        </span>
        {played && (
          <span className={`font-bold text-sm min-w-[20px] text-right ${winner === match.teamA ? 'text-yellow-300' : 'text-slate-400'}`}>
            {match.result!.scoreA}
          </span>
        )}
      </div>
      {/* Team B */}
      <div className={`px-3 py-2 flex items-center justify-between gap-2 ${winner === match.teamB ? 'bg-yellow-500/20' : ''}`}>
        <span className={`text-sm font-medium truncate ${!match.teamB ? 'text-slate-500 italic' : winner === match.teamB ? 'text-yellow-300' : 'text-slate-200'}`}>
          {match.teamB?.name ?? 'TBD'}
        </span>
        {played && (
          <span className={`font-bold text-sm min-w-[20px] text-right ${winner === match.teamB ? 'text-yellow-300' : 'text-slate-400'}`}>
            {match.result!.scoreB}
          </span>
        )}
      </div>

      {editing && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-slate-800 rounded-2xl p-6 space-y-4 w-72 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-center">Ergebnis eintragen</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="flex-1 text-sm truncate">{match.teamA?.name}</span>
                <input
                  autoFocus
                  type="number"
                  min={0}
                  value={sA}
                  onChange={e => setSA(e.target.value)}
                  className="w-14 text-center bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="text-center text-slate-400 text-sm">vs</div>
              <div className="flex items-center gap-3">
                <span className="flex-1 text-sm truncate">{match.teamB?.name}</span>
                <input
                  type="number"
                  min={0}
                  value={sB}
                  onChange={e => setSB(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && save()}
                  className="w-14 text-center bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            {parseInt(sA) === parseInt(sB) && sA !== '' && sB !== '' && (
              <p className="text-red-400 text-xs text-center">KO-Spiele müssen einen Sieger haben (kein Unentschieden)</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
                Abbrechen
              </button>
              <button onClick={save} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium">
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'

export default function KnockoutBracket({ rounds, onResult, champion }: Props) {
  if (rounds.length === 0) return null

  return (
    <div className="space-y-6">
      {champion && (
        <div className="text-center bg-yellow-500/20 border border-yellow-500 rounded-2xl p-6">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-yellow-300">Turniersieger</h2>
          <p className="text-xl text-white mt-1">{champion.name}</p>
          {champion.players.length > 1 && (
            <p className="text-sm text-yellow-200 mt-1">
              {champion.players.map(p => p.name).join(' & ')}
            </p>
          )}
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 items-start" style={{ minWidth: 'max-content' }}>
          {rounds.map((round, ri) => {
            const isFinalRound = ri === rounds.length - 1
            return (
              <div key={round.roundIndex} className="flex flex-col gap-4">
                <h3 className={`text-center font-bold text-sm ${isFinalRound ? 'text-yellow-400' : 'text-slate-400'}`}>
                  {round.name}
                </h3>
                <div
                  className="flex flex-col justify-around"
                  style={{ gap: `${Math.pow(2, ri) * 8}px`, flex: 1 }}
                >
                  {round.matches.map(match => (
                    <div key={match.id} className="relative">
                      <BracketMatch
                        match={match}
                        onResult={onResult}
                        isFinal={isFinalRound && rounds[0].matches.length === 1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

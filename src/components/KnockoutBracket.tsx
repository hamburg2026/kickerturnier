import { useState } from 'react'
import type { KnockoutRound, Match, Team } from '../types'
import { getKnockoutWinner } from '../tournament'

type Props = {
  rounds: KnockoutRound[]
  onResult: (matchId: string, scoreA: number, scoreB: number) => void
  champion: Team | null
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
  const canPlay = !!(match.teamA && match.teamB)
  const played = match.result !== null

  return (
    <div
      className={`rounded border overflow-hidden select-none ${
        isFinal ? 'border-zinc-500' : 'border-zinc-800'
      } ${canPlay && !editing ? 'cursor-pointer hover:border-zinc-600 transition-colors' : ''}`}
      style={{ minWidth: 190 }}
      onClick={() => canPlay && !editing && setEditing(true)}
    >
      {/* Team A row */}
      <div className={`px-3 py-2 flex items-center justify-between gap-2 border-b ${
        isFinal ? 'border-zinc-700' : 'border-zinc-800'
      } ${winner === match.teamA ? 'bg-zinc-800' : 'bg-zinc-900'}`}>
        <span className={`text-sm truncate ${
          !match.teamA ? 'text-zinc-700 italic' :
          winner === match.teamA ? 'text-zinc-100 font-medium' : 'text-zinc-500'
        }`}>
          {match.teamA?.name ?? 'TBD'}
        </span>
        {played && (
          <span className={`font-mono text-sm font-semibold min-w-[16px] text-right ${
            winner === match.teamA ? 'text-zinc-100' : 'text-zinc-600'
          }`}>
            {match.result!.scoreA}
          </span>
        )}
      </div>
      {/* Team B row */}
      <div className={`px-3 py-2 flex items-center justify-between gap-2 ${
        winner === match.teamB ? 'bg-zinc-800' : 'bg-zinc-900'
      }`}>
        <span className={`text-sm truncate ${
          !match.teamB ? 'text-zinc-700 italic' :
          winner === match.teamB ? 'text-zinc-100 font-medium' : 'text-zinc-500'
        }`}>
          {match.teamB?.name ?? 'TBD'}
        </span>
        {played && (
          <span className={`font-mono text-sm font-semibold min-w-[16px] text-right ${
            winner === match.teamB ? 'text-zinc-100' : 'text-zinc-600'
          }`}>
            {match.result!.scoreB}
          </span>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setEditing(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 space-y-5 w-72 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-zinc-300 text-center tracking-wide">Ergebnis</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex-1 text-sm text-zinc-300 truncate">{match.teamA?.name}</span>
                <input
                  autoFocus type="number" min={0} value={sA}
                  onChange={e => setSA(e.target.value)}
                  className="w-14 text-center bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-1 text-sm text-zinc-300 truncate">{match.teamB?.name}</span>
                <input
                  type="number" min={0} value={sB}
                  onChange={e => setSB(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && save()}
                  className="w-14 text-center bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
            {sA !== '' && sB !== '' && parseInt(sA) === parseInt(sB) && (
              <p className="text-zinc-500 text-xs text-center">KO-Spiel braucht einen Sieger</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2 border border-zinc-700 hover:border-zinc-600 rounded text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={save}
                className="flex-1 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded text-xs font-semibold transition-colors"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function KnockoutBracket({ rounds, onResult, champion }: Props) {
  if (rounds.length === 0) return null

  return (
    <div className="space-y-6">
      {champion && (
        <div className="border border-zinc-700 bg-zinc-900 rounded-lg p-6 text-center space-y-1">
          <p className="text-xs tracking-widest text-zinc-500 uppercase">Turniersieger</p>
          <p className="text-2xl font-semibold text-zinc-100">{champion.name}</p>
          {champion.players.length > 1 && (
            <p className="text-sm text-zinc-500">{champion.players.map(p => p.name).join(' & ')}</p>
          )}
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 items-start" style={{ minWidth: 'max-content' }}>
          {rounds.map((round, ri) => {
            const isFinalRound = ri === rounds.length - 1
            const spacing = Math.pow(2, ri) * 12
            return (
              <div key={round.roundIndex} className="flex flex-col">
                <p className={`text-center text-xs tracking-widest uppercase mb-3 ${
                  isFinalRound ? 'text-zinc-300' : 'text-zinc-600'
                }`}>
                  {round.name}
                </p>
                <div className="flex flex-col" style={{ gap: `${spacing}px` }}>
                  {round.matches.map(match => (
                    <BracketMatch
                      key={match.id}
                      match={match}
                      onResult={onResult}
                      isFinal={isFinalRound}
                    />
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

import { useState } from 'react'
import type { KnockoutRound, Match } from '../types'
import { getKnockoutWinner } from '../tournament'

type Props = {
  rounds: KnockoutRound[]
  onResult: (matchId: string, scoreA: number, scoreB: number) => void
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
    <>
      <div
        className={`rounded-lg border overflow-hidden select-none ${
          isFinal
            ? 'border-amber-500/60 shadow-lg shadow-amber-500/10'
            : 'border-gray-700'
        } ${canPlay && !editing ? 'cursor-pointer hover:border-sky-500 transition-colors' : ''}`}
        style={{ minWidth: 200 }}
        onClick={() => canPlay && !editing && setEditing(true)}
      >
        {/* Team A */}
        <div className={`px-3 py-2.5 flex items-center justify-between gap-2 border-b ${
          isFinal ? 'border-amber-500/30' : 'border-gray-700'
        } ${winner === match.teamA ? 'bg-emerald-900/30' : 'bg-gray-800'}`}>
          <span className={`text-sm truncate ${
            !match.teamA ? 'text-gray-600 italic' :
            winner === match.teamA ? 'text-emerald-300 font-semibold' : 'text-gray-300'
          }`}>
            {match.teamA?.name ?? 'TBD'}
          </span>
          {played && (
            <span className={`font-mono font-bold text-sm min-w-[18px] text-right ${
              winner === match.teamA ? 'text-emerald-400' : 'text-gray-500'
            }`}>
              {match.result!.scoreA}
            </span>
          )}
        </div>
        {/* Team B */}
        <div className={`px-3 py-2.5 flex items-center justify-between gap-2 ${
          winner === match.teamB ? 'bg-emerald-900/30' : 'bg-gray-800'
        }`}>
          <span className={`text-sm truncate ${
            !match.teamB ? 'text-gray-600 italic' :
            winner === match.teamB ? 'text-emerald-300 font-semibold' : 'text-gray-300'
          }`}>
            {match.teamB?.name ?? 'TBD'}
          </span>
          {played && (
            <span className={`font-mono font-bold text-sm min-w-[18px] text-right ${
              winner === match.teamB ? 'text-emerald-400' : 'text-gray-500'
            }`}>
              {match.result!.scoreB}
            </span>
          )}
        </div>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setEditing(false)}
        >
          <div
            className="bg-gray-800 border border-gray-600 rounded-xl p-6 space-y-5 w-76 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-gray-200 text-center">Ergebnis eintragen</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="flex-1 text-sm text-gray-200 truncate">{match.teamA?.name}</span>
                <input
                  autoFocus type="number" min={0} value={sA}
                  onChange={e => setSA(e.target.value)}
                  className="w-14 text-center bg-gray-900 border border-gray-600 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-1 text-sm text-gray-200 truncate">{match.teamB?.name}</span>
                <input
                  type="number" min={0} value={sB}
                  onChange={e => setSB(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && save()}
                  className="w-14 text-center bg-gray-900 border border-gray-600 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
            {sA !== '' && sB !== '' && parseInt(sA) === parseInt(sB) && (
              <p className="text-amber-400 text-xs text-center">KO-Spiel braucht einen Sieger</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2 border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-gray-200 rounded-lg text-xs transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={save}
                className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function KnockoutBracket({ rounds, onResult }: Props) {
  if (rounds.length === 0) return null

  return (
    <div className="space-y-6">

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 items-start" style={{ minWidth: 'max-content' }}>
          {rounds.map((round, ri) => {
            const isFinalRound = ri === rounds.length - 1
            const spacing = Math.pow(2, ri) * 14
            // In the first round, hide bye slots — top seeds appear directly in round 2
            const displayMatches = ri === 0
              ? round.matches.filter(m => m.teamA && m.teamB)
              : round.matches
            if (displayMatches.length === 0) return null
            // If any round-0 slots were hidden (byes), the round is a preliminary
            const roundLabel = (ri === 0 && displayMatches.length < round.matches.length)
              ? 'Vorrunde'
              : round.name
            return (
              <div key={round.roundIndex} className="flex flex-col">
                <p className={`text-center text-xs font-semibold tracking-widest uppercase mb-3 ${
                  isFinalRound ? 'text-amber-400' : 'text-sky-400'
                }`}>
                  {roundLabel}
                </p>
                <div className="flex flex-col" style={{ gap: `${spacing}px` }}>
                  {displayMatches.map(match => (
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

import type { Tournament } from '../types'
import { getTournamentChampion } from '../tournament'
import KnockoutBracket from './KnockoutBracket'
import MatchCard from './MatchCard'

type Props = {
  tournament: Tournament
  onMatchResult: (matchId: string, scoreA: number, scoreB: number) => void
  onSave: () => void
  onReset: () => void
}

export default function KnockoutScreen({ tournament, onMatchResult, onSave, onReset }: Props) {
  const { knockoutRounds, phase } = tournament
  const champion = getTournamentChampion(knockoutRounds)

  const totalMatches = knockoutRounds.reduce((s, r) => s + r.matches.filter(m => m.teamA && m.teamB).length, 0)
  const playedMatches = knockoutRounds.reduce((s, r) => s + r.matches.filter(m => m.result).length, 0)

  const activeRoundIdx = knockoutRounds.findIndex(
    r => r.matches.some(m => m.result === null && m.teamA && m.teamB)
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-widest text-zinc-500 uppercase">KO-Runden</span>
            <span className="text-zinc-700">|</span>
            <span className="text-xs text-zinc-500 font-mono">{playedMatches}/{totalMatches} Spiele</span>
            {phase === 'finished' && (
              <>
                <span className="text-zinc-700">|</span>
                <span className="text-xs text-zinc-300">Abgeschlossen</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="px-3 py-1.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 rounded text-xs transition-colors"
              title="Turnier als Datei speichern"
            >
              Speichern
            </button>
            <button
              onClick={onReset}
              className="px-3 py-1.5 text-zinc-600 hover:text-zinc-400 rounded text-xs transition-colors"
            >
              Neu
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 pt-6 space-y-6">
        <KnockoutBracket
          rounds={knockoutRounds}
          onResult={onMatchResult}
          champion={phase === 'finished' ? champion : null}
        />

        {/* Active round list */}
        {activeRoundIdx >= 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
                {knockoutRounds[activeRoundIdx].name}
              </h2>
            </div>
            <div className="p-3 space-y-1">
              {knockoutRounds[activeRoundIdx].matches
                .filter(m => m.teamA && m.teamB)
                .map(m => (
                  <MatchCard key={m.id} match={m} onResult={onMatchResult} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

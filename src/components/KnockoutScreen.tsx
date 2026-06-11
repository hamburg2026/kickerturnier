import type { Tournament } from '../types'
import { getTournamentChampion } from '../tournament'
import KnockoutBracket from './KnockoutBracket'
import MatchCard from './MatchCard'

type Props = {
  tournament: Tournament
  onMatchResult: (matchId: string, scoreA: number, scoreB: number) => void
  onReset: () => void
}

export default function KnockoutScreen({ tournament, onMatchResult, onReset }: Props) {
  const { knockoutRounds, phase } = tournament
  const champion = getTournamentChampion(knockoutRounds)

  // Current round: first round with unplayed matches
  const activeRoundIdx = knockoutRounds.findIndex(r => r.matches.some(m => m.result === null && m.teamA && m.teamB))

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">KO-Runden</h1>
            <p className="text-slate-400 text-sm">Klicke auf ein Spiel um das Ergebnis einzutragen</p>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition-colors"
          >
            ↩ Neu starten
          </button>
        </div>

        <KnockoutBracket
          rounds={knockoutRounds}
          onResult={onMatchResult}
          champion={phase === 'finished' ? champion : null}
        />

        {/* Current round matches list */}
        {activeRoundIdx >= 0 && (
          <div className="bg-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-lg font-semibold text-white">
              Aktuelle Runde: {knockoutRounds[activeRoundIdx].name}
            </h2>
            <div className="space-y-2">
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

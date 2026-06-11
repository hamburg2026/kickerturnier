import type { Tournament } from '../types'
import { getTournamentChampion } from '../tournament'
import KnockoutBracket from './KnockoutBracket'
import MatchCard from './MatchCard'
import ChampionBanner from './ChampionBanner'

type Props = {
  tournament: Tournament
  onMatchResult: (matchId: string, scoreA: number, scoreB: number) => void
}

export default function KnockoutScreen({ tournament, onMatchResult }: Props) {
  const { knockoutRounds, phase } = tournament
  const champion = phase === 'finished' ? getTournamentChampion(knockoutRounds) : null

  const activeRoundIdx = knockoutRounds.findIndex(
    r => r.matches.some(m => m.result === null && m.teamA && m.teamB)
  )

  return (
    <div className="p-4 max-w-6xl mx-auto w-full space-y-5">
      <KnockoutBracket
        rounds={knockoutRounds}
        onResult={onMatchResult}
      />

      {activeRoundIdx >= 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-sky-400 uppercase">
              {knockoutRounds[activeRoundIdx].name}
            </span>
            <span className="text-xs text-gray-500">— Ergebnisse eingeben</span>
          </div>
          <div className="p-3 space-y-1.5">
            {knockoutRounds[activeRoundIdx].matches
              .filter(m => m.teamA && m.teamB)
              .map(m => (
                <MatchCard key={m.id} match={m} onResult={onMatchResult} />
              ))}
          </div>
        </div>
      )}

      {champion && <ChampionBanner champion={champion} />}
    </div>
  )
}

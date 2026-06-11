import { computeGroupStandings, isGroupPhaseComplete } from '../tournament'
import type { Tournament, Match } from '../types'
import MatchCard from './MatchCard'

type Props = {
  tournament: Tournament
  onMatchResult: (matchId: string, scoreA: number, scoreB: number) => void
  onAdvance: () => void
}

export default function GroupPhaseScreen({ tournament, onMatchResult, onAdvance }: Props) {
  const { groups } = tournament
  const complete = isGroupPhaseComplete(groups)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Gruppenphase</h1>
            <p className="text-slate-400 text-sm">Klicke auf ein Spiel um das Ergebnis einzutragen</p>
          </div>
          {complete && (
            <button
              onClick={onAdvance}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition-colors"
            >
              → KO-Runde
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map(group => {
            const standings = computeGroupStandings(group)
            const advance = tournament.config.advanceFromGroup

            return (
              <div key={group.id} className="bg-slate-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-lg font-bold text-white">{group.name}</h2>

                {/* Standings Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="text-left py-1 pr-2">#</th>
                        <th className="text-left py-1">Team</th>
                        <th className="py-1 text-center">Sp</th>
                        <th className="py-1 text-center">S</th>
                        <th className="py-1 text-center">U</th>
                        <th className="py-1 text-center">N</th>
                        <th className="py-1 text-center">Tore</th>
                        <th className="py-1 text-center font-bold">Pkt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((s, i) => (
                        <tr
                          key={s.team.id}
                          className={`border-b border-slate-700/50 ${i < advance ? 'text-green-400' : 'text-slate-300'}`}
                        >
                          <td className="py-1 pr-2 text-slate-500">{i + 1}</td>
                          <td className="py-1 font-medium truncate max-w-[120px]">{s.team.name}</td>
                          <td className="py-1 text-center">{s.played}</td>
                          <td className="py-1 text-center">{s.wins}</td>
                          <td className="py-1 text-center">{s.draws}</td>
                          <td className="py-1 text-center">{s.losses}</td>
                          <td className="py-1 text-center">{s.goalsFor}:{s.goalsAgainst}</td>
                          <td className="py-1 text-center font-bold">{s.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-green-400 mt-1">
                    ↑ Top {advance} qualifizieren sich
                  </p>
                </div>

                {/* Matches */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-400">Spiele</h3>
                  {group.matches.map((m: Match) => (
                    <MatchCard key={m.id} match={m} onResult={onMatchResult} />
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

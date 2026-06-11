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
    <div className="p-4 max-w-5xl mx-auto w-full">
      {complete && (
        <div className="mb-4 flex items-center justify-between bg-emerald-900/30 border border-emerald-700 rounded-xl px-4 py-3">
          <span className="text-emerald-300 text-sm font-medium">
            Alle Gruppenspiele abgeschlossen
          </span>
          <button
            onClick={onAdvance}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Weiter zur KO-Runde →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(group => {
          const standings = computeGroupStandings(group)
          const advance = tournament.config.advanceFromGroup

          // Group matches by round number
          const byRound: Record<number, Match[]> = {}
          group.matches.forEach(m => {
            const r = m.round ?? 0
            if (!byRound[r]) byRound[r] = []
            byRound[r].push(m)
          })
          const rounds = Object.entries(byRound)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))

          return (
            <div key={group.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              {/* Group header */}
              <div className="px-4 py-3 bg-gray-750 border-b border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold text-white">{group.name}</h2>
                <span className="text-xs text-gray-500 font-mono">
                  {group.matches.filter(m => m.result).length}/{group.matches.length}
                </span>
              </div>

              {/* Standings table */}
              <div className="px-4 py-3 border-b border-gray-700">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-700">
                      <th className="text-left pb-1.5 pr-1 font-medium w-5">#</th>
                      <th className="text-left pb-1.5 font-medium">Team</th>
                      <th className="pb-1.5 text-center font-medium w-7">Sp</th>
                      <th className="pb-1.5 text-center font-medium w-7">S</th>
                      <th className="pb-1.5 text-center font-medium w-7">U</th>
                      <th className="pb-1.5 text-center font-medium w-7">N</th>
                      <th className="pb-1.5 text-center font-medium w-16">Tore</th>
                      <th className="pb-1.5 text-center font-semibold w-8">Pkt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => (
                      <tr key={s.team.id} className="border-b border-gray-700/40 last:border-0">
                        <td className="py-1.5 pr-1 text-gray-600 font-mono">{i + 1}</td>
                        <td className={`py-1.5 truncate max-w-[110px] ${i < advance ? 'text-emerald-300 font-medium' : 'text-gray-400'}`}>
                          {i < advance && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 mb-0.5 align-middle" />}
                          {s.team.name}
                        </td>
                        <td className="py-1.5 text-center font-mono text-gray-300">{s.played}</td>
                        <td className="py-1.5 text-center font-mono text-gray-300">{s.wins}</td>
                        <td className="py-1.5 text-center font-mono text-gray-300">{s.draws}</td>
                        <td className="py-1.5 text-center font-mono text-gray-300">{s.losses}</td>
                        <td className="py-1.5 text-center font-mono text-gray-300">{s.goalsFor}:{s.goalsAgainst}</td>
                        <td className={`py-1.5 text-center font-mono font-bold ${i < advance ? 'text-emerald-300' : 'text-gray-200'}`}>
                          {s.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-emerald-500/70 mt-1.5">● Top {advance} qualifizieren sich</p>
              </div>

              {/* Matches by round */}
              <div className="divide-y divide-gray-700/50">
                {rounds.map(([roundNum, roundMatches]) => {
                  const teamsInRound = new Set(roundMatches.flatMap(m => [m.teamA?.id, m.teamB?.id].filter(Boolean)))
                  const byeTeams = group.teams.filter(t => !teamsInRound.has(t.id))
                  return (
                    <div key={roundNum} className="px-3 py-3 space-y-1.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-sky-400 uppercase tracking-wider">
                          Runde {parseInt(roundNum) + 1}
                        </span>
                        <span className="text-xs text-gray-600">
                          {roundMatches.filter(m => m.result).length}/{roundMatches.length} gespielt
                        </span>
                      </div>
                      {roundMatches.map((m: Match) => (
                        <MatchCard key={m.id} match={m} onResult={onMatchResult} />
                      ))}
                      {byeTeams.map(t => (
                        <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-700/50 bg-gray-750">
                          <span className="text-sm text-gray-400 truncate">{t.name}</span>
                          <span className="text-xs text-gray-600 bg-gray-700/50 px-2 py-0.5 rounded ml-2 shrink-0">Freilos</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

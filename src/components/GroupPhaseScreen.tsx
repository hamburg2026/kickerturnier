import { computeGroupStandings, isGroupPhaseComplete } from '../tournament'
import type { Tournament, Match } from '../types'
import MatchCard from './MatchCard'

type Props = {
  tournament: Tournament
  onMatchResult: (matchId: string, scoreA: number, scoreB: number) => void
  onAdvance: () => void
  onSave: () => void
  onReset: () => void
}

export default function GroupPhaseScreen({ tournament, onMatchResult, onAdvance, onSave, onReset }: Props) {
  const { groups } = tournament
  const complete = isGroupPhaseComplete(groups)
  const totalMatches = groups.reduce((s, g) => s + g.matches.length, 0)
  const playedMatches = groups.reduce((s, g) => s + g.matches.filter(m => m.result).length, 0)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-widest text-zinc-500 uppercase">Gruppenphase</span>
            <span className="text-zinc-700">|</span>
            <span className="text-xs text-zinc-500 font-mono">{playedMatches}/{totalMatches} Spiele</span>
          </div>
          <div className="flex items-center gap-2">
            {complete && (
              <button
                onClick={onAdvance}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded text-xs font-semibold tracking-wide transition-colors"
              >
                KO-Runde →
              </button>
            )}
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

      <div className="max-w-5xl mx-auto p-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(group => {
            const standings = computeGroupStandings(group)
            const advance = tournament.config.advanceFromGroup

            return (
              <div key={group.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-100 tracking-wide">{group.name}</h2>
                  <span className="text-xs text-zinc-600">
                    {group.matches.filter(m => m.result).length}/{group.matches.length}
                  </span>
                </div>

                {/* Standings */}
                <div className="px-4 pt-3 pb-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-zinc-600 border-b border-zinc-800">
                        <th className="text-left pb-1.5 pr-2 font-normal w-5">#</th>
                        <th className="text-left pb-1.5 font-normal">Team</th>
                        <th className="pb-1.5 text-center font-normal w-7">Sp</th>
                        <th className="pb-1.5 text-center font-normal w-7">S</th>
                        <th className="pb-1.5 text-center font-normal w-7">U</th>
                        <th className="pb-1.5 text-center font-normal w-7">N</th>
                        <th className="pb-1.5 text-center font-normal w-14">Tore</th>
                        <th className="pb-1.5 text-center font-semibold w-8">Pkt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((s, i) => (
                        <tr
                          key={s.team.id}
                          className={`border-b border-zinc-800/50 ${
                            i < advance
                              ? 'text-zinc-200'
                              : 'text-zinc-500'
                          }`}
                        >
                          <td className="py-1.5 pr-2 text-zinc-600 font-mono">{i + 1}</td>
                          <td className="py-1.5 truncate max-w-[110px]">
                            {i < advance && (
                              <span className="inline-block w-1 h-3 bg-zinc-400 rounded-full mr-2 align-middle opacity-60" />
                            )}
                            {s.team.name}
                          </td>
                          <td className="py-1.5 text-center font-mono">{s.played}</td>
                          <td className="py-1.5 text-center font-mono">{s.wins}</td>
                          <td className="py-1.5 text-center font-mono">{s.draws}</td>
                          <td className="py-1.5 text-center font-mono">{s.losses}</td>
                          <td className="py-1.5 text-center font-mono">{s.goalsFor}:{s.goalsAgainst}</td>
                          <td className="py-1.5 text-center font-mono font-semibold">{s.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-zinc-600 mt-2 pb-1">
                    Top {advance} qualifizieren sich
                  </p>
                </div>

                {/* Matches */}
                <div className="px-3 pb-3 space-y-1 border-t border-zinc-800 pt-3">
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

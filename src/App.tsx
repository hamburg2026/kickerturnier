import { useState, useCallback, useRef } from 'react'
import type { Tournament, Player, TournamentConfig } from './types'
import {
  createTournament,
  advanceToKnockout,
  updateKnockoutRounds,
  getKnockoutWinner,
} from './tournament'
import { saveTournament, loadTournament } from './backup'
import GlobalHeader from './components/GlobalHeader'
import SetupScreen from './components/SetupScreen'
import GroupPhaseScreen from './components/GroupPhaseScreen'
import KnockoutScreen from './components/KnockoutScreen'

export default function App() {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loadError, setLoadError] = useState('')
  const loadRef = useRef<HTMLInputElement>(null)

  function handleStart(players: Player[], config: TournamentConfig) {
    setTournament(createTournament(players, config))
  }

  function handleSave() {
    if (tournament) saveTournament(tournament)
  }

  function handleLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    loadTournament(file)
      .then(t => { setTournament(t); setLoadError('') })
      .catch(err => setLoadError(err.message))
  }

  const handleGroupMatchResult = useCallback((matchId: string, scoreA: number, scoreB: number) => {
    setTournament(prev => {
      if (!prev) return prev
      const groups = prev.groups.map(g => ({
        ...g,
        matches: g.matches.map(m =>
          m.id === matchId ? { ...m, result: { scoreA, scoreB } } : m
        ),
      }))
      return { ...prev, groups }
    })
  }, [])

  function handleAdvanceToKnockout() {
    setTournament(prev => prev ? advanceToKnockout(prev) : prev)
  }

  const handleKnockoutMatchResult = useCallback((matchId: string, scoreA: number, scoreB: number) => {
    setTournament(prev => {
      if (!prev) return prev
      let updatedRounds = prev.knockoutRounds.map(r => ({
        ...r,
        matches: r.matches.map(m =>
          m.id === matchId ? { ...m, result: { scoreA, scoreB } } : m
        ),
      }))
      updatedRounds = updateKnockoutRounds(updatedRounds)
      const lastRound = updatedRounds[updatedRounds.length - 1]
      const finished =
        lastRound?.matches.length === 1 &&
        lastRound.matches[0].result !== null &&
        getKnockoutWinner(lastRound.matches[0]) !== null
      return { ...prev, knockoutRounds: updatedRounds, phase: finished ? 'finished' : 'knockout' }
    })
  }, [])

  function handleReset() {
    setTournament(null)
    setLoadError('')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <GlobalHeader
        tournament={tournament}
        onSave={handleSave}
        onReset={handleReset}
        onLoadFile={handleLoadFile}
        loadRef={loadRef}
      />
      <main className="flex-1 flex flex-col">
        {!tournament && (
          <SetupScreen onStart={handleStart} loadError={loadError} />
        )}
        {tournament?.phase === 'groups' && (
          <GroupPhaseScreen
            tournament={tournament}
            onMatchResult={handleGroupMatchResult}
            onAdvance={handleAdvanceToKnockout}
          />
        )}
        {(tournament?.phase === 'knockout' || tournament?.phase === 'finished') && (
          <KnockoutScreen
            tournament={tournament}
            onMatchResult={handleKnockoutMatchResult}
          />
        )}
      </main>
    </div>
  )
}

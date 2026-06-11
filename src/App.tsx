import { useState, useCallback } from 'react'
import type { Tournament, Player, TournamentConfig } from './types'
import {
  createTournament,
  advanceToKnockout,
  updateKnockoutRounds,
  getKnockoutWinner,
} from './tournament'
import SetupScreen from './components/SetupScreen'
import GroupPhaseScreen from './components/GroupPhaseScreen'
import KnockoutScreen from './components/KnockoutScreen'

export default function App() {
  const [tournament, setTournament] = useState<Tournament | null>(null)

  function handleStart(players: Player[], config: TournamentConfig) {
    setTournament(createTournament(players, config))
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

      return {
        ...prev,
        knockoutRounds: updatedRounds,
        phase: finished ? 'finished' : 'knockout',
      }
    })
  }, [])

  function handleReset() {
    setTournament(null)
  }

  if (!tournament) {
    return <SetupScreen onStart={handleStart} />
  }

  if (tournament.phase === 'groups') {
    return (
      <GroupPhaseScreen
        tournament={tournament}
        onMatchResult={handleGroupMatchResult}
        onAdvance={handleAdvanceToKnockout}
      />
    )
  }

  return (
    <KnockoutScreen
      tournament={tournament}
      onMatchResult={handleKnockoutMatchResult}
      onReset={handleReset}
    />
  )
}

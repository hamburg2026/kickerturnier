import type {
  Player, Team, Match, Group, KnockoutRound,
  TournamentConfig, GroupStanding, Tournament
} from './types'

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}


export function teamSkill(team: Team): number {
  return team.players.reduce((s, p) => s + p.skill, 0)
}

export function buildTeams(players: Player[], mode: 'team' | 'individual'): Team[] {
  if (mode === 'individual') {
    // Seed strongest to weakest (for fair KO bracket seeding later)
    return [...players]
      .sort((a, b) => b.skill - a.skill)
      .map(p => ({ id: uid(), name: p.name, players: [p] }))
  }

  // Team mode: balanced high-low pairing
  // Sort descending by skill, pair strongest with weakest
  // → each pair has similar total skill
  const sorted = [...players].sort((a, b) => b.skill - a.skill)
  const teams: Team[] = []
  const half = Math.floor(sorted.length / 2)

  for (let i = 0; i < half; i++) {
    const a = sorted[i]
    const b = sorted[sorted.length - 1 - i]
    teams.push({ id: uid(), name: `${a.name} & ${b.name}`, players: [a, b] })
  }
  if (sorted.length % 2 !== 0) {
    const mid = sorted[half]
    teams.push({ id: uid(), name: mid.name, players: [mid] })
  }
  return teams
}

// Circle-method scheduler: each team plays exactly once per round,
// guaranteeing equal play/rest distribution across all teams.
function roundRobinMatches(teams: Team[], groupId: string): Match[] {
  const list: (Team | null)[] = teams.length % 2 === 0 ? [...teams] : [...teams, null]
  const N = list.length
  const allMatches: Match[] = []

  for (let roundNum = 0; roundNum < N - 1; roundNum++) {
    for (let i = 0; i < N / 2; i++) {
      const tA = list[i]
      const tB = list[N - 1 - i]
      if (tA && tB) {
        allMatches.push({ id: uid(), teamA: tA, teamB: tB, result: null, groupId, round: roundNum })
      }
    }
    // Rotate: fix list[0], shift rest one position clockwise
    const last = list[N - 1]
    for (let i = N - 1; i > 1; i--) list[i] = list[i - 1]
    list[1] = last
  }

  return allMatches
}

export function buildGroups(teams: Team[], numGroups: number): Group[] {
  // Snake-draft by skill: ensures each group has similar total strength
  // e.g. 8 teams, 2 groups → A: 1,4,5,8  B: 2,3,6,7  (equal sums)
  const sorted = [...teams].sort((a, b) => teamSkill(b) - teamSkill(a))
  const groups: Group[] = Array.from({ length: numGroups }, (_, i) => ({
    id: uid(),
    name: `Gruppe ${String.fromCharCode(65 + i)}`,
    teams: [],
    matches: [],
  }))

  sorted.forEach((team, idx) => {
    const round = Math.floor(idx / numGroups)
    const pos = idx % numGroups
    const groupIdx = round % 2 === 0 ? pos : numGroups - 1 - pos
    groups[groupIdx].teams.push(team)
  })

  groups.forEach(g => {
    g.matches = roundRobinMatches(g.teams, g.id)
  })

  return groups
}

export function computeGroupStandings(group: Group): GroupStanding[] {
  const map = new Map<string, GroupStanding>()
  group.teams.forEach(t => {
    map.set(t.id, {
      team: t, played: 0, wins: 0, draws: 0, losses: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0,
    })
  })

  group.matches.forEach(m => {
    if (!m.result || !m.teamA || !m.teamB) return
    const { scoreA, scoreB } = m.result
    const a = map.get(m.teamA.id)!
    const b = map.get(m.teamB.id)!
    a.played++; b.played++
    a.goalsFor += scoreA; a.goalsAgainst += scoreB
    b.goalsFor += scoreB; b.goalsAgainst += scoreA
    if (scoreA > scoreB) { a.wins++; a.points += 3; b.losses++ }
    else if (scoreB > scoreA) { b.wins++; b.points += 3; a.losses++ }
    else { a.draws++; b.draws++; a.points++; b.points++ }
  })

  return [...map.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.goalsFor - a.goalsAgainst
    const gdB = b.goalsFor - b.goalsAgainst
    if (gdB !== gdA) return gdB - gdA
    return b.goalsFor - a.goalsFor
  })
}

// Standard seeded bracket layout: seed 1 can only meet seed 2 in the final.
// Byes go to the highest seeds (best teams advance automatically).
function seededBracketOrder(size: number): number[] {
  let order = [1, 2]
  while (order.length < size) {
    const m = order.length * 2 + 1
    order = order.flatMap(s => [s, m - s])
  }
  return order
}

export function buildKnockoutRounds(qualifiers: (Team | null)[]): KnockoutRound[] {
  const teams = qualifiers.filter((t): t is Team => t !== null)
  // Pad to next power of 2
  let size = 1
  while (size < teams.length) size *= 2

  // Place teams at seeded positions so top seeds get byes and can only meet late
  const bracketOrder = seededBracketOrder(size)
  const padded: (Team | null)[] = bracketOrder.map(seedNum =>
    seedNum <= teams.length ? teams[seedNum - 1] : null
  )

  const rounds: KnockoutRound[] = []
  let currentTeams = padded
  let roundIndex = 0

  const roundNames = (total: number, idx: number): string => {
    const roundsLeft = Math.log2(total) - idx
    if (roundsLeft === 1) return 'Finale'
    if (roundsLeft === 2) return 'Halbfinale'
    if (roundsLeft === 3) return 'Viertelfinale'
    if (roundsLeft === 4) return 'Achtelfinale'
    return `Runde ${idx + 1}`
  }

  while (currentTeams.length > 1) {
    const matches: Match[] = []
    for (let i = 0; i < currentTeams.length; i += 2) {
      const tA = currentTeams[i]
      const tB = currentTeams[i + 1]
      const match: Match = {
        id: uid(),
        teamA: tA,
        teamB: tB,
        result: null,
        round: roundIndex,
        position: i / 2,
      }
      // Auto-advance if one team is null (bye)
      if (tA && !tB) match.result = { scoreA: 1, scoreB: 0 }
      if (!tA && tB) match.result = { scoreA: 0, scoreB: 1 }
      matches.push(match)
    }
    rounds.push({
      name: roundNames(size, roundIndex),
      roundIndex,
      matches,
    })
    currentTeams = new Array(currentTeams.length / 2).fill(null)
    roundIndex++
  }

  // Propagate bye winners into later rounds immediately so the bracket
  // renders correctly on first load (not just after the first result entry).
  return updateKnockoutRounds(rounds)
}

export function getKnockoutWinner(match: Match): Team | null {
  if (!match.result) return null
  if (match.result.scoreA > match.result.scoreB) return match.teamA
  if (match.result.scoreB > match.result.scoreA) return match.teamB
  return null // draw — shouldn't happen in KO
}

export function updateKnockoutRounds(rounds: KnockoutRound[]): KnockoutRound[] {
  const updated = rounds.map(r => ({
    ...r,
    matches: r.matches.map(m => ({ ...m })),
  }))

  for (let r = 0; r < updated.length - 1; r++) {
    const current = updated[r]
    const next = updated[r + 1]
    current.matches.forEach((match, i) => {
      const winner = getKnockoutWinner(match)
      const nextMatchIdx = Math.floor(i / 2)
      const nextMatch = next.matches[nextMatchIdx]
      if (!nextMatch) return
      const oldTeam = i % 2 === 0 ? nextMatch.teamA : nextMatch.teamB
      if (i % 2 === 0) {
        nextMatch.teamA = winner
      } else {
        nextMatch.teamB = winner
      }
      // Only reset result if the team in this slot actually changed
      if (winner?.id !== oldTeam?.id) {
        nextMatch.result = null
      }
    })
  }

  return updated
}

export function createTournament(
  players: Player[],
  config: TournamentConfig
): Tournament {
  const teams = buildTeams(players, config.mode)

  if (config.format === 'ko-only') {
    // Seed by skill: 1 vs last, 2 vs second-last, etc.
    const seeded = [...teams].sort((a, b) => teamSkill(b) - teamSkill(a))
    const knockoutRounds = buildKnockoutRounds(seeded)
    return {
      config,
      players,
      teams,
      groups: [],
      knockoutRounds,
      phase: 'knockout',
    }
  }

  const groups = buildGroups(teams, config.numGroups)
  return {
    config,
    players,
    teams,
    groups,
    knockoutRounds: [],
    phase: 'groups',
  }
}

export function advanceToKnockout(tournament: Tournament): Tournament {
  const { config, groups } = tournament
  const qualifiers: Team[] = []

  groups.forEach(g => {
    const standings = computeGroupStandings(g)
    standings.slice(0, config.advanceFromGroup).forEach(s => qualifiers.push(s.team))
  })

  const knockoutRounds = buildKnockoutRounds(qualifiers)
  return {
    ...tournament,
    knockoutRounds,
    phase: 'knockout',
  }
}

export function isGroupPhaseComplete(groups: Group[]): boolean {
  return groups.every(g => g.matches.every(m => m.result !== null))
}

export function isKnockoutComplete(rounds: KnockoutRound[]): boolean {
  if (rounds.length === 0) return false
  const last = rounds[rounds.length - 1]
  return last.matches.every(m => m.result !== null)
}

export function getTournamentChampion(rounds: KnockoutRound[]): Team | null {
  if (rounds.length === 0) return null
  const final = rounds[rounds.length - 1]
  if (final.matches.length !== 1) return null
  return getKnockoutWinner(final.matches[0])
}

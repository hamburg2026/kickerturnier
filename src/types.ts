export type Player = {
  id: string
  name: string
}

export type Team = {
  id: string
  name: string
  players: Player[]
}

export type MatchResult = {
  scoreA: number
  scoreB: number
}

export type Match = {
  id: string
  teamA: Team | null
  teamB: Team | null
  result: MatchResult | null
  groupId?: string
  round?: number
  position?: number
}

export type GroupStanding = {
  team: Team
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export type Group = {
  id: string
  name: string
  teams: Team[]
  matches: Match[]
}

export type KnockoutRound = {
  name: string
  roundIndex: number
  matches: Match[]
}

export type TournamentConfig = {
  mode: 'team' | 'individual'
  format: 'groups+ko' | 'ko-only'
  numGroups: number
  advanceFromGroup: number
}

export type TournamentPhase = 'setup' | 'groups' | 'knockout' | 'finished'

export type Tournament = {
  config: TournamentConfig
  players: Player[]
  teams: Team[]
  groups: Group[]
  knockoutRounds: KnockoutRound[]
  phase: TournamentPhase
}

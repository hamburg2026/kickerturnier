import type { Team } from '../types'

export default function ChampionBanner({ champion }: { champion: Team }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-950/60 to-gray-900 p-10 text-center">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.12),transparent_70%)]" />

      {/* Trophy */}
      <div className="relative text-7xl mb-5 select-none" style={{ filter: 'drop-shadow(0 0 24px rgba(251,191,36,0.5))' }}>
        🏆
      </div>

      {/* Labels */}
      <p className="relative text-xs tracking-[0.35em] text-amber-400/60 uppercase font-semibold mb-3">
        Champions
      </p>
      <p className="relative text-sm text-amber-300/50 mb-6 tracking-wide">
        ponturo Kicker-Turnier 2026
      </p>

      {/* Divider */}
      <div className="relative flex items-center gap-3 mb-6 px-8">
        <div className="flex-1 h-px bg-amber-500/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
        <div className="flex-1 h-px bg-amber-500/20" />
      </div>

      {/* Player names */}
      <div className="relative space-y-2">
        {champion.players.map(p => (
          <p
            key={p.id}
            className="text-2xl font-bold text-amber-200 tracking-wide"
            style={{ textShadow: '0 0 30px rgba(251,191,36,0.3)' }}
          >
            {p.name}
          </p>
        ))}
      </div>
    </div>
  )
}

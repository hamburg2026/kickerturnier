import type { Tournament } from '../types'

type Props = {
  tournament: Tournament | null
  onSave: () => void
  onReset: () => void
  onLoadFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  loadRef: React.RefObject<HTMLInputElement | null>
}

const phaseLabel: Record<string, string> = {
  groups: 'Gruppenphase',
  knockout: 'KO-Runde',
  finished: 'Abgeschlossen',
}

export default function GlobalHeader({ tournament, onSave, onReset, onLoadFile, loadRef }: Props) {
  const phase = tournament?.phase
  const progress = (() => {
    if (!tournament) return null
    if (phase === 'groups') {
      const total = tournament.groups.reduce((s, g) => s + g.matches.length, 0)
      const played = tournament.groups.reduce((s, g) => s + g.matches.filter(m => m.result).length, 0)
      return `${played} / ${total}`
    }
    if (phase === 'knockout' || phase === 'finished') {
      const total = tournament.knockoutRounds.reduce((s, r) => s + r.matches.filter(m => m.teamA && m.teamB).length, 0)
      const played = tournament.knockoutRounds.reduce((s, r) => s + r.matches.filter(m => m.result).length, 0)
      return `${played} / ${total}`
    }
    return null
  })()

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 h-14 flex items-center px-4 gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mr-2">
        <img src="/kickerturnier/logo.png" alt="ponturo" className="h-7 w-auto opacity-90" />
        <span className="text-gray-500 text-xs">|</span>
        <span className="font-semibold text-white text-sm tracking-wide">Kickerturnier</span>
      </div>

      {/* Phase + Progress */}
      {tournament && phase && phase !== 'setup' && (
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300 font-medium">
            {phaseLabel[phase] ?? phase}
          </span>
          {progress && (
            <span className="text-xs text-gray-500 font-mono">{progress} Spiele</span>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {tournament ? (
          <>
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium transition-colors"
              title="Turnier als Datei sichern"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Speichern
            </button>
            <button
              onClick={onReset}
              className="px-3 py-1.5 border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-gray-200 rounded text-xs transition-colors"
            >
              Neu starten
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => loadRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-600 hover:border-sky-500 text-gray-400 hover:text-sky-400 rounded text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Turnier laden
            </button>
          </>
        )}
        <input ref={loadRef} type="file" accept=".json" className="hidden" onChange={onLoadFile} />
      </div>
    </header>
  )
}

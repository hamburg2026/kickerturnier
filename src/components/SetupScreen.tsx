import { useState, useRef } from 'react'
import { parsePlayers } from '../tournament'
import type { TournamentConfig, Player } from '../types'

type Props = {
  onStart: (players: Player[], config: TournamentConfig) => void
  loadError: string
}

export default function SetupScreen({ onStart, loadError }: Props) {
  const [playerText, setPlayerText] = useState('')
  const [mode, setMode] = useState<'team' | 'individual'>('team')
  const [format, setFormat] = useState<'groups+ko' | 'ko-only'>('groups+ko')
  const [numGroups, setNumGroups] = useState(2)
  const [advanceFromGroup, setAdvanceFromGroup] = useState(2)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const players = parsePlayers(playerText)
  const minPlayers = mode === 'team' ? 4 : 2

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPlayerText(ev.target?.result as string)
    reader.readAsText(file)
  }

  function handleStart() {
    setError('')
    if (players.length < minPlayers) {
      setError(`Mindestens ${minPlayers} Spieler benötigt.`)
      return
    }
    const teamCount = mode === 'team' ? Math.floor(players.length / 2) : players.length
    if (format === 'groups+ko') {
      if (numGroups < 2) { setError('Mindestens 2 Gruppen.'); return }
      if (teamCount < numGroups * 2) {
        setError(`Zu wenige Teams für ${numGroups} Gruppen (mind. ${numGroups * 2} benötigt).`)
        return
      }
      const maxAdvance = Math.floor(teamCount / numGroups)
      if (advanceFromGroup < 1 || advanceFromGroup > maxAdvance) {
        setError(`Aufstieg pro Gruppe: 1 – ${maxAdvance}.`)
        return
      }
    }
    onStart(players, { mode, format, numGroups, advanceFromGroup })
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-3">

        {(loadError || error) && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
            {loadError || error}
          </div>
        )}

        {/* Spieler */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Spieler</h2>
            {players.length > 0 && (
              <span className="text-xs text-emerald-400 font-medium">{players.length} erkannt</span>
            )}
          </div>
          <textarea
            className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
            placeholder={"Max Mustermann\nAnna Schmidt\nTom Meyer\nLisa Müller"}
            value={playerText}
            onChange={e => setPlayerText(e.target.value)}
          />
          <button
            className="text-xs text-gray-500 hover:text-sky-400 transition-colors flex items-center gap-1"
            onClick={() => fileRef.current?.click()}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
            </svg>
            CSV / TXT Datei laden
          </button>
          <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden" onChange={handleFile} />
        </div>

        {/* Modus */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-2">
          <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Modus</h2>
          <div className="grid grid-cols-2 gap-2">
            {(['team', 'individual'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  mode === m
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-gray-700 hover:border-gray-500 text-gray-400'
                }`}
              >
                <div className="font-medium text-sm">{m === 'team' ? 'Team-Modus' : 'Einzel-Modus'}</div>
                <div className="text-xs mt-0.5 opacity-70">
                  {m === 'team' ? '2er-Teams, zufällig gelost' : '1 gegen 1'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-2">
          <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Format</h2>
          <div className="grid grid-cols-2 gap-2">
            {(['groups+ko', 'ko-only'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  format === f
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-gray-700 hover:border-gray-500 text-gray-400'
                }`}
              >
                <div className="font-medium text-sm">
                  {f === 'groups+ko' ? 'Gruppenphase + KO' : 'Nur KO-Runden'}
                </div>
                <div className="text-xs mt-0.5 opacity-70">
                  {f === 'groups+ko' ? 'Vorrunde, dann Turnierbaum' : 'Direktes KO-System'}
                </div>
              </button>
            ))}
          </div>

          {format === 'groups+ko' && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700 mt-3">
              <label className="space-y-1.5">
                <span className="text-xs text-gray-500">Anzahl Gruppen</span>
                <input
                  type="number" min={2} max={8} value={numGroups}
                  onChange={e => setNumGroups(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-gray-500">Aufsteiger / Gruppe</span>
                <input
                  type="number" min={1} max={8} value={advanceFromGroup}
                  onChange={e => setAdvanceFromGroup(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </label>
            </div>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={players.length < minPlayers}
          className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-semibold text-sm tracking-wide transition-colors"
        >
          Turnier starten
        </button>
      </div>
    </div>
  )
}

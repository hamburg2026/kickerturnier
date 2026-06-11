import { useState, useRef } from 'react'
import { parsePlayers } from '../tournament'
import type { TournamentConfig, Player } from '../types'

type Props = {
  onStart: (players: Player[], config: TournamentConfig) => void
}

export default function SetupScreen({ onStart }: Props) {
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
      setError(`Mindestens ${minPlayers} Spieler/Teams benötigt.`)
      return
    }
    const teamCount = mode === 'team' ? Math.floor(players.length / 2) : players.length
    if (format === 'groups+ko') {
      if (numGroups < 2) { setError('Mindestens 2 Gruppen.'); return }
      if (teamCount < numGroups * 2) {
        setError(`Zu wenige Teams für ${numGroups} Gruppen. Mindestens ${numGroups * 2} benötigt.`)
        return
      }
      const maxAdvance = Math.floor(teamCount / numGroups)
      if (advanceFromGroup < 1 || advanceFromGroup > maxAdvance) {
        setError(`Aufstieg pro Gruppe muss zwischen 1 und ${maxAdvance} liegen.`)
        return
      }
    }
    onStart(players, { mode, format, numGroups, advanceFromGroup })
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-3">⚽</div>
          <h1 className="text-4xl font-bold text-white mb-1">Kickerturnier</h1>
          <p className="text-slate-400">Turnier-Manager</p>
        </div>

        {/* Player Input */}
        <div className="bg-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">Spieler</h2>
          <p className="text-sm text-slate-400">
            Namen eingeben (einer pro Zeile) oder CSV/TXT hochladen
          </p>
          <textarea
            className="w-full h-36 bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500"
            placeholder={"Max Mustermann\nAnna Schmidt\nTom Meyer\nLisa Müller"}
            value={playerText}
            onChange={e => setPlayerText(e.target.value)}
          />
          <div className="flex gap-3 items-center">
            <button
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              Datei laden
            </button>
            <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden" onChange={handleFile} />
            {players.length > 0 && (
              <span className="text-sm text-green-400">{players.length} Spieler erkannt</span>
            )}
          </div>
        </div>

        {/* Mode */}
        <div className="bg-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">Modus</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['team', 'individual'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  mode === m
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-1">{m === 'team' ? '👥' : '🧑'}</div>
                <div className="font-medium">{m === 'team' ? 'Team-Modus' : 'Einzel-Modus'}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {m === 'team' ? '2er Teams, zufällig gelost' : '1 gegen 1'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="bg-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">Format</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['groups+ko', 'ko-only'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  format === f
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-1">{f === 'groups+ko' ? '🏆' : '⚡'}</div>
                <div className="font-medium">{f === 'groups+ko' ? 'Gruppenphase + KO' : 'Nur KO-Runden'}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {f === 'groups+ko' ? 'Vorrundengruppen + Turnierbaum' : 'Direkt Turnierbaum'}
                </div>
              </button>
            ))}
          </div>

          {format === 'groups+ko' && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="space-y-1">
                <span className="text-sm text-slate-300">Anzahl Gruppen</span>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={numGroups}
                  onChange={e => setNumGroups(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-slate-300">Aufsteiger pro Gruppe</span>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={advanceFromGroup}
                  onChange={e => setAdvanceFromGroup(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </label>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500 rounded-xl p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={players.length < minPlayers}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-2xl font-semibold text-lg transition-colors"
        >
          Turnier starten
        </button>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { parsePlayers } from '../tournament'
import type { TournamentConfig, Player } from '../types'

type Props = {
  onStart: (players: Player[], config: TournamentConfig) => void
  onLoadFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  loadRef: React.RefObject<HTMLInputElement | null>
  loadError: string
}

export default function SetupScreen({ onStart, onLoadFile, loadRef, loadError }: Props) {
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-px">

        {/* Header */}
        <div className="flex items-end justify-between pb-6">
          <div>
            <p className="text-xs tracking-[0.25em] text-zinc-500 uppercase mb-1">Tischfußball</p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Kickerturnier</h1>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-xs text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 rounded transition-colors"
              onClick={() => loadRef.current?.click()}
            >
              Turnier laden
            </button>
            <input ref={loadRef} type="file" accept=".json" className="hidden" onChange={onLoadFile} />
          </div>
        </div>

        {loadError && (
          <div className="bg-red-950/50 border border-red-800 rounded p-3 text-red-400 text-xs mb-4">
            {loadError}
          </div>
        )}

        {/* Spieler */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium tracking-widest text-zinc-500 uppercase">Spieler</label>
            {players.length > 0 && (
              <span className="text-xs text-zinc-400">{players.length} erkannt</span>
            )}
          </div>
          <textarea
            className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-200 placeholder-zinc-700 resize-none focus:outline-none focus:border-zinc-600 font-mono"
            placeholder={"Max Mustermann\nAnna Schmidt\nTom Meyer\nLisa Müller"}
            value={playerText}
            onChange={e => setPlayerText(e.target.value)}
          />
          <button
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            + CSV / TXT hochladen
          </button>
          <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden" onChange={handleFile} />
        </section>

        {/* Modus */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
          <label className="text-xs font-medium tracking-widest text-zinc-500 uppercase block">Modus</label>
          <div className="space-y-2">
            {(['team', 'individual'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-all ${
                  mode === m
                    ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
                    : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${mode === m ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
                <div>
                  <div className="text-sm font-medium">{m === 'team' ? 'Team-Modus' : 'Einzel-Modus'}</div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    {m === 'team' ? '2er-Teams, zufällig ausgelost' : '1 gegen 1'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Format */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
          <label className="text-xs font-medium tracking-widest text-zinc-500 uppercase block">Format</label>
          <div className="space-y-2">
            {(['groups+ko', 'ko-only'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-all ${
                  format === f
                    ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
                    : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${format === f ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
                <div>
                  <div className="text-sm font-medium">
                    {f === 'groups+ko' ? 'Gruppenphase + KO-Runden' : 'Nur KO-Runden'}
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    {f === 'groups+ko' ? 'Vorrundengruppen, danach Turnierbaum' : 'Direktes KO-System'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {format === 'groups+ko' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="space-y-1.5">
                <span className="text-xs text-zinc-500">Anzahl Gruppen</span>
                <input
                  type="number" min={2} max={8} value={numGroups}
                  onChange={e => setNumGroups(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-zinc-500">Aufsteiger / Gruppe</span>
                <input
                  type="number" min={1} max={8} value={advanceFromGroup}
                  onChange={e => setAdvanceFromGroup(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </label>
            </div>
          )}
        </section>

        {error && (
          <div className="bg-red-950/50 border border-red-800 rounded p-3 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handleStart}
            disabled={players.length < minPlayers}
            className="w-full py-3 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-900 rounded font-semibold text-sm tracking-wide transition-colors"
          >
            Turnier starten
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import type { TournamentConfig, Player } from '../types'

type Props = {
  onStart: (players: Player[], config: TournamentConfig) => void
  loadError: string
}

function uid() { return Math.random().toString(36).slice(2, 10) }

function SkillBar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 15 }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`w-3 h-3 rounded-sm transition-colors ${
            i < value
              ? i < 5 ? 'bg-sky-600' : i < 10 ? 'bg-sky-400' : 'bg-emerald-400'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={`Skill: ${i + 1}`}
        />
      ))}
      <span className="text-xs text-gray-500 font-mono ml-1 w-4">{value}</span>
    </div>
  )
}

function parseExcelOrCsv(data: ArrayBuffer): Player[] {
  const wb = XLSX.read(data, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

  return rows
    .map(row => {
      // Case-insensitive column matching
      const keys = Object.keys(row)
      const nameKey = keys.find(k => /^name|spieler|namen$/i.test(k))
      const skillKey = keys.find(k => /^skill|stufe|level|stärke|staerke|rating|wertung$/i.test(k))

      const name = nameKey ? String(row[nameKey]).trim() : ''
      const skill = skillKey ? Math.min(15, Math.max(1, parseInt(String(row[skillKey])) || 8)) : 8

      return name ? { id: uid(), name, skill } : null
    })
    .filter((p): p is Player => p !== null)
}

export default function SetupScreen({ onStart, loadError }: Props) {
  const [players, setPlayers] = useState<Player[]>([])
  const [mode, setMode] = useState<'team' | 'individual'>('team')
  const [format, setFormat] = useState<'groups+ko' | 'ko-only'>('groups+ko')
  const [numGroups, setNumGroups] = useState(2)
  const [advanceFromGroup, setAdvanceFromGroup] = useState(2)
  const [error, setError] = useState('')
  const [parseError, setParseError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const minPlayers = mode === 'team' ? 4 : 2

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setParseError('')

    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = parseExcelOrCsv(ev.target!.result as ArrayBuffer)
        if (parsed.length === 0) {
          setParseError('Keine Spieler gefunden. Bitte Spalten "Name" und "Skillstufe" prüfen.')
          return
        }
        setPlayers(parsed)
      } catch {
        setParseError('Datei konnte nicht gelesen werden.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function updateSkill(id: string, skill: number) {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, skill } : p))
  }

  function removePlayer(id: string) {
    setPlayers(prev => prev.filter(p => p.id !== id))
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

  const avgSkill = players.length
    ? (players.reduce((s, p) => s + p.skill, 0) / players.length).toFixed(1)
    : null

  return (
    <div className="flex-1 flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-xl space-y-3">

        {(loadError || error) && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
            {loadError || error}
          </div>
        )}

        {/* Excel Upload */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Spieler</h2>
            {players.length > 0 && (
              <span className="text-xs text-gray-500">
                {players.length} Spieler · Ø Skill {avgSkill}
              </span>
            )}
          </div>

          {/* Upload area */}
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-600 hover:border-sky-500 rounded-lg p-6 text-center transition-colors group"
          >
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm text-gray-300 group-hover:text-sky-400 transition-colors font-medium">
              Excel-Datei hochladen
            </p>
            <p className="text-xs text-gray-600 mt-1">
              .xlsx oder .xls · Spalten: <span className="font-mono text-gray-500">Name</span> und <span className="font-mono text-gray-500">Skillstufe</span> (1–15)
            </p>
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />

          {parseError && (
            <p className="text-xs text-red-400 bg-red-900/30 border border-red-800 rounded p-2">{parseError}</p>
          )}

          {/* Player list */}
          {players.length > 0 && (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              <div className="flex items-center text-xs text-gray-600 px-2 pb-1 border-b border-gray-700">
                <span className="flex-1">Name</span>
                <span className="w-56">Skillstufe</span>
                <span className="w-4" />
              </div>
              {[...players].sort((a, b) => b.skill - a.skill).map(p => (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700/50 group">
                  <span className="flex-1 text-sm text-gray-200 truncate">{p.name}</span>
                  <SkillBar value={p.skill} onChange={v => updateSkill(p.id, v)} />
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs ml-1"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
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
                  mode === m ? 'border-sky-500 bg-sky-500/10 text-white' : 'border-gray-700 hover:border-gray-500 text-gray-400'
                }`}
              >
                <div className="font-medium text-sm">{m === 'team' ? 'Team-Modus' : 'Einzel-Modus'}</div>
                <div className="text-xs mt-0.5 opacity-70">
                  {m === 'team' ? '2er-Teams, Skill-balanciert' : '1 gegen 1, nach Skill gesetzt'}
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
                  format === f ? 'border-sky-500 bg-sky-500/10 text-white' : 'border-gray-700 hover:border-gray-500 text-gray-400'
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

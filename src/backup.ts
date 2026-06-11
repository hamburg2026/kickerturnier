import type { Tournament } from './types'

export function saveTournament(tournament: Tournament): void {
  const data = JSON.stringify(tournament, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')
  a.href = url
  a.download = `kickerturnier_${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function loadTournament(file: File): Promise<Tournament> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!data.config || !data.players || !data.phase) {
          reject(new Error('Ungültige Turnier-Datei'))
          return
        }
        resolve(data as Tournament)
      } catch {
        reject(new Error('Datei konnte nicht gelesen werden'))
      }
    }
    reader.onerror = () => reject(new Error('Datei konnte nicht geöffnet werden'))
    reader.readAsText(file)
  })
}

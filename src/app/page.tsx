'use client'

import { useState } from 'react'

type TipoBusqueda = 'telefono' | 'nombre_telcel' | 'curp' | 'nombre_ines' | 'cruce'

const TIPOS = [
  { value: 'telefono',      label: '📱 Teléfono',        placeholder: 'Ej: 6121004768' },
  { value: 'nombre_telcel', label: '👤 Nombre (Telcel)', placeholder: 'Ej: GARCIA LOPEZ' },
  { value: 'curp',          label: '🪪 CURP (INES)',     placeholder: 'Ej: GALB580627MSRRPL04' },
  { value: 'nombre_ines',   label: '📋 Nombre (INES)',   placeholder: 'Ej: GARCIA' },
  { value: 'cruce',         label: '🔗 Cruce Tel+INES',  placeholder: 'CURP para cruzar' },
]

export default function Home() {
  const [tipo, setTipo] = useState<TipoBusqueda>('telefono')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Record<string, string>[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setCount(null)

    try {
      const res = await fetch(`/api/buscar?tipo=${tipo}&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error desconocido')
      } else {
        setResults(data.results)
        setCount(data.count)
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const tipoActual = TIPOS.find(t => t.value === tipo)
  const columnas = results.length > 0 ? Object.keys(results[0]) : []

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-blue-400">Buexar</span> — Buscador de Datos
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Telcel: 31.4M registros · INES (BCN+BCS): 6.5M registros
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {TIPOS.map(t => (
            <button
              key={t.value}
              onClick={() => { setTipo(t.value as TipoBusqueda); setResults([]); setCount(null) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tipo === t.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={buscar} className="flex gap-3 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={tipoActual?.placeholder}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </form>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {count !== null && (
          <p className="text-gray-400 text-sm mb-4">
            {count === 0
              ? 'Sin resultados'
              : `${count} resultado${count !== 1 ? 's' : ''}${count === 50 ? ' (mostrando primeros 50)' : ''}`}
          </p>
        )}

        {results.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-300">
                  {columnas.map(col => (
                    <th key={col} className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-xs">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-t border-gray-800 hover:bg-gray-800/50 transition-colors ${
                      i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'
                    }`}
                  >
                    {columnas.map(col => (
                      <td key={col} className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {row[col] ?? <span className="text-gray-600">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

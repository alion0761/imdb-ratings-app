import { useEffect, useState } from 'react'
import { searchMulti } from '../api'
import MovieGrid from '../components/MovieGrid'
import useDebounce from '../hooks/useDebounce'
import './SearchPage.css'

export default function SearchPage({ query, onCardClick }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounced = useDebounce(query, 400)

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    searchMulti(debounced)
      .then(data => {
        // Filter to only movies and tv shows
        const filtered = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv')
        setResults(filtered)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [debounced])

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h1 className="search-page-title">
          {debounced ? `"${debounced}" için sonuçlar` : '🔍 Arama'}
        </h1>
        {results.length > 0 && (
          <p className="search-count">{results.length} sonuç bulundu</p>
        )}
      </div>

      {!debounced && (
        <div className="search-empty-state">
          <span className="search-empty-icon">🔍</span>
          <p>Aramak istediğiniz film veya diziyi yazın...</p>
        </div>
      )}

      <MovieGrid
        items={results}
        type={null}
        loading={loading}
        onCardClick={onCardClick}
        emptyText={searched && !loading ? 'Sonuç bulunamadı. Farklı bir arama terimi deneyin.' : ''}
      />
    </div>
  )
}
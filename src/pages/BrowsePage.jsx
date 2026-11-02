import { useEffect, useState, useCallback } from 'react'
import { discoverMovies, discoverTV, fetchMovieGenres, fetchTVGenres } from '../api'
import MovieGrid from '../components/MovieGrid'
import './BrowsePage.css'

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: '🔥 Popülerlik' },
  { value: 'vote_average.desc', label: '⭐ En Yüksek Puan' },
  { value: 'release_date.desc', label: '🆕 En Yeni' },
  { value: 'revenue.desc', label: '💰 Hasılat' },
]

const TV_SORT_OPTIONS = [
  { value: 'popularity.desc', label: '🔥 Popülerlik' },
  { value: 'vote_average.desc', label: '⭐ En Yüksek Puan' },
  { value: 'first_air_date.desc', label: '🆕 En Yeni' },
]

export default function BrowsePage({ mediaType = 'movie', onCardClick }) {
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  // Load genres
  useEffect(() => {
    const fetcher = mediaType === 'movie' ? fetchMovieGenres : fetchTVGenres
    fetcher().then(setGenres).catch(console.error)
    setSelectedGenre('')
    setSortBy('popularity.desc')
    setPage(1)
  }, [mediaType])

  // Fetch items
  const fetchItems = useCallback((pg = 1) => {
    setLoading(true)
    const fetcher = mediaType === 'movie' ? discoverMovies : discoverTV
    fetcher({
      genreId: selectedGenre || undefined,
      sortBy,
      page: pg,
    }).then(data => {
      if (pg === 1) {
        setItems(data.results)
      } else {
        setItems(prev => [...prev, ...data.results])
      }
      setTotalPages(data.total_pages)
    }).catch(console.error).finally(() => setLoading(false))
  }, [mediaType, selectedGenre, sortBy])

  useEffect(() => {
    setPage(1)
    fetchItems(1)
  }, [fetchItems])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchItems(next)
  }

  const sortOptions = mediaType === 'movie' ? SORT_OPTIONS : TV_SORT_OPTIONS

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1 className="browse-title">
          {mediaType === 'movie' ? '🎥 Filmler' : '📺 Diziler'}
        </h1>

        <div className="browse-filters">
          <div className="filter-group">
            <label className="filter-label">Tür</label>
            <select
              className="filter-select"
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
            >
              <option value="">Tümü</option>
              {genres.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sırala</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="browse-content">
        <MovieGrid
          items={items}
          type={mediaType}
          loading={loading && page === 1}
          onCardClick={onCardClick}
        />

        {loading && page > 1 && (
          <div className="load-more-spinner">
            <div className="spinner" />
          </div>
        )}

        {!loading && items.length > 0 && page < Math.min(totalPages, 10) && (
          <div className="load-more-wrap">
            <button className="load-more-btn" onClick={loadMore}>
              Daha Fazla Yükle
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
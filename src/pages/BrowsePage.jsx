import { useEffect, useState, useCallback } from 'react'
import { discoverMovies, discoverTV, fetchMovieGenres, fetchTVGenres } from '../api'
import MovieGrid from '../components/MovieGrid'
import './BrowsePage.css'

const SORT_OPTIONS = [
  { value: 'popularity.desc',   label: '🔥 En Popüler' },
  { value: 'vote_average.desc', label: '⭐ En Yüksek Puan' },
  { value: 'vote_average.asc',  label: '📉 En Düşük Puan' },
  { value: 'release_date.desc', label: '🆕 En Yeni' },
  { value: 'release_date.asc',  label: '📅 En Eski' },
  { value: 'revenue.desc',      label: '💰 En Yüksek Hasılat' },
  { value: 'vote_count.desc',   label: '🗳 En Çok Oylanan' },
]
const TV_SORT_OPTIONS = [
  { value: 'popularity.desc',     label: '🔥 En Popüler' },
  { value: 'vote_average.desc',   label: '⭐ En Yüksek Puan' },
  { value: 'vote_average.asc',    label: '📉 En Düşük Puan' },
  { value: 'first_air_date.desc', label: '🆕 En Yeni' },
  { value: 'first_air_date.asc',  label: '📅 En Eski' },
  { value: 'vote_count.desc',     label: '🗳 En Çok Oylanan' },
]
const SCORE_OPTIONS = [
  { value: '',    label: 'Tüm Puanlar' },
  { value: '9',   label: '⭐ 9+ Mükemmel' },
  { value: '8',   label: '⭐ 8+ Harika' },
  { value: '7.5', label: '⭐ 7.5+ Çok İyi' },
  { value: '7',   label: '⭐ 7+ İyi' },
  { value: '6',   label: '⭐ 6+ Orta' },
]
const YEAR_PRESETS = [
  { value: '',        label: 'Tüm Yıllar' },
  { value: '2024',    label: '2024' },
  { value: '2023',    label: '2023' },
  { value: '2022',    label: '2022' },
  { value: '2021',    label: '2021' },
  { value: '2020',    label: '2020' },
  { value: '2010s',   label: "2010'lar (2010–2019)" },
  { value: '2000s',   label: "2000'ler (2000–2009)" },
  { value: '1990s',   label: "90'lar (1990–1999)" },
  { value: '1980s',   label: "80'ler (1980–1989)" },
  { value: 'classic', label: 'Klasikler (1980 öncesi)' },
]
const LANGUAGE_OPTIONS = [
  { value: '', label: 'Tüm Diller' },
  { value: 'tr', label: '🇹🇷 Türkçe' },
  { value: 'en', label: '🇺🇸 İngilizce' },
  { value: 'ko', label: '🇰🇷 Korece' },
  { value: 'ja', label: '🇯🇵 Japonca' },
  { value: 'fr', label: '🇫🇷 Fransızca' },
  { value: 'de', label: '🇩🇪 Almanca' },
  { value: 'es', label: '🇪🇸 İspanyolca' },
  { value: 'it', label: '🇮🇹 İtalyanca' },
  { value: 'hi', label: '🇮🇳 Hintçe' },
  { value: 'zh', label: '🇨🇳 Çince' },
  { value: 'ar', label: '🇸🇦 Arapça' },
]

function yearPresetToRange(preset) {
  if (!preset) return {}
  if (preset === '2010s')   return { yearFrom: 2010, yearTo: 2019 }
  if (preset === '2000s')   return { yearFrom: 2000, yearTo: 2009 }
  if (preset === '1990s')   return { yearFrom: 1990, yearTo: 1999 }
  if (preset === '1980s')   return { yearFrom: 1980, yearTo: 1989 }
  if (preset === 'classic') return { yearFrom: 1900, yearTo: 1979 }
  const y = parseInt(preset)
  return { yearFrom: y, yearTo: y }
}

const DEFAULT_FILTERS = { genre: '', sort: 'popularity.desc', score: '', year: '', language: '' }

export default function BrowsePage({ mediaType = 'movie', onCardClick }) {
  const [genres, setGenres] = useState([])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [panelOpen, setPanelOpen] = useState(false)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetcher = mediaType === 'movie' ? fetchMovieGenres : fetchTVGenres
    fetcher().then(setGenres).catch(console.error)
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [mediaType])

  const fetchItems = useCallback((pg = 1) => {
    setLoading(true)
    const fetcher = mediaType === 'movie' ? discoverMovies : discoverTV
    const { yearFrom, yearTo } = yearPresetToRange(filters.year)
    fetcher({
      genreId:  filters.genre    || undefined,
      sortBy:   filters.sort,
      minScore: filters.score    || undefined,
      language: filters.language || undefined,
      yearFrom, yearTo, page: pg,
    }).then(data => {
      setItems(pg === 1 ? data.results : prev => [...prev, ...data.results])
      setTotalPages(data.total_pages)
      setTotalResults(data.total_results)
    }).catch(console.error).finally(() => setLoading(false))
  }, [mediaType, filters])

  useEffect(() => { setPage(1); fetchItems(1) }, [fetchItems])
  function loadMore() { const n = page + 1; setPage(n); fetchItems(n) }
  function setFilter(key, val) { setFilters(prev => ({ ...prev, [key]: val })) }
  function resetFilters() { setFilters(DEFAULT_FILTERS) }

  const activeCount = Object.entries(filters).filter(([k, v]) => k !== 'sort' && v !== '').length
  const sortOptions = mediaType === 'movie' ? SORT_OPTIONS : TV_SORT_OPTIONS

  return (
    <div className="browse-page">
      <div className="browse-header">
        <div className="browse-title-row">
          <h1 className="browse-title">{mediaType === 'movie' ? '🎥 Filmler' : '📺 Diziler'}</h1>
          {totalResults > 0 && !loading && (
            <span className="browse-result-count">{totalResults.toLocaleString('tr-TR')} sonuç</span>
          )}
          <button
            className={`filter-toggle-btn ${panelOpen ? 'open' : ''} ${activeCount > 0 ? 'has-active' : ''}`}
            onClick={() => setPanelOpen(v => !v)}
          >
            <span>🎛 Filtrele</span>
            {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
            <span className="filter-toggle-arrow">{panelOpen ? '▲' : '▼'}</span>
          </button>
        </div>

        {activeCount > 0 && (
          <div className="active-filters">
            {filters.genre && (
              <span className="filter-tag">🎭 {genres.find(g => String(g.id) === filters.genre)?.name}<button onClick={() => setFilter('genre', '')}>✕</button></span>
            )}
            {filters.score && (
              <span className="filter-tag">⭐ {filters.score}+<button onClick={() => setFilter('score', '')}>✕</button></span>
            )}
            {filters.year && (
              <span className="filter-tag">📅 {YEAR_PRESETS.find(y => y.value === filters.year)?.label}<button onClick={() => setFilter('year', '')}>✕</button></span>
            )}
            {filters.language && (
              <span className="filter-tag">🌍 {LANGUAGE_OPTIONS.find(l => l.value === filters.language)?.label}<button onClick={() => setFilter('language', '')}>✕</button></span>
            )}
            <button className="filter-reset-btn" onClick={resetFilters}>✕ Sıfırla</button>
          </div>
        )}

        {panelOpen && (
          <div className="filter-panel">
            <div className="filter-panel-grid">
              <div className="filter-group">
                <label className="filter-label">🎭 Konu / Tür</label>
                <select className="filter-select" value={filters.genre} onChange={e => setFilter('genre', e.target.value)}>
                  <option value="">Tüm Türler</option>
                  {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">⭐ Minimum Puan</label>
                <select className="filter-select" value={filters.score} onChange={e => setFilter('score', e.target.value)}>
                  {SCORE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">📅 Yıl / Dönem</label>
                <select className="filter-select" value={filters.year} onChange={e => setFilter('year', e.target.value)}>
                  {YEAR_PRESETS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">🌍 Orijinal Dil</label>
                <select className="filter-select" value={filters.language} onChange={e => setFilter('language', e.target.value)}>
                  {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">🔀 Sıralama</label>
                <select className="filter-select" value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
                  {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="filter-group filter-group-reset">
                <label className="filter-label">↩ Sıfırla</label>
                <button className="filter-reset-full-btn" onClick={resetFilters}>Filtreleri Temizle</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="browse-content">
        <MovieGrid items={items} type={mediaType} loading={loading && page === 1}
          onCardClick={onCardClick}
          emptyText="Bu kriterlere uyan içerik bulunamadı. Filtreleri değiştirmeyi deneyin." />
        {loading && page > 1 && <div className="load-more-spinner"><div className="spinner" /></div>}
        {!loading && items.length > 0 && page < Math.min(totalPages, 15) && (
          <div className="load-more-wrap">
            <button className="load-more-btn" onClick={loadMore}>Daha Fazla Yükle</button>
          </div>
        )}
      </div>
    </div>
  )
}
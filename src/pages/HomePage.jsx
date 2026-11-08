import { useEffect, useState } from 'react'
import {
  fetchTrendingMovies, fetchTrendingTV,
  fetchTopRatedMovies, fetchTopRatedTV,
  fetchNowPlayingMovies, fetchOnAirTV,
  fetchRandomTopRatedMovie
} from '../api'
import MovieGrid from '../components/MovieGrid'
import { IMG_W500, PLACEHOLDER_IMG } from '../api'
import './HomePage.css'

function Section({ title, items, type, loading, onCardClick }) {
  return (
    <section className="home-section">
      <h2 className="section-title">{title}</h2>
      <MovieGrid items={items} type={type} loading={loading} onCardClick={onCardClick} />
    </section>
  )
}

export default function HomePage({ onCardClick }) {
  const [trendMovies, setTrendMovies] = useState([])
  const [trendTV, setTrendTV] = useState([])
  const [topMovies, setTopMovies] = useState([])
  const [topTV, setTopTV] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [onAir, setOnAir] = useState([])
  const [loading, setLoading] = useState(true)

  // 🎲 Rastgele film önerisi
  const [suggestion, setSuggestion] = useState(null)
  const [suggLoading, setSuggLoading] = useState(false)
  const [suggVisible, setSuggVisible] = useState(false)

  async function handleSuggest() {
    setSuggLoading(true)
    setSuggVisible(true)
    setSuggestion(null)
    try {
      const movie = await fetchRandomTopRatedMovie()
      setSuggestion(movie)
    } catch (e) {
      console.error(e)
    } finally {
      setSuggLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchTrendingMovies(),
      fetchTrendingTV(),
      fetchTopRatedMovies(),
      fetchTopRatedTV(),
      fetchNowPlayingMovies(),
      fetchOnAirTV(),
    ]).then(([tm, ttv, topm, toptv, np, oa]) => {
      setTrendMovies(tm.results.slice(0, 10))
      setTrendTV(ttv.results.slice(0, 10))
      setTopMovies(topm.results.slice(0, 10))
      setTopTV(toptv.results.slice(0, 10))
      setNowPlaying(np.results.slice(0, 10))
      setOnAir(oa.results.slice(0, 10))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="home-page">
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-title-wrap">
            <h1 className="hero-title">🎬 Film Seçme Asistanı</h1>
            <p className="hero-title-sub">Film & Dizi Keşfet</p>
          </div>
          <p className="hero-sub">En güncel film ve dizileri keşfedin, puanları karşılaştırın.</p>

          {/* 🎲 Bugün ne izlesem? */}
          <button className="suggest-btn" onClick={handleSuggest} disabled={suggLoading}>
            <span className="suggest-btn-icon">{suggLoading ? '⏳' : '🎲'}</span>
            <span>{suggLoading ? 'Seçiliyor...' : 'Bugün ne izlesem?'}</span>
          </button>

          {suggVisible && (
            <div className="suggest-card-wrap">
              {suggLoading && (
                <div className="suggest-loading">
                  <div className="suggest-spinner" />
                  <span>Harika bir film aranıyor...</span>
                </div>
              )}
              {!suggLoading && suggestion && (
                <div className="suggest-card" onClick={() => onCardClick(suggestion, 'movie')}>
                  <img
                    className="suggest-poster"
                    src={suggestion.poster_path ? `${IMG_W500}${suggestion.poster_path}` : PLACEHOLDER_IMG}
                    alt={suggestion.title}
                    onError={e => { e.target.src = PLACEHOLDER_IMG }}
                  />
                  <div className="suggest-info">
                    <div className="suggest-label">🎯 Bugünün Önerisi</div>
                    <h3 className="suggest-title">{suggestion.title}</h3>
                    {suggestion.release_date && (
                      <div className="suggest-year">{suggestion.release_date.slice(0, 4)}</div>
                    )}
                    <div className="suggest-score">
                      ⭐ <strong>{suggestion.vote_average?.toFixed(1)}</strong>
                      <span className="suggest-score-max">/10</span>
                    </div>
                    {suggestion.overview && (
                      <p className="suggest-overview">{suggestion.overview}</p>
                    )}
                    <div className="suggest-cta">Detayları Gör →</div>
                  </div>
                  <button className="suggest-close" onClick={e => { e.stopPropagation(); setSuggVisible(false); setSuggestion(null) }}>✕</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="home-content">
        <Section title="🔥 Bu Hafta Trend Filmler" items={trendMovies} type="movie" loading={loading} onCardClick={onCardClick} />
        <Section title="📺 Bu Hafta Trend Diziler" items={trendTV} type="tv" loading={loading} onCardClick={onCardClick} />
        <Section title="⭐ En Yüksek Puanlı Filmler" items={topMovies} type="movie" loading={loading} onCardClick={onCardClick} />
        <Section title="⭐ En Yüksek Puanlı Diziler" items={topTV} type="tv" loading={loading} onCardClick={onCardClick} />
        <Section title="🎭 Şu An Vizyonda" items={nowPlaying} type="movie" loading={loading} onCardClick={onCardClick} />
        <Section title="📡 Yayında Olan Diziler" items={onAir} type="tv" loading={loading} onCardClick={onCardClick} />
      </div>
    </div>
  )
}
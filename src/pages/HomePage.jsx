import { useEffect, useState } from 'react'
import {
  fetchTrendingMovies, fetchTrendingTV,
  fetchTopRatedMovies, fetchTopRatedTV,
  fetchNowPlayingMovies, fetchOnAirTV
} from '../api'
import MovieGrid from '../components/MovieGrid'
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
          <h1 className="hero-title">🎬 Devoloper by Tellioglu</h1>
          <p className="hero-sub">En güncel film ve dizileri keşfedin, puanları karşılaştırın.</p>
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
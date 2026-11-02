import { useEffect, useState } from 'react'
import { fetchTopRatedMovies, fetchTopRatedTV } from '../api'
import { IMG_W500, PLACEHOLDER_IMG } from '../api'
import './TopRatedPage.css'

function getRatingColor(score) {
  if (score >= 7.5) return '#4caf7d'
  if (score >= 6.0) return '#F5C518'
  if (score >= 4.0) return '#e07b3a'
  return '#e05c5c'
}

function RankItem({ rank, item, type, onClick }) {
  const title = item.title || item.name
  const date = item.release_date || item.first_air_date || ''
  const year = date ? date.slice(0, 4) : '—'
  const score = item.vote_average ? Math.round(item.vote_average * 10) / 10 : null
  const ratingColor = score ? getRatingColor(score) : '#666'
  const posterUrl = item.poster_path ? `${IMG_W500}${item.poster_path}` : PLACEHOLDER_IMG

  return (
    <div className="rank-item" onClick={() => onClick && onClick(item, type)}>
      <div className="rank-number">{rank}</div>
      <img className="rank-poster" src={posterUrl} alt={title}
        onError={e => { e.target.src = PLACEHOLDER_IMG }} />
      <div className="rank-info">
        <h3 className="rank-title">{title}</h3>
        <div className="rank-meta">
          <span className="rank-year">{year}</span>
          <span className="rank-type-badge">{type === 'movie' ? '🎥 Film' : '📺 Dizi'}</span>
          {item.vote_count > 0 && (
            <span className="rank-votes">{item.vote_count.toLocaleString('tr-TR')} oy</span>
          )}
        </div>
        {item.overview && (
          <p className="rank-overview">{item.overview}</p>
        )}
      </div>
      {score !== null && (
        <div className="rank-score" style={{ borderColor: ratingColor }}>
          <span className="rank-star">★</span>
          <span className="rank-val" style={{ color: ratingColor }}>{score.toFixed(1)}</span>
        </div>
      )}
    </div>
  )
}

export default function TopRatedPage({ onCardClick }) {
  const [movies, setMovies] = useState([])
  const [tvShows, setTvShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('movies')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchTopRatedMovies(1),
      fetchTopRatedMovies(2),
      fetchTopRatedTV(1),
      fetchTopRatedTV(2),
    ]).then(([m1, m2, tv1, tv2]) => {
      setMovies([...m1.results, ...m2.results].slice(0, 50))
      setTvShows([...tv1.results, ...tv2.results].slice(0, 50))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const list = activeTab === 'movies' ? movies : tvShows
  const type = activeTab === 'movies' ? 'movie' : 'tv'

  return (
    <div className="toprated-page">
      <div className="toprated-header">
        <h1 className="toprated-title">⭐ En İyi İçerikler</h1>
        <p className="toprated-sub">Tüm zamanların en yüksek puanlı film ve dizileri</p>

        <div className="toprated-tabs">
          <button
            className={`toprated-tab ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >🎥 Filmler</button>
          <button
            className={`toprated-tab ${activeTab === 'tv' ? 'active' : ''}`}
            onClick={() => setActiveTab('tv')}
          >📺 Diziler</button>
        </div>
      </div>

      <div className="toprated-list">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rank-skeleton shimmer" />
          ))
        ) : (
          list.map((item, idx) => (
            <RankItem
              key={item.id}
              rank={idx + 1}
              item={item}
              type={type}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  )
}
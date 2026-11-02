import { IMG_W500, PLACEHOLDER_IMG } from '../api'
import './MovieCard.css'

function getRatingColor(score) {
  if (score >= 7.5) return '#4caf7d'
  if (score >= 6.0) return '#F5C518'
  if (score >= 4.0) return '#e07b3a'
  return '#e05c5c'
}

function getRatingLabel(score) {
  if (score >= 8.0) return 'Mükemmel'
  if (score >= 7.0) return 'Çok İyi'
  if (score >= 6.0) return 'İyi'
  if (score >= 5.0) return 'Orta'
  return 'Zayıf'
}

export default function MovieCard({ item, type = 'movie', onClick }) {
  const title = item.title || item.name || 'Bilinmiyor'
  const date = item.release_date || item.first_air_date || ''
  const year = date ? date.slice(0, 4) : '—'
  const score = item.vote_average ? Math.round(item.vote_average * 10) / 10 : null
  const posterUrl = item.poster_path ? `${IMG_W500}${item.poster_path}` : PLACEHOLDER_IMG
  const ratingColor = score ? getRatingColor(score) : '#666'

  return (
    <div className="movie-card" onClick={() => onClick && onClick(item, type)}>
      <div className="card-poster-wrap">
        <img
          className="card-poster"
          src={posterUrl}
          alt={title}
          loading="lazy"
          onError={e => { e.target.src = PLACEHOLDER_IMG }}
        />
        {score !== null && (
          <div className="card-score" style={{ '--score-color': ratingColor }}>
            <span className="card-score-star">★</span>
            <span className="card-score-val">{score.toFixed(1)}</span>
          </div>
        )}
        <div className="card-type-badge">{type === 'movie' ? '🎥 Film' : '📺 Dizi'}</div>
        <div className="card-overlay">
          <span className="card-play">▶ Detaylar</span>
        </div>
      </div>
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <div className="card-meta">
          <span className="card-year">{year}</span>
          {score !== null && (
            <span className="card-rating-label" style={{ color: ratingColor }}>
              {getRatingLabel(score)}
            </span>
          )}
        </div>
        {item.vote_count > 0 && (
          <span className="card-votes">{item.vote_count.toLocaleString('tr-TR')} oy</span>
        )}
      </div>
    </div>
  )
}
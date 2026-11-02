import MovieCard from './MovieCard'
import './MovieGrid.css'

export default function MovieGrid({ items, type, onCardClick, loading, emptyText = 'Sonuç bulunamadı.' }) {
  if (loading) {
    return (
      <div className="grid-skeleton">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-poster shimmer" />
            <div className="skeleton-body">
              <div className="skeleton-line shimmer" style={{ width: '80%' }} />
              <div className="skeleton-line shimmer" style={{ width: '50%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="grid-empty">
        <span className="grid-empty-icon">🎭</span>
        <p>{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="movie-grid">
      {items.map(item => (
        <MovieCard
          key={`${type}-${item.id}`}
          item={item}
          type={type || (item.title ? 'movie' : 'tv')}
          onClick={onCardClick}
        />
      ))}
    </div>
  )
}
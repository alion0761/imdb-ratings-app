import { useEffect, useState } from 'react'
import { fetchMovieDetails, fetchTVDetails, IMG_W500, IMG_ORIGINAL, PLACEHOLDER_IMG } from '../api'
import './DetailModal.css'

function getRatingColor(score) {
  if (score >= 7.5) return '#4caf7d'
  if (score >= 6.0) return '#F5C518'
  if (score >= 4.0) return '#e07b3a'
  return '#e05c5c'
}

// Trailer bilgisi döndürür: { type: 'youtube'|'vimeo'|'imdb'|null, key, url }
function getTrailerInfo(videos, imdbId) {
  const results = videos?.results || []

  // 1. Türkçe YouTube Trailer
  const trYT = results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'tr')
  if (trYT) return { type: 'youtube', key: trYT.key }

  // 2. Resmi YouTube Trailer
  const enYT = results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
  if (enYT) return { type: 'youtube', key: enYT.key }

  // 3. YouTube Teaser
  const teaser = results.find(v => v.type === 'Teaser' && v.site === 'YouTube')
  if (teaser) return { type: 'youtube', key: teaser.key }

  // 4. Herhangi YouTube videosu
  const anyYT = results.find(v => v.site === 'YouTube')
  if (anyYT) return { type: 'youtube', key: anyYT.key }

  // 5. Vimeo Trailer
  const vimeoT = results.find(v => v.type === 'Trailer' && v.site === 'Vimeo')
  if (vimeoT) return { type: 'vimeo', key: vimeoT.key }

  // 6. Herhangi Vimeo videosu
  const anyVimeo = results.find(v => v.site === 'Vimeo')
  if (anyVimeo) return { type: 'vimeo', key: anyVimeo.key }

  // 7. YouTube arama (API key gerektirmez, her zaman çalışır)
  return { type: 'ytsearch', title: null } // title render anında doldurulacak

}

export default function DetailModal({ item, type, onClose }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trailerPlaying, setTrailerPlaying] = useState(false)

  useEffect(() => {
    if (!item) return
    setLoading(true)
    setDetails(null)
    setTrailerPlaying(false)
    const fetcher = type === 'movie' ? fetchMovieDetails : fetchTVDetails
    fetcher(item.id)
      .then(setDetails)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [item, type])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!item) return null

  const title = item.title || item.name
  const score = item.vote_average ? Math.round(item.vote_average * 10) / 10 : null
  const ratingColor = score ? getRatingColor(score) : '#666'
  const posterUrl = item.poster_path ? `${IMG_W500}${item.poster_path}` : PLACEHOLDER_IMG
  const backdropUrl = item.backdrop_path ? `${IMG_ORIGINAL}${item.backdrop_path}` : null
  const d = details
  const imdbId = d?.imdb_id || d?.external_ids?.imdb_id || null
  const trailerInfo = d ? getTrailerInfo(d.videos, imdbId) : null

  // YouTube arama URL'si — API key gerektirmez
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' fragman trailer')}`

  // iframe src hesapla
  function getIframeSrc() {
    if (!trailerInfo) return ''
    if (trailerInfo.type === 'youtube')
      return `https://www.youtube.com/embed/${trailerInfo.key}?autoplay=1&rel=0&modestbranding=1`
    if (trailerInfo.type === 'vimeo')
      return `https://player.vimeo.com/video/${trailerInfo.key}?autoplay=1&title=0&byline=0`
    return ''
  }

  const canPlayInline = trailerInfo && trailerInfo.type !== 'ytsearch'

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>✕</button>

        {/* ── Trailer / Backdrop Alanı ── */}
        <div className="detail-hero">
          {trailerPlaying && canPlayInline ? (
            <div className="trailer-iframe-wrap">
              <iframe
                className="trailer-iframe"
                src={getIframeSrc()}
                title={`${title} Fragman`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              className="detail-backdrop"
              style={{ backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none' }}
            >
              <div className="detail-backdrop-fade" />

              {/* YouTube / Vimeo — uygulama içi oynat */}
              {!loading && canPlayInline && (
                <button className="trailer-play-btn" onClick={() => setTrailerPlaying(true)}>
                  <span className="trailer-play-icon">▶</span>
                  <span className="trailer-play-text">
                    {trailerInfo.type === 'vimeo' ? "Vimeo'da İzle" : 'Fragmanı İzle'}
                  </span>
                </button>
              )}

              {/* Fragman bulunamadı → YouTube arama */}
              {!loading && trailerInfo?.type === 'ytsearch' && (
                <a
                  className="trailer-play-btn trailer-ytsearch-btn"
                  href={ytSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="trailer-play-icon">▶</span>
                  <span className="trailer-play-text">YouTube'da Fragmanı Bul</span>
                  <span className="trailer-ext-icon">↗</span>
                </a>
              )}

              {/* Hiç seçenek yok (çok nadir) */}
              {!loading && !trailerInfo && (
                <div className="trailer-no-video">🎬 Fragman bulunamadı</div>
              )}
            </div>
          )}
          {trailerPlaying && (
            <button className="trailer-stop-btn" onClick={() => setTrailerPlaying(false)}>
              ✕ Kapat
            </button>
          )}
        </div>

        <div className="detail-content">
          <div className="detail-poster-col">
            <img
              className="detail-poster"
              src={posterUrl}
              alt={title}
              onError={e => { e.target.src = PLACEHOLDER_IMG }}
            />
            {score !== null && (
              <div className="detail-score-big" style={{ borderColor: ratingColor }}>
                <span className="dsb-star">★</span>
                <span className="dsb-val" style={{ color: ratingColor }}>{score.toFixed(1)}</span>
                <span className="dsb-max">/10</span>
              </div>
            )}
          </div>
          <DetailInfo d={d} loading={loading} title={title} type={type} />
        </div>
      </div>
    </div>
  )
}

function DetailInfo({ d, loading, title, type }) {
  return (
    <div className="detail-info-col">
      <div className="detail-badges">
        <span className="detail-type-badge">{type === 'movie' ? '🎥 Film' : '📺 Dizi'}</span>
        {d?.genres?.map(g => (
          <span key={g.id} className="detail-genre-badge">{g.name}</span>
        ))}
      </div>
      <h2 className="detail-title">{title}</h2>
      {loading ? (
        <div className="detail-loading"><div className="spinner" /><span>Yükleniyor...</span></div>
      ) : (
        <>
          <div className="detail-meta-row">
            {(d?.release_date || d?.first_air_date) && (
              <span className="detail-meta-item">📅 {(d.release_date || d.first_air_date).slice(0, 4)}</span>
            )}
            {d?.runtime && <span className="detail-meta-item">⏱ {d.runtime} dk</span>}
            {d?.number_of_seasons && <span className="detail-meta-item">📺 {d.number_of_seasons} Sezon</span>}
            {d?.number_of_episodes && <span className="detail-meta-item">🎞 {d.number_of_episodes} Bölüm</span>}
            {d?.vote_count > 0 && <span className="detail-meta-item">🗳 {d.vote_count.toLocaleString('tr-TR')} oy</span>}
            {d?.status && (
              <span className="detail-meta-item">
                {d.status === 'Released' || d.status === 'Ended' ? '✅' : '🔄'} {d.status}
              </span>
            )}
          </div>
          {d?.tagline && <p className="detail-tagline">"{d.tagline}"</p>}
          {d?.overview && (
            <div className="detail-section">
              <h4 className="detail-section-title">Özet</h4>
              <p className="detail-overview">{d.overview}</p>
            </div>
          )}
          {d?.credits?.cast?.length > 0 && (
            <div className="detail-section">
              <h4 className="detail-section-title">Oyuncular</h4>
              <div className="detail-cast">
                {d.credits.cast.slice(0, 8).map(actor => (
                  <div key={actor.id} className="cast-item">
                    <div className="cast-avatar">
                      {actor.profile_path
                        ? <img src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`} alt={actor.name} />
                        : <span>👤</span>}
                    </div>
                    <div className="cast-name">{actor.name}</div>
                    <div className="cast-char">{actor.character}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {d?.production_companies?.length > 0 && (
            <div className="detail-section">
              <h4 className="detail-section-title">Yapım Şirketleri</h4>
              <p className="detail-companies">{d.production_companies.map(c => c.name).join(' · ')}</p>
            </div>
          )}
          {d?.similar?.results?.length > 0 && (
            <div className="detail-section">
              <h4 className="detail-section-title">Benzer İçerikler</h4>
              <div className="detail-similar">
                {d.similar.results.slice(0, 6).map(s => (
                  <div key={s.id} className="similar-item">
                    <img
                      src={s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : 'https://via.placeholder.com/300x450/1c1c1c/666666?text=No+Image'}
                      alt={s.title || s.name}
                      onError={e => { e.target.src = 'https://via.placeholder.com/300x450/1c1c1c/666666?text=No+Image' }}
                    />
                    <span>{s.title || s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

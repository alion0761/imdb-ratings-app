import { useEffect, useState } from 'react'
import { fetchMovieDetails, fetchTVDetails, IMG_W500, IMG_ORIGINAL, PLACEHOLDER_IMG } from '../api'
import './DetailModal.css'

// SHA-256 PIN doğrulama — Navbar ile aynı
const DM_HASH = '06af8525da0bd0971e3ce0c03516fe0cb00d44432dafa1989e44d42b27458e2e'
const DM_SALT = 'TLG_x9kM2qR5nP8vZ_tellioglu_2026_secure'

async function verifyDmPin(pin) {
  const data = new TextEncoder().encode(DM_SALT + pin)
  const buf  = await crypto.subtle.digest('SHA-256', data)
  const hex  = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
  return hex === DM_HASH
}

function MiniPinModal({ onSuccess, onClose }) {
  const [digits, setDigits] = useState([])
  const [shake, setShake]   = useState(false)
  const [busy, setBusy]     = useState(false)
  const KEYS = ['1','2','3','4','5','6','7','8','9','←','0','✓']

  async function tap(k) {
    if (busy) return
    if (k === '←') { setDigits(d => d.slice(0,-1)); return }
    if (k === '✓') {
      if (digits.length < 4) return
      setBusy(true)
      const ok = await verifyDmPin(digits.join(''))
      ok ? onSuccess() : fail()
      return
    }
    if (digits.length >= 4) return
    const next = [...digits, k]
    setDigits(next)
    if (next.length === 4) {
      setBusy(true)
      const ok = await verifyDmPin(next.join(''))
      ok ? onSuccess() : fail()
    }
  }

  function fail() {
    setShake(true)
    setTimeout(() => { setShake(false); setDigits([]); setBusy(false) }, 600)
  }

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="dm-pin-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="dm-pin-modal">
        <button className="dm-pin-close" onClick={onClose}>✕</button>
        <div className="dm-pin-lock">🔐</div>
        <p className="dm-pin-title">İzleme Erişimi</p>
        <p className="dm-pin-sub">PIN girin</p>
        <div className={`dm-pin-dots ${shake ? 'dm-pin-shake' : ''}`}>
          {[0,1,2,3].map(i => (
            <div key={i} className={`dm-pin-dot ${digits.length > i ? 'filled' : ''} ${shake ? 'error' : ''}`} />
          ))}
        </div>
        <div className="dm-pin-numpad">
          {KEYS.map(k => (
            <button
              key={k}
              className={`dm-pin-key ${k==='←'?'dm-pk-del':''} ${k==='✓'?'dm-pk-ok':''}`}
              onClick={() => tap(k)}
              disabled={busy}
            >{k}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function getRatingColor(score) {
  if (score >= 7.5) return '#4caf7d'
  if (score >= 6.0) return '#F5C518'
  if (score >= 4.0) return '#e07b3a'
  return '#e05c5c'
}

// Trailer bilgisi döndürür: { type: 'youtube'|'vimeo'|'ytsearch', key?, lang? }
function getTrailerInfo(videos, originalLang) {
  const results = videos?.results || []

  const ytTrailers  = results.filter(v => v.type === 'Trailer' && v.site === 'YouTube')
  const ytTeasers   = results.filter(v => v.type === 'Teaser'  && v.site === 'YouTube')
  const ytAny       = results.filter(v => v.site === 'YouTube')
  const vimeoAny    = results.filter(v => v.site === 'Vimeo')

  // Dil önceliğine göre YouTube Trailer seç
  // 1. Türkçe Trailer
  const trYT = ytTrailers.find(v => v.iso_639_1 === 'tr')
  if (trYT) return { type: 'youtube', key: trYT.key, lang: 'tr' }

  // 2. İngilizce Trailer
  const enYT = ytTrailers.find(v => v.iso_639_1 === 'en')
  if (enYT) return { type: 'youtube', key: enYT.key, lang: 'en' }

  // 3. Filmin orijinal dilindeki Trailer (Korece, Japonca, İspanyolca vb.)
  if (originalLang) {
    const origYT = ytTrailers.find(v => v.iso_639_1 === originalLang)
    if (origYT) return { type: 'youtube', key: origYT.key, lang: originalLang }
  }

  // 4. Dil fark etmez, herhangi Trailer
  if (ytTrailers.length) return { type: 'youtube', key: ytTrailers[0].key, lang: ytTrailers[0].iso_639_1 }

  // 5. Türkçe Teaser
  const trTeaser = ytTeasers.find(v => v.iso_639_1 === 'tr')
  if (trTeaser) return { type: 'youtube', key: trTeaser.key, lang: 'tr' }

  // 6. İngilizce Teaser
  const enTeaser = ytTeasers.find(v => v.iso_639_1 === 'en')
  if (enTeaser) return { type: 'youtube', key: enTeaser.key, lang: 'en' }

  // 7. Orijinal dil Teaser
  if (originalLang) {
    const origTeaser = ytTeasers.find(v => v.iso_639_1 === originalLang)
    if (origTeaser) return { type: 'youtube', key: origTeaser.key, lang: originalLang }
  }

  // 8. Herhangi Teaser
  if (ytTeasers.length) return { type: 'youtube', key: ytTeasers[0].key, lang: ytTeasers[0].iso_639_1 }

  // 9. Herhangi YouTube videosu
  if (ytAny.length) return { type: 'youtube', key: ytAny[0].key, lang: ytAny[0].iso_639_1 }

  // 10. Vimeo Trailer
  const vimeoT = vimeoAny.find(v => v.type === 'Trailer')
  if (vimeoT) return { type: 'vimeo', key: vimeoT.key }

  // 11. Herhangi Vimeo
  if (vimeoAny.length) return { type: 'vimeo', key: vimeoAny[0].key }

  // 12. YouTube arama — API key gerektirmez, her zaman çalışır
  return { type: 'ytsearch' }
}

export default function DetailModal({ item, type, onClose }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trailerPlaying, setTrailerPlaying] = useState(false)
  const [watchMode, setWatchMode] = useState(null)   // null | 'embed'
  const [embedSrc, setEmbedSrc] = useState('')
  const [embedError, setEmbedError] = useState(false)
  const [findUnlocked, setFindUnlocked] = useState(false)
  const [showFindPin, setShowFindPin] = useState(false)

  useEffect(() => {
    if (!item) return
    setLoading(true)
    setDetails(null)
    setTrailerPlaying(false)
    setWatchMode(null)
    setEmbedSrc('')
    setEmbedError(false)
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
  const originalLang = d?.original_language || item?.original_language || null
  const trailerInfo = d ? getTrailerInfo(d.videos, originalLang) : null

  // YouTube arama URL'si — API key gerektirmez
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' fragman trailer')}`

  // Türkçe ad — TMDB details'ten gelir, yoksa item adını kullan
  const trTitle = (type === 'movie' ? d?.title : d?.name) || title

  // "Filmi Bul" Google arama URL'leri
  const googleDublajUrl = `https://www.google.com/search?q=${encodeURIComponent(`"${trTitle}" türkçe dublaj izle`)}`
  const googleAltyazıUrl = `https://www.google.com/search?q=${encodeURIComponent(`"${trTitle}" türkçe altyazılı izle`)}`

  // TMDB ID
  const tmdbId = item.id

  // Embed kaynakları — TMDB ID ile, sırayla dener
  const embedSources = [
    `https://vidsrc.to/embed/${type === 'movie' ? 'movie' : 'tv'}/${tmdbId}`,
    `https://www.2embed.cc/embed/${tmdbId}`,
    `https://vidsrc.me/embed/${type === 'movie' ? 'movie' : 'tv'}?tmdb=${tmdbId}`,
  ]

  function startWatch() {
    setEmbedError(false)
    setEmbedSrc(embedSources[0])
    setWatchMode('embed')
    setTrailerPlaying(false)
  }

  function stopWatch() {
    setWatchMode(null)
    setEmbedSrc('')
    setEmbedError(false)
  }

  function tryNextEmbed() {
    const idx = embedSources.indexOf(embedSrc)
    if (idx < embedSources.length - 1) {
      setEmbedSrc(embedSources[idx + 1])
      setEmbedError(false)
    } else {
      setEmbedError(true)
    }
  }

  // iframe src hesapla (fragman için)
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

        {/* ── Hero Alanı ── */}
        <div className="detail-hero">

          {/* Embed player — Film İzle modunda */}
          {watchMode === 'embed' && (
            <div className="trailer-iframe-wrap">
              {!embedError ? (
                <iframe
                  key={embedSrc}
                  className="trailer-iframe"
                  src={embedSrc}
                  title={`${title} İzle`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  onError={tryNextEmbed}
                />
              ) : (
                <div className="embed-error">
                  <p>⚠️ Bu kaynak şu an çalışmıyor.</p>
                </div>
              )}
            </div>
          )}

          {/* Fragman player */}
          {watchMode !== 'embed' && trailerPlaying && canPlayInline && (
            <div className="trailer-iframe-wrap">
              <iframe
                className="trailer-iframe"
                src={getIframeSrc()}
                title={`${title} Fragman`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Backdrop — oynatma modunda değilken */}
          {watchMode !== 'embed' && !trailerPlaying && (
            <div
              className="detail-backdrop"
              style={{ backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none' }}
            >
              <div className="detail-backdrop-fade" />

              {/* Fragman butonu — ortalı, modern */}
              {!loading && canPlayInline && (
                <button className="trailer-play-btn" onClick={() => setTrailerPlaying(true)}>
                  <span className="trailer-play-icon">▶</span>
                  <span className="trailer-play-text">
                    {trailerInfo.type === 'vimeo' ? "Vimeo'da İzle" : 'Fragman İzle'}
                  </span>
                  {trailerInfo.lang && trailerInfo.lang !== 'tr' && (
                    <span className="trailer-lang-badge">
                      {trailerInfo.lang === 'en' ? '🇬🇧 EN'
                        : trailerInfo.lang === 'ko' ? '🇰🇷 KO'
                        : trailerInfo.lang === 'ja' ? '🇯🇵 JA'
                        : trailerInfo.lang === 'fr' ? '🇫🇷 FR'
                        : trailerInfo.lang === 'de' ? '🇩🇪 DE'
                        : trailerInfo.lang === 'es' ? '🇪🇸 ES'
                        : trailerInfo.lang === 'it' ? '🇮🇹 IT'
                        : trailerInfo.lang === 'pt' ? '🇵🇹 PT'
                        : trailerInfo.lang === 'ru' ? '🇷🇺 RU'
                        : trailerInfo.lang === 'zh' ? '🇨🇳 ZH'
                        : trailerInfo.lang === 'ar' ? '🇸🇦 AR'
                        : trailerInfo.lang.toUpperCase()}
                    </span>
                  )}
                </button>
              )}

              {/* YouTube arama fallback */}
              {!loading && trailerInfo?.type === 'ytsearch' && (
                <a className="trailer-play-btn trailer-ytsearch-btn" href={ytSearchUrl} target="_blank" rel="noreferrer">
                  <span className="trailer-play-icon">▶</span>
                  <span className="trailer-play-text">YouTube'da Fragmanı Bul</span>
                  <span className="trailer-ext-icon">↗</span>
                </a>
              )}

              {/* Filmi Bul butonları — PIN korumalı */}
              {!loading && !findUnlocked && (
                <div className="find-film-row">
                  <button
                    className="find-film-btn find-film-locked"
                    onClick={() => setShowFindPin(true)}
                  >
                    <span className="find-film-icon">🔒</span>
                    <span>Dublaj / Altyazılı İzle</span>
                  </button>
                </div>
              )}

              {!loading && findUnlocked && (
                <div className="find-film-row">
                  <a
                    className="find-film-btn find-film-dublaj"
                    href={googleDublajUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="find-film-icon">🎙️</span>
                    <span>Dublaj İzle</span>
                    <span className="find-film-ext">↗</span>
                  </a>
                  <a
                    className="find-film-btn find-film-altyazi"
                    href={googleAltyazıUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="find-film-icon">📝</span>
                    <span>Altyazılı İzle</span>
                    <span className="find-film-ext">↗</span>
                  </a>
                </div>
              )}

              {/* PIN Modal */}
              {showFindPin && (
                <MiniPinModal
                  onSuccess={() => { setFindUnlocked(true); setShowFindPin(false) }}
                  onClose={() => setShowFindPin(false)}
                />
              )}

            </div>
          )}

          {/* Kapat butonu — oynatma modlarında */}
          {(trailerPlaying || watchMode === 'embed') && (
            <button className="trailer-stop-btn" onClick={() => { setTrailerPlaying(false); stopWatch() }}>
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

function WatchProviders({ d }) {
  const providerData = d?.['watch/providers']?.results
  const region = providerData?.TR || providerData?.US || null
  if (!region) return null

  const flatrate = region.flatrate || []
  const rent     = region.rent     || []
  const buy      = region.buy      || []

  const allProviders = []
  const seen = new Set()
  ;[...flatrate, ...rent, ...buy].forEach(p => {
    if (!seen.has(p.provider_id)) {
      seen.add(p.provider_id)
      const pType = flatrate.find(f => f.provider_id === p.provider_id)
        ? 'flatrate'
        : rent.find(r => r.provider_id === p.provider_id)
        ? 'rent'
        : 'buy'
      allProviders.push({ ...p, pType })
    }
  })

  if (!allProviders.length) return null

  return (
    <div className="detail-section">
      <h4 className="detail-section-title">📡 Nereden İzlenir</h4>
      <div className="providers-list">
        {allProviders.map(p => (
          <a
            key={p.provider_id}
            href={region.link || '#'}
            target="_blank"
            rel="noreferrer"
            className={`provider-item provider-${p.pType}`}
            title={`${p.provider_name} — ${p.pType === 'flatrate' ? 'Abonelik' : p.pType === 'rent' ? 'Kiralık' : 'Satın Al'}`}
          >
            <img
              src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
              alt={p.provider_name}
              className="provider-logo"
              onError={e => { e.target.style.display = 'none' }}
            />
            <span className="provider-name">{p.provider_name}</span>
            <span className={`provider-badge provider-badge-${p.pType}`}>
              {p.pType === 'flatrate' ? 'Abonelik' : p.pType === 'rent' ? 'Kiralık' : 'Satın Al'}
            </span>
          </a>
        ))}
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
<WatchProviders d={d} />
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

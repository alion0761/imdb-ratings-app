import { useState, useEffect, useRef } from 'react'
import './Navbar.css'

// SHA-256 hash karşılaştırması — Web Crypto API (tarayıcı built-in)
const HASH = '06af8525da0bd0971e3ce0c03516fe0cb00d44432dafa1989e44d42b27458e2e'
const SALT = 'TLG_x9kM2qR5nP8vZ_tellioglu_2026_secure'

async function verifyPin(pin) {
  const data = new TextEncoder().encode(SALT + pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex === HASH
}

function PinModal({ onSuccess, onClose }) {
  const [digits, setDigits] = useState([])
  const [shake, setShake] = useState(false)
  const [checking, setChecking] = useState(false)

  const KEYS = ['1','2','3','4','5','6','7','8','9','←','0','✓']

  async function handleKey(k) {
    if (checking) return
    if (k === '←') {
      setDigits(d => d.slice(0, -1))
    } else if (k === '✓') {
      if (digits.length < 4) return
      setChecking(true)
      const ok = await verifyPin(digits.join(''))
      if (ok) {
        onSuccess()
      } else {
        setShake(true)
        setTimeout(() => { setShake(false); setDigits([]); setChecking(false) }, 600)
      }
    } else {
      if (digits.length >= 4) return
      const next = [...digits, k]
      setDigits(next)
      if (next.length === 4) {
        setChecking(true)
        const ok = await verifyPin(next.join(''))
        if (ok) {
          onSuccess()
        } else {
          setShake(true)
          setTimeout(() => { setShake(false); setDigits([]); setChecking(false) }, 600)
        }
      }
    }
  }

  // ESC ile kapat
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="pin-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="pin-modal">
        <button className="pin-close" onClick={onClose}>✕</button>
        <div className="pin-lock-icon">🔐</div>
        <h3 className="pin-title">Online Film</h3>
        <p className="pin-subtitle">Erişim için PIN girin</p>

        <div className={`pin-dots ${shake ? 'pin-shake' : ''}`}>
          {[0,1,2,3].map(i => (
            <div key={i} className={`pin-dot ${digits.length > i ? 'filled' : ''} ${shake ? 'error' : ''}`} />
          ))}
        </div>

        <div className="pin-numpad">
          {KEYS.map(k => (
            <button
              key={k}
              className={`pin-key ${k === '←' ? 'pin-key-del' : ''} ${k === '✓' ? 'pin-key-ok' : ''}`}
              onClick={() => handleKey(k)}
              disabled={checking}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const ONLINE_CATEGORIES = [
  {
    category: '🎬 Film & Dizi',
    sites: [
      { name: 'HD Film Cehennemi', url: 'https://www.hdfilmcehennemi.land/' },
      { name: 'DiziPal', url: 'https://www.google.com/search?q=dizipal&oq=dizi&gs_lcrp=EgZjaHJvbWUqCAgAEEUYJxg7MggIABBFGCcYOzIGCAEQRRg5MgYIAhBFGDwyBggDEEUYQTIGCAQQRRg8MgYIBRBFGEEyBggGEEUYPTIGCAcQRRhB0gEIMTg1M2owajeoAgiwAgHxBRDy-YIPfMFP&sourceid=chrome&source=chrome.ob&ie=UTF-8' },
      { name: 'FullHD Filmizlesene', url: 'https://www.fullhdfilmizlesene.now/' },
      { name: 'Cine HD', url: 'https://cinehd.vc/home' },
      { name: 'Netflix', url: 'https://net77.cc/home' },
    ]
  },
  {
    category: '🎮 Oyun & Eğlence',
    sites: [
      { name: 'Online Satranç', url: 'https://www.chess.com/tr/play/computer' },
      { name: 'Online Oyun', url: 'https://www.crazygames.com/tr/' },
    ]
  },
  {
    category: '📡 Canlı & Keşif',
    sites: [
      { name: 'Dünya TV', url: 'https://famelack.com/' },
      { name: 'Canlı Kamera Hayvanlar', url: 'https://explore.org/' },
      { name: 'Canlı Dünya Hava Olayları', url: 'https://www.windy.com/?39.126,35.192,7' },
      { name: 'Dünya Radyoları', url: 'https://radio.garden/' },
    ]
  },
  {
    category: '🛠️ Araçlar & Diğer',
    sites: [
      { name: 'Windows XP', url: 'https://quenq.com/apps/reborn-xp/' },
      { name: 'Haritadan Yer Bul', url: 'https://www.worldguessr.com/' },
      { name: 'Online Browser', url: 'https://browser.lol/en/viewer' },
      { name: 'Hız Testi', url: 'https://www.speedtest.net/' },
    ]
  },
]

export default function Navbar({ onSearch, onTabChange, activeTab }) {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [sitesOpen, setSitesOpen] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    onSearch(val)
  }

  function handleTab(tab) {
    setMenuOpen(false)
    onTabChange(tab)
    setQuery('')
    onSearch('')
  }

  function clearSearch() {
    setQuery('')
    onSearch('')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => handleTab('home')}>
          <span className="navbar-logo">🎬</span>
          <div className="navbar-title-wrap">
            <span className="navbar-name">Film Seçme Asistanı</span>
            <span className="navbar-subtitle">Film & Dizi Keşfet</span>
          </div>
        </div>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <button className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleTab('home')}>🏠 Ana Sayfa</button>
          <button className={`nav-link ${activeTab === 'movies' ? 'active' : ''}`} onClick={() => handleTab('movies')}>🎥 Filmler</button>
          <button className={`nav-link ${activeTab === 'tv' ? 'active' : ''}`} onClick={() => handleTab('tv')}>📺 Diziler</button>
          <button className={`nav-link ${activeTab === 'toprated' ? 'active' : ''}`} onClick={() => handleTab('toprated')}>⭐ En İyiler</button>

          {/* Online Film Dropdown — PIN korumalı */}
          <div className={`nav-dropdown ${sitesOpen && unlocked ? 'open' : ''}`}>
            <button
              className="nav-link nav-dropdown-toggle"
              onClick={() => {
                if (!unlocked) {
                  setShowPin(true)
                } else {
                  setSitesOpen(v => !v)
                }
              }}
            >
              🌐 Online Film {unlocked ? <span className="dropdown-lock unlocked">🔓</span> : <span className="dropdown-lock">🔒</span>} <span className="dropdown-arrow">{sitesOpen && unlocked ? '▲' : '▼'}</span>
            </button>
            {unlocked && (
              <div className="nav-dropdown-menu">
                {ONLINE_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="dropdown-category">
                    <div className="dropdown-category-title">{cat.category}</div>
                    {cat.sites.map((site, i) => (
                      <a
                        key={site.url}
                        className="nav-dropdown-item"
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => { setSitesOpen(false); setMenuOpen(false) }}
                      >
                        <span className="dropdown-num">{i + 1}.</span>
                        <span className="dropdown-site-name">{site.name}</span>
                        <span className="dropdown-ext">↗</span>
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PIN Modal */}
          {showPin && (
            <PinModal
              onSuccess={() => { setUnlocked(true); setShowPin(false); setSitesOpen(true) }}
              onClose={() => setShowPin(false)}
            />
          )}

          <div className="mobile-search-row">
            <div className="search-wrap mobile-search">
              <span className="search-icon">🔍</span>
              <input className="search-input" type="search" placeholder="Film veya dizi ara..." value={query} onChange={handleInput} autoComplete="off" />
              {query && <button className="search-clear" onClick={clearSearch}>✕</button>}
            </div>
          </div>
        </nav>

        <div className="navbar-right">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" type="search" placeholder="Film veya dizi ara..." value={query} onChange={handleInput} autoComplete="off" />
            {query && <button className="search-clear" onClick={clearSearch}>✕</button>}
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(v => !v)} aria-label="Menü">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  )
}
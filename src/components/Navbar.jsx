import { useState } from 'react'
import './Navbar.css'

const ONLINE_SITES = [
  { name: 'HD Film Cehennemi', url: 'https://www.hdfilmcehennemi.land/' },
  { name: 'DiziPal', url: 'https://www.google.com/search?q=dizipal&oq=dizi&gs_lcrp=EgZjaHJvbWUqCAgAEEUYJxg7MggIABBFGCcYOzIGCAEQRRg5MgYIAhBFGDwyBggDEEUYQTIGCAQQRRg8MgYIBRBFGEEyBggGEEUYPTIGCAcQRRhB0gEIMTg1M2owajeoAgiwAgHxBRDy-YIPfMFP&sourceid=chrome&source=chrome.ob&ie=UTF-8' },
  { name: 'FullHD Filmizlesene', url: 'https://www.fullhdfilmizlesene.now/' },
  { name: 'Cine HD', url: 'https://cinehd.vc/' },
]

export default function Navbar({ onSearch, onTabChange, activeTab }) {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [sitesOpen, setSitesOpen] = useState(false)

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
            <span className="navbar-name">TELLIOGLU AİLESİ</span>
            <span className="navbar-subtitle">Kişisel Film Asistanı</span>
          </div>
        </div>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <button className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleTab('home')}>🏠 Ana Sayfa</button>
          <button className={`nav-link ${activeTab === 'movies' ? 'active' : ''}`} onClick={() => handleTab('movies')}>🎥 Filmler</button>
          <button className={`nav-link ${activeTab === 'tv' ? 'active' : ''}`} onClick={() => handleTab('tv')}>📺 Diziler</button>
          <button className={`nav-link ${activeTab === 'toprated' ? 'active' : ''}`} onClick={() => handleTab('toprated')}>⭐ En İyiler</button>

          {/* Online Film Dropdown */}
          <div className={`nav-dropdown ${sitesOpen ? 'open' : ''}`}>
            <button className="nav-link nav-dropdown-toggle" onClick={() => setSitesOpen(v => !v)}>
              🌐 Online Film <span className="dropdown-arrow">{sitesOpen ? '▲' : '▼'}</span>
            </button>
            <div className="nav-dropdown-menu">
              {ONLINE_SITES.map(site => (
                <a
                  key={site.url}
                  className="nav-dropdown-item"
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => { setSitesOpen(false); setMenuOpen(false) }}
                >
                  {site.name} <span className="dropdown-ext">↗</span>
                </a>
              ))}
            </div>
          </div>

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
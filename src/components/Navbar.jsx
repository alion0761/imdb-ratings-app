import { useState } from 'react'
import useDebounce from '../hooks/useDebounce'
import './Navbar.css'

export default function Navbar({ onSearch, onTabChange, activeTab, onResetKey }) {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const debounced = useDebounce(query, 400)

  // trigger search when debounced changes
  useState(() => { }, [])
  // We'll handle this via useEffect in parent instead – pass raw query up
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

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => handleTab('home')}>
          <span className="navbar-logo">🎬</span>
          <span className="navbar-name">Devoloper by Tellioglu</span>
        </div>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <button
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTab('home')}
          >🏠 Ana Sayfa</button>
          <button
            className={`nav-link ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => handleTab('movies')}
          >🎥 Filmler</button>
          <button
            className={`nav-link ${activeTab === 'tv' ? 'active' : ''}`}
            onClick={() => handleTab('tv')}
          >📺 Diziler</button>
          <button
            className={`nav-link ${activeTab === 'toprated' ? 'active' : ''}`}
            onClick={() => handleTab('toprated')}
          >⭐ En İyiler</button>
        </nav>

        <div className="navbar-right">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Film veya dizi ara..."
              value={query}
              onChange={handleInput}
            />
            {query && (
              <button className="search-clear" onClick={() => { setQuery(''); onSearch('') }}>✕</button>
            )}
          </div>
          <button className="key-btn" onClick={onResetKey} title="API Anahtarını Değiştir">🔑</button>
          <button className="menu-toggle" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  )
}
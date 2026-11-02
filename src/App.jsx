import { useState } from 'react'
import { getApiKey } from './api'
import ApiKeyModal from './components/ApiKeyModal'
import Navbar from './components/Navbar'
import DetailModal from './components/DetailModal'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import TopRatedPage from './pages/TopRatedPage'
import SearchPage from './pages/SearchPage'
import './App.css'

export default function App() {
  const [hasKey, setHasKey] = useState(!!getApiKey())
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState(null)   // { item, type }
  const [showKeyModal, setShowKeyModal] = useState(false)

  function handleCardClick(item, type) {
    setSelected({ item, type })
  }

  function handleSearch(q) {
    setSearchQuery(q)
    if (q.trim()) {
      setActiveTab('search')
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    if (tab !== 'search') setSearchQuery('')
  }

  if (!hasKey || showKeyModal) {
    return (
      <ApiKeyModal onConfirm={() => { setHasKey(true); setShowKeyModal(false) }} />
    )
  }

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
        onResetKey={() => setShowKeyModal(true)}
      />

      <main className="app-main">
        {activeTab === 'home' && (
          <HomePage onCardClick={handleCardClick} />
        )}
        {activeTab === 'movies' && (
          <BrowsePage key="movies" mediaType="movie" onCardClick={handleCardClick} />
        )}
        {activeTab === 'tv' && (
          <BrowsePage key="tv" mediaType="tv" onCardClick={handleCardClick} />
        )}
        {activeTab === 'toprated' && (
          <TopRatedPage onCardClick={handleCardClick} />
        )}
        {activeTab === 'search' && (
          <SearchPage query={searchQuery} onCardClick={handleCardClick} />
        )}
      </main>

      {selected && (
        <DetailModal
          item={selected.item}
          type={selected.type}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
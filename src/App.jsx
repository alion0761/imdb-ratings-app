import { useState } from 'react'
import Navbar from './components/Navbar'
import DetailModal from './components/DetailModal'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import TopRatedPage from './pages/TopRatedPage'
import SearchPage from './pages/SearchPage'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState(null)

  function handleCardClick(item, type) {
    setSelected({ item, type })
  }

  function handleSearch(q) {
    setSearchQuery(q)
    if (q.trim()) setActiveTab('search')
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    if (tab !== 'search') setSearchQuery('')
  }

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
      />

      <main className="app-main">
        {activeTab === 'home' && <HomePage onCardClick={handleCardClick} />}
        {activeTab === 'movies' && <BrowsePage key="movies" mediaType="movie" onCardClick={handleCardClick} />}
        {activeTab === 'tv' && <BrowsePage key="tv" mediaType="tv" onCardClick={handleCardClick} />}
        {activeTab === 'toprated' && <TopRatedPage onCardClick={handleCardClick} />}
        {activeTab === 'search' && <SearchPage query={searchQuery} onCardClick={handleCardClick} />}
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
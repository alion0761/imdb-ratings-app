import { useState } from 'react'
import { setApiKey, getApiKey } from '../api'
import './ApiKeyModal.css'

export default function ApiKeyModal({ onConfirm }) {
  const [key, setKey] = useState(getApiKey() || '')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) {
      setError('Lütfen bir API anahtarı girin.')
      return
    }
    setApiKey(trimmed)
    onConfirm()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-icon">🎬</div>
        <h1 className="modal-title">Film Seçme Asistanı</h1>
        <p className="modal-title-sub">Film & Dizi Keşfet</p>
        <p className="modal-subtitle">Film & Dizi Puanlama Uygulaması</p>

        <div className="modal-info">
          <p>Bu uygulama <strong>TMDB API</strong>'sini kullanır. Devam etmek için ücretsiz bir API anahtarına ihtiyacınız var.</p>
          <ol>
            <li><a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer">themoviedb.org</a>'a üye olun</li>
            <li>Hesap ayarlarından <strong>API</strong> bölümüne gidin</li>
            <li>API v3 (auth) anahtarınızı kopyalayın ve aşağıya yapıştırın</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <input
            className="modal-input"
            type="text"
            placeholder="TMDB API Anahtarınızı buraya yapıştırın..."
            value={key}
            onChange={e => { setKey(e.target.value); setError('') }}
            autoFocus
            spellCheck={false}
          />
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="modal-btn">
            Devam Et →
          </button>
        </form>

        <p className="modal-note">Anahtarınız yalnızca tarayıcınızda saklanır, hiçbir yere gönderilmez.</p>
      </div>
    </div>
  )
}
import axios from 'axios'

const BASE_URL = 'https://api.themoviedb.org/3'
export const IMG_BASE = 'https://image.tmdb.org/t/p'
export const IMG_W500 = `${IMG_BASE}/w500`
export const IMG_W780 = `${IMG_BASE}/w780`
export const IMG_ORIGINAL = `${IMG_BASE}/original`

export const PLACEHOLDER_IMG = 'https://via.placeholder.com/300x450/1c1c1c/666666?text=Görsel+Yok'

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY || 'fe7d08ca8fd1be79792efad7f4e7238e'

function client() {
  return axios.create({
    baseURL: BASE_URL,
    params: {
      api_key: TMDB_KEY,
      language: 'tr-TR',
    },
  })
}

// ─── Genres ───────────────────────────────────────────────────────────────────
export async function fetchMovieGenres() {
  const { data } = await client().get('/genre/movie/list')
  return data.genres
}

export async function fetchTVGenres() {
  const { data } = await client().get('/genre/tv/list')
  return data.genres
}

// ─── Movies ───────────────────────────────────────────────────────────────────
export async function fetchTrendingMovies(page = 1) {
  const { data } = await client().get('/trending/movie/week', { params: { page } })
  return data
}

export async function fetchPopularMovies(page = 1) {
  const { data } = await client().get('/movie/popular', { params: { page } })
  return data
}

export async function fetchTopRatedMovies(page = 1) {
  const { data } = await client().get('/movie/top_rated', { params: { page } })
  return data
}

export async function fetchNowPlayingMovies(page = 1) {
  const { data } = await client().get('/movie/now_playing', { params: { page } })
  return data
}

export async function fetchUpcomingMovies(page = 1) {
  const { data } = await client().get('/movie/upcoming', { params: { page } })
  return data
}

export async function fetchMoviesByGenre(genreId, page = 1) {
  const { data } = await client().get('/discover/movie', {
    params: { with_genres: genreId, sort_by: 'vote_average.desc', 'vote_count.gte': 200, page },
  })
  return data
}

export async function fetchMovieDetails(id) {
  const { data } = await client().get(`/movie/${id}`, {
    params: { append_to_response: 'credits,videos,similar,external_ids,watch/providers' },
  })
  return data
}

// ─── TV Shows ─────────────────────────────────────────────────────────────────
export async function fetchTrendingTV(page = 1) {
  const { data } = await client().get('/trending/tv/week', { params: { page } })
  return data
}

export async function fetchPopularTV(page = 1) {
  const { data } = await client().get('/tv/popular', { params: { page } })
  return data
}

export async function fetchTopRatedTV(page = 1) {
  const { data } = await client().get('/tv/top_rated', { params: { page } })
  return data
}

export async function fetchOnAirTV(page = 1) {
  const { data } = await client().get('/tv/on_the_air', { params: { page } })
  return data
}

export async function fetchTVByGenre(genreId, page = 1) {
  const { data } = await client().get('/discover/tv', {
    params: { with_genres: genreId, sort_by: 'vote_average.desc', 'vote_count.gte': 100, page },
  })
  return data
}

export async function fetchTVDetails(id) {
  const { data } = await client().get(`/tv/${id}`, {
    params: { append_to_response: 'credits,videos,similar,external_ids,watch/providers' },
  })
  return data
}

// ─── Random Top Rated Film ────────────────────────────────────────────────────
export async function fetchRandomTopRatedMovie() {
  // İlk 5 sayfadan rastgele bir sayfa seç, puan >= 7.5 ve oy >= 500
  const page = Math.floor(Math.random() * 5) + 1
  const { data } = await client().get('/discover/movie', {
    params: {
      sort_by: 'vote_average.desc',
      'vote_count.gte': 500,
      'vote_average.gte': 7.5,
      page,
    },
  })
  const results = data.results || []
  if (!results.length) return null
  return results[Math.floor(Math.random() * results.length)]
}

// ─── Search ───────────────────────────────────────────────────────────────────
export async function searchMulti(query, page = 1) {
  const { data } = await client().get('/search/multi', { params: { query, page } })
  return data
}

// ─── Discover with filters ────────────────────────────────────────────────────
export async function discoverMovies({
  genreId, sortBy = 'popularity.desc', page = 1,
  yearFrom, yearTo, minScore, maxScore, language
} = {}) {
  const params = { sort_by: sortBy, page, 'vote_count.gte': 50 }
  if (genreId)   params.with_genres = genreId
  if (yearFrom)  params['primary_release_date.gte'] = `${yearFrom}-01-01`
  if (yearTo)    params['primary_release_date.lte'] = `${yearTo}-12-31`
  if (minScore)  params['vote_average.gte'] = minScore
  if (maxScore)  params['vote_average.lte'] = maxScore
  if (language)  params.with_original_language = language
  const { data } = await client().get('/discover/movie', { params })
  return data
}

export async function discoverTV({
  genreId, sortBy = 'popularity.desc', page = 1,
  yearFrom, yearTo, minScore, maxScore, language
} = {}) {
  const params = { sort_by: sortBy, page, 'vote_count.gte': 50 }
  if (genreId)   params.with_genres = genreId
  if (yearFrom)  params['first_air_date.gte'] = `${yearFrom}-01-01`
  if (yearTo)    params['first_air_date.lte'] = `${yearTo}-12-31`
  if (minScore)  params['vote_average.gte'] = minScore
  if (maxScore)  params['vote_average.lte'] = maxScore
  if (language)  params.with_original_language = language
  const { data } = await client().get('/discover/tv', { params })
  return data
}
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon, CalendarIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import EventCard from '../../components/events/EventCard'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useAuthStore from '../../stores/authStore'

const categories = [
  { value: '', label: 'Toutes' },
  { value: 'community', label: 'Communauté' },
  { value: 'sports', label: 'Sports' },
  { value: 'culture', label: 'Culture' },
  { value: 'education', label: 'Éducation' },
  { value: 'health', label: 'Santé' },
  { value: 'government', label: 'Gouvernement' },
  { value: 'environment', label: 'Environnement' }
]

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page')) || 1
  const upcoming = searchParams.get('upcoming') !== 'false'

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', page)
        params.append('limit', 12)
        params.append('upcoming', upcoming)
        if (category) params.append('category', category)
        if (search) params.append('search', search)

        const response = await api.get(`/events?${params.toString()}`)
        setEvents(response.data.events || [])
        setPagination(response.data.pagination || { page: 1, pages: 1 })
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [category, search, page, upcoming])

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newSearch = formData.get('search')
    setSearchParams({ search: newSearch, category, page: 1, upcoming })
  }

  const handleCategoryChange = (newCategory) => {
    setSearchParams({ category: newCategory, search, page: 1, upcoming })
  }

  const handlePageChange = (newPage) => {
    setSearchParams({ category, search, page: newPage, upcoming })
  }

  const toggleUpcoming = () => {
    setSearchParams({ category, search, page: 1, upcoming: !upcoming })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
          <p className="text-gray-600 mt-1">
            Découvrez les événements de votre communauté
          </p>
        </div>
        
        {isAuthenticated && (
          <Link to="/events/create" className="btn-primary mt-4 md:mt-0 inline-flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" />
            Créer un événement
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Rechercher un événement..."
                className="input pl-10"
              />
            </div>
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input w-auto"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Upcoming Toggle */}
          <button
            onClick={toggleUpcoming}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              upcoming 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            {upcoming ? 'À venir' : 'Tous'}
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : events.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun événement trouvé</p>
          {search && (
            <button
              onClick={() => setSearchParams({ category, page: 1, upcoming })}
              className="text-primary-600 hover:text-primary-700 mt-2"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import PostCard from '../../components/posts/PostCard'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useAuthStore from '../../stores/authStore'

const categories = [
  { value: '', label: 'Toutes' },
  { value: 'news', label: 'Actualités' },
  { value: 'announcement', label: 'Annonces' },
  { value: 'discussion', label: 'Discussions' },
  { value: 'alert', label: 'Alertes' }
]

export default function Posts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', page)
        params.append('limit', 12)
        if (category) params.append('category', category)
        if (search) params.append('search', search)

        const response = await api.get(`/posts?${params.toString()}`)
        setPosts(response.data.posts || [])
        setPagination(response.data.pagination || { page: 1, pages: 1 })
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [category, search, page])

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newSearch = formData.get('search')
    setSearchParams({ search: newSearch, category, page: 1 })
  }

  const handleCategoryChange = (newCategory) => {
    setSearchParams({ category: newCategory, search, page: 1 })
  }

  const handlePageChange = (newPage) => {
    setSearchParams({ category, search, page: newPage })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Publications</h1>
          <p className="text-gray-600 mt-1">
            Découvrez les dernières actualités et discussions de votre communauté
          </p>
        </div>
        
        {isAuthenticated && (
          <Link to="/posts/create" className="btn-primary mt-4 md:mt-0 inline-flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" />
            Nouvelle publication
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
                placeholder="Rechercher..."
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
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
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
          <p className="text-gray-500 text-lg">Aucune publication trouvée</p>
          {search && (
            <button
              onClick={() => setSearchParams({ category, page: 1 })}
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

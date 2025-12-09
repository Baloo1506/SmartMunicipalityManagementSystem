import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  UserIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  Cog6ToothIcon,
  MapPinIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../services/api'
import PostCard from '../components/posts/PostCard'
import EventCard from '../components/events/EventCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import useAuthStore from '../stores/authStore'

export default function Profile() {
  const { id } = useParams()
  const { user: currentUser } = useAuthStore()
  
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [events, setEvents] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isOwnProfile = !id || id === currentUser?.id

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const userId = id || currentUser?.id
        
        if (!userId) {
          setError('Non connecté')
          setLoading(false)
          return
        }

        // Fetch user profile
        const profileResponse = await api.get(`/users/${userId}`)
        setProfile(profileResponse.data.user)

        // Fetch user's posts
        const postsResponse = await api.get(`/posts?author=${userId}&limit=10`)
        setPosts(postsResponse.data.posts || [])

        // Fetch user's events (organized)
        const eventsResponse = await api.get(`/events?organizer=${userId}&limit=10`)
        setEvents(eventsResponse.data.events || [])

      } catch (error) {
        console.error('Failed to fetch profile:', error)
        setError('Profil non trouvé')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id, currentUser])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Link to="/" className="btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'posts', label: 'Publications', count: posts.length, icon: DocumentTextIcon },
    { id: 'events', label: 'Événements', count: events.length, icon: CalendarIcon }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={`${profile.firstName} ${profile.lastName}`}
                className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 text-3xl md:text-4xl font-bold">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-gray-500 capitalize">{profile.role || 'Citoyen'}</p>
              </div>
              
              {isOwnProfile && (
                <Link 
                  to="/settings" 
                  className="btn-secondary flex items-center"
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-1" />
                  Paramètres
                </Link>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-600 mt-3">{profile.bio}</p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              {profile.email && isOwnProfile && (
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                  {profile.email}
                </div>
              )}
              {profile.location && (
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              )}
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Membre depuis {format(parseISO(profile.createdAt), 'MMMM yyyy', { locale: fr })}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div>
                <span className="font-bold text-gray-900">{posts.length}</span>
                <span className="text-gray-500 ml-1">publications</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{events.length}</span>
                <span className="text-gray-500 ml-1">événements</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center pb-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune publication</p>
              {isOwnProfile && (
                <Link to="/posts/create" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                  Créer votre première publication
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun événement organisé</p>
              {isOwnProfile && (
                <Link to="/events/create" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                  Créer votre premier événement
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

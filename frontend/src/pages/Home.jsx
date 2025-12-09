import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  NewspaperIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import api from '../services/api'
import PostCard from '../components/posts/PostCard'
import EventCard from '../components/events/EventCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const features = [
  {
    icon: NewspaperIcon,
    title: 'Actualités Locales',
    description: 'Restez informé des dernières nouvelles de votre municipalité.'
  },
  {
    icon: CalendarIcon,
    title: 'Événements',
    description: 'Découvrez les événements communautaires à venir.'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Discussions',
    description: 'Participez aux discussions avec vos voisins.'
  },
  {
    icon: BellAlertIcon,
    title: 'Alertes',
    description: 'Recevez les alertes importantes en temps réel.'
  }
]

export default function Home() {
  const [latestPosts, setLatestPosts] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, eventsRes] = await Promise.all([
          api.get('/posts?limit=6'),
          api.get('/events?limit=4&upcoming=true')
        ])
        setLatestPosts(postsRes.data.posts || [])
        setUpcomingEvents(eventsRes.data.events || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bienvenue sur SMMS
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Votre plateforme municipale pour rester connecté avec votre communauté.
              Accédez aux actualités, événements et discussions locales.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/posts" className="btn bg-white text-primary-600 hover:bg-gray-100">
                Voir les publications
              </Link>
              <Link to="/register" className="btn bg-primary-500 text-white hover:bg-primary-400">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-xl mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Dernières Publications
            </h2>
            <Link
              to="/posts"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir tout
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">
              Aucune publication pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Événements à Venir
            </h2>
            <Link
              to="/events"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir tout
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">
              Aucun événement prévu pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Rejoignez votre communauté
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Inscrivez-vous gratuitement pour participer aux discussions,
            recevoir les notifications et ne rien manquer de l'actualité locale.
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
            Créer un compte gratuit
          </Link>
        </div>
      </section>
    </div>
  )
}

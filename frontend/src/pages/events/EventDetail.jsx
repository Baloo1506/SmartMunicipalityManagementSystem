import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserGroupIcon,
  ClockIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { format, parseISO, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useAuthStore from '../../stores/authStore'

const categoryLabels = {
  community: 'Communauté',
  sports: 'Sports',
  culture: 'Culture',
  education: 'Éducation',
  health: 'Santé',
  government: 'Gouvernement',
  environment: 'Environnement'
}

const categoryColors = {
  community: 'bg-blue-100 text-blue-800',
  sports: 'bg-green-100 text-green-800',
  culture: 'bg-purple-100 text-purple-800',
  education: 'bg-yellow-100 text-yellow-800',
  health: 'bg-red-100 text-red-800',
  government: 'bg-gray-100 text-gray-800',
  environment: 'bg-teal-100 text-teal-800'
}

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/events/${id}`)
        setEvent(response.data.event)
      } catch (error) {
        console.error('Failed to fetch event:', error)
        setError('Événement non trouvé')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const isOrganizer = user && event && event.organizer?._id === user.id
  const isAdmin = user && user.role === 'admin'
  const canManage = isOrganizer || isAdmin
  const isAttending = user && event && event.attendees?.some(a => a._id === user.id)
  const eventPassed = event && isPast(parseISO(event.endDate || event.startDate))

  const handleAttend = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setActionLoading(true)
    try {
      await api.post(`/events/${id}/attend`)
      setEvent(prev => ({
        ...prev,
        attendees: [...(prev.attendees || []), { _id: user.id, firstName: user.firstName, lastName: user.lastName }]
      }))
    } catch (error) {
      console.error('Failed to attend event:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnattend = async () => {
    setActionLoading(true)
    try {
      await api.delete(`/events/${id}/attend`)
      setEvent(prev => ({
        ...prev,
        attendees: prev.attendees?.filter(a => a._id !== user.id) || []
      }))
    } catch (error) {
      console.error('Failed to unattend event:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return
    }

    try {
      await api.delete(`/events/${id}`)
      navigate('/events')
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

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
          <Link to="/events" className="btn-primary">
            Retour aux événements
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link 
        to="/events" 
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Retour aux événements
      </Link>

      <div className="card overflow-hidden">
        {/* Event Image */}
        {event.image && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[event.category] || 'bg-gray-100 text-gray-800'}`}>
                  {categoryLabels[event.category] || event.category}
                </span>
                {eventPassed && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-600">
                    Terminé
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {event.title}
              </h1>
            </div>

            {/* Admin Actions */}
            {canManage && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/events/${id}/edit`}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="h-5 w-5 mr-3 text-primary-500" />
              <div>
                <p className="font-medium">
                  {format(parseISO(event.startDate), "EEEE d MMMM yyyy", { locale: fr })}
                </p>
                {event.endDate && event.endDate !== event.startDate && (
                  <p className="text-sm text-gray-500">
                    au {format(parseISO(event.endDate), "d MMMM yyyy", { locale: fr })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <ClockIcon className="h-5 w-5 mr-3 text-primary-500" />
              <div>
                <p className="font-medium">
                  {format(parseISO(event.startDate), "HH:mm", { locale: fr })}
                </p>
                {event.endDate && (
                  <p className="text-sm text-gray-500">
                    jusqu'à {format(parseISO(event.endDate), "HH:mm", { locale: fr })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPinIcon className="h-5 w-5 mr-3 text-primary-500" />
              <p className="font-medium">{event.location}</p>
            </div>

            <div className="flex items-center text-gray-600">
              <UserGroupIcon className="h-5 w-5 mr-3 text-primary-500" />
              <p className="font-medium">
                {event.attendees?.length || 0} participant{event.attendees?.length !== 1 ? 's' : ''}
                {event.maxAttendees && (
                  <span className="text-gray-500"> / {event.maxAttendees} max</span>
                )}
              </p>
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-center mb-6 pb-6 border-b">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              {event.organizer?.avatar ? (
                <img 
                  src={event.organizer.avatar} 
                  alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-600 font-semibold">
                  {event.organizer?.firstName?.charAt(0)}{event.organizer?.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Organisé par</p>
              <p className="font-medium text-gray-900">
                {event.organizer?.firstName} {event.organizer?.lastName}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Action Button */}
          {!eventPassed && (
            <div className="flex justify-center">
              {isAttending ? (
                <button
                  onClick={handleUnattend}
                  disabled={actionLoading}
                  className="btn bg-red-100 text-red-700 hover:bg-red-200 flex items-center"
                >
                  {actionLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Annuler ma participation
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleAttend}
                  disabled={actionLoading || (event.maxAttendees && event.attendees?.length >= event.maxAttendees)}
                  className="btn-primary flex items-center"
                >
                  {actionLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Participer à cet événement
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Attendees List */}
          {event.attendees?.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Participants ({event.attendees.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {event.attendees.slice(0, 20).map((attendee) => (
                  <div
                    key={attendee._id}
                    className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary-200 flex items-center justify-center mr-2">
                      <span className="text-primary-700 text-xs font-medium">
                        {attendee.firstName?.charAt(0)}{attendee.lastName?.charAt(0)}
                      </span>
                    </div>
                    {attendee.firstName} {attendee.lastName}
                  </div>
                ))}
                {event.attendees.length > 20 && (
                  <span className="px-3 py-1 text-gray-500 text-sm">
                    +{event.attendees.length - 20} autres
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

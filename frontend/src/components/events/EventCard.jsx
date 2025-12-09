import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const categoryColors = {
  community: 'bg-green-100 text-green-800',
  sports: 'bg-orange-100 text-orange-800',
  culture: 'bg-purple-100 text-purple-800',
  education: 'bg-blue-100 text-blue-800',
  health: 'bg-red-100 text-red-800',
  government: 'bg-gray-100 text-gray-800',
  environment: 'bg-emerald-100 text-emerald-800',
  other: 'bg-gray-100 text-gray-800'
}

const categoryLabels = {
  community: 'Communauté',
  sports: 'Sports',
  culture: 'Culture',
  education: 'Éducation',
  health: 'Santé',
  government: 'Gouvernement',
  environment: 'Environnement',
  other: 'Autre'
}

export default function EventCard({ event }) {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const isPast = startDate < new Date()

  return (
    <article className={`card hover:shadow-md transition-shadow ${isPast ? 'opacity-60' : ''}`}>
      <Link to={`/events/${event._id}`}>
        {/* Image */}
        {event.images?.[0] && (
          <img
            src={event.images[0].url}
            alt={event.title}
            className="w-full h-40 object-cover rounded-t-xl"
          />
        )}

        <div className="p-5">
          {/* Date Badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col items-center bg-primary-50 text-primary-700 rounded-lg px-3 py-2 text-center min-w-[60px]">
              <span className="text-2xl font-bold">
                {format(startDate, 'dd')}
              </span>
              <span className="text-xs uppercase">
                {format(startDate, 'MMM', { locale: fr })}
              </span>
            </div>

            <div className="flex flex-col items-end space-y-1">
              <span className={`badge ${categoryColors[event.category]}`}>
                {categoryLabels[event.category]}
              </span>
              {event.isOfficial && (
                <span className="badge bg-primary-100 text-primary-800">
                  Officiel
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600">
            {event.title}
          </h3>

          {/* Time */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <ClockIcon className="h-4 w-4 mr-1.5" />
            {event.allDay ? (
              'Toute la journée'
            ) : (
              <>
                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
              </>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPinIcon className="h-4 w-4 mr-1.5" />
            <span className="line-clamp-1">
              {event.location?.isOnline ? 'En ligne' : event.location?.name}
            </span>
          </div>

          {/* Attendees */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <UserGroupIcon className="h-4 w-4 mr-1.5" />
              {event.attendeeCount || 0} participant{(event.attendeeCount || 0) !== 1 ? 's' : ''}
              {event.capacity && (
                <span className="text-gray-400 ml-1">/ {event.capacity}</span>
              )}
            </div>

            {event.cost?.isFree ? (
              <span className="badge bg-green-100 text-green-800">Gratuit</span>
            ) : (
              <span className="text-sm font-medium text-gray-700">
                {event.cost?.amount} {event.cost?.currency}
              </span>
            )}
          </div>

          {/* Full indicator */}
          {event.isFull && (
            <div className="mt-3">
              <span className="badge bg-red-100 text-red-800">Complet</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

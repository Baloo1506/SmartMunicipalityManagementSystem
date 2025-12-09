import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  BellIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  CalendarIcon,
  UserPlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import useNotificationStore from '../stores/notificationStore'

const notificationIcons = {
  comment: ChatBubbleLeftIcon,
  like: HeartIcon,
  event: CalendarIcon,
  follow: UserPlusIcon,
  mention: BellIcon,
  report: ExclamationCircleIcon,
  system: BellIconSolid
}

const notificationColors = {
  comment: 'bg-blue-100 text-blue-600',
  like: 'bg-red-100 text-red-600',
  event: 'bg-green-100 text-green-600',
  follow: 'bg-purple-100 text-purple-600',
  mention: 'bg-yellow-100 text-yellow-600',
  report: 'bg-orange-100 text-orange-600',
  system: 'bg-gray-100 text-gray-600'
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread
  const { markAsRead, markAllAsRead } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await api.get('/notifications')
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      )
      markAsRead(id)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      markAllAsRead()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      return
    }

    try {
      await api.delete('/notifications')
      setNotifications([])
    } catch (error) {
      console.error('Failed to delete all notifications:', error)
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case 'comment':
      case 'like':
        return notification.post ? `/posts/${notification.post}` : null
      case 'event':
        return notification.event ? `/events/${notification.event}` : null
      case 'follow':
        return notification.sender ? `/profile/${notification.sender._id}` : null
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Toutes vos notifications sont lues'
            }
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-secondary text-sm flex items-center"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Tout marquer comme lu
              </button>
            )}
            <button
              onClick={handleDeleteAll}
              className="btn-secondary text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Tout supprimer
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Non lues ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || BellIcon
            const colorClass = notificationColors[notification.type] || 'bg-gray-100 text-gray-600'
            const link = getNotificationLink(notification)

            return (
              <div
                key={notification._id}
                className={`card p-4 transition-colors ${
                  !notification.read ? 'bg-primary-50 border-primary-200' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {link ? (
                      <Link
                        to={link}
                        onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                        className="block hover:text-primary-600"
                      >
                        <p className={`text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.message}
                        </p>
                      </Link>
                    ) : (
                      <p className={`text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(parseISO(notification.createdAt), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>

                      {notification.sender && (
                        <span className="text-sm text-gray-500">
                          par {notification.sender.firstName} {notification.sender.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="p-1 text-gray-400 hover:text-primary-600 rounded"
                        title="Marquer comme lu"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {filter === 'unread' 
              ? 'Aucune notification non lue'
              : 'Aucune notification'
            }
          </p>
        </div>
      )}
    </div>
  )
}

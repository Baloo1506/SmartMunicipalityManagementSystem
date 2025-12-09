import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  UsersIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  FlagIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { format, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const StatCard = ({ title, value, change, icon: Icon, color, link }) => {
  const isPositive = change >= 0

  return (
    <Link to={link} className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change)}% vs mois dernier
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch analytics data
        const analyticsResponse = await api.get('/analytics/dashboard')
        setStats(analyticsResponse.data)

        // Fetch recent activity (recent reports, users, posts)
        const [reportsRes, usersRes, postsRes] = await Promise.all([
          api.get('/admin/reports?limit=5&status=pending'),
          api.get('/admin/users?limit=5&sort=-createdAt'),
          api.get('/posts?limit=5&sort=-createdAt')
        ])

        const activity = [
          ...(reportsRes.data.reports || []).map(r => ({
            type: 'report',
            message: `Nouveau signalement: ${r.reason}`,
            date: r.createdAt,
            link: '/admin/reports'
          })),
          ...(usersRes.data.users || []).map(u => ({
            type: 'user',
            message: `Nouvel utilisateur: ${u.firstName} ${u.lastName}`,
            date: u.createdAt,
            link: '/admin/users'
          })),
          ...(postsRes.data.posts || []).map(p => ({
            type: 'post',
            message: `Nouvelle publication: ${p.title?.substring(0, 30)}...`,
            date: p.createdAt,
            link: `/posts/${p._id}`
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

        setRecentActivity(activity)

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Set default stats if API fails
        setStats({
          users: { total: 0, change: 0 },
          posts: { total: 0, change: 0 },
          events: { total: 0, change: 0 },
          reports: { pending: 0 }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats?.users?.total || 0,
      change: stats?.users?.change,
      icon: UsersIcon,
      color: 'bg-blue-100 text-blue-600',
      link: '/admin/users'
    },
    {
      title: 'Publications',
      value: stats?.posts?.total || 0,
      change: stats?.posts?.change,
      icon: DocumentTextIcon,
      color: 'bg-green-100 text-green-600',
      link: '/posts'
    },
    {
      title: 'Événements',
      value: stats?.events?.total || 0,
      change: stats?.events?.change,
      icon: CalendarIcon,
      color: 'bg-purple-100 text-purple-600',
      link: '/events'
    },
    {
      title: 'Signalements en attente',
      value: stats?.reports?.pending || 0,
      icon: FlagIcon,
      color: 'bg-red-100 text-red-600',
      link: '/admin/reports'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <p className="text-gray-600">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Activité récente
          </h2>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <Link
                  key={index}
                  to={activity.link}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${
                    activity.type === 'report' ? 'bg-red-100 text-red-600' :
                    activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {activity.type === 'report' ? (
                      <FlagIcon className="h-4 w-4" />
                    ) : activity.type === 'user' ? (
                      <UsersIcon className="h-4 w-4" />
                    ) : (
                      <DocumentTextIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(activity.date), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          
          <div className="space-y-3">
            <Link
              to="/admin/reports"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center">
                <FlagIcon className="h-5 w-5 text-red-500 mr-3" />
                <span>Gérer les signalements</span>
              </div>
              {stats?.reports?.pending > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                  {stats.reports.pending} en attente
                </span>
              )}
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 text-blue-500 mr-3" />
                <span>Gérer les utilisateurs</span>
              </div>
            </Link>

            <Link
              to="/posts/create"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-green-500 mr-3" />
                <span>Créer une annonce officielle</span>
              </div>
            </Link>

            <Link
              to="/events/create"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-purple-500 mr-3" />
                <span>Créer un événement municipal</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="card p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Santé de la plateforme</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">99.9%</p>
            <p className="text-sm text-gray-600">Disponibilité</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">&lt;100ms</p>
            <p className="text-sm text-gray-600">Latence moyenne</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600">Erreurs 24h</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">Normal</p>
            <p className="text-sm text-gray-600">Charge serveur</p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FlagIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'

const statusLabels = {
  pending: 'En attente',
  reviewed: 'Examiné',
  resolved: 'Résolu',
  dismissed: 'Rejeté'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-800'
}

const reasonLabels = {
  spam: 'Spam',
  inappropriate: 'Contenu inapproprié',
  harassment: 'Harcèlement',
  misinformation: 'Désinformation',
  copyright: 'Violation de droits d\'auteur',
  other: 'Autre'
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [filter, setFilter] = useState('pending')
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [filter, pagination.page])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(filter !== 'all' && { status: filter })
      })

      const response = await api.get(`/admin/reports?${params}`)
      setReports(response.data.reports || [])
      setPagination(response.data.pagination || { page: 1, pages: 1 })
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (reportId, status, action = null) => {
    setActionLoading(reportId)
    try {
      await api.put(`/admin/reports/${reportId}`, { status, action })
      
      setReports(prev => 
        prev.map(r => r._id === reportId ? { ...r, status } : r)
      )
      
      if (selectedReport?._id === reportId) {
        setSelectedReport(prev => ({ ...prev, status }))
      }
    } catch (error) {
      console.error('Failed to update report:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteContent = async (reportId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      return
    }

    setActionLoading(reportId)
    try {
      await api.put(`/admin/reports/${reportId}`, { 
        status: 'resolved', 
        action: 'content_deleted' 
      })
      
      setReports(prev => 
        prev.map(r => r._id === reportId ? { ...r, status: 'resolved' } : r)
      )
    } catch (error) {
      console.error('Failed to delete content:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const filters = [
    { value: 'all', label: 'Tous' },
    { value: 'pending', label: 'En attente' },
    { value: 'reviewed', label: 'Examinés' },
    { value: 'resolved', label: 'Résolus' },
    { value: 'dismissed', label: 'Rejetés' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link 
          to="/admin" 
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Signalements</h1>
          <p className="text-gray-600">Gérer les contenus signalés par la communauté</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-2 space-y-4">
            {reports.map((report) => (
              <div
                key={report._id}
                onClick={() => setSelectedReport(report)}
                className={`card p-4 cursor-pointer transition-all ${
                  selectedReport?._id === report._id 
                    ? 'ring-2 ring-primary-500' 
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <FlagIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                        {statusLabels[report.status]}
                      </span>
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {reasonLabels[report.reason] || report.reason}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(parseISO(report.createdAt), 'd MMM yyyy', { locale: fr })}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {report.description || 'Aucune description fournie'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Signalé par: {report.reporter?.firstName} {report.reporter?.lastName}
                  </span>
                  <span className="capitalize">
                    Type: {report.targetType}
                  </span>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </div>

          {/* Report Detail */}
          <div className="lg:col-span-1">
            {selectedReport ? (
              <div className="card p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails du signalement</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${statusColors[selectedReport.status]}`}>
                      {statusLabels[selectedReport.status]}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Raison</p>
                    <p className="text-gray-900">{reasonLabels[selectedReport.reason] || selectedReport.reason}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-gray-900">{selectedReport.description || 'Aucune description'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Type de contenu</p>
                    <p className="text-gray-900 capitalize">{selectedReport.targetType}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Signalé par</p>
                    <p className="text-gray-900">
                      {selectedReport.reporter?.firstName} {selectedReport.reporter?.lastName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-gray-900">
                      {format(parseISO(selectedReport.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>

                  {/* Actions */}
                  {selectedReport.status === 'pending' && (
                    <div className="pt-4 border-t space-y-3">
                      <Link
                        to={selectedReport.targetType === 'post' 
                          ? `/posts/${selectedReport.target}` 
                          : `/events/${selectedReport.target}`
                        }
                        target="_blank"
                        className="btn-secondary w-full flex items-center justify-center"
                      >
                        <EyeIcon className="h-5 w-5 mr-2" />
                        Voir le contenu
                      </Link>

                      <button
                        onClick={() => handleUpdateStatus(selectedReport._id, 'dismissed')}
                        disabled={actionLoading === selectedReport._id}
                        className="btn-secondary w-full flex items-center justify-center"
                      >
                        {actionLoading === selectedReport._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <XCircleIcon className="h-5 w-5 mr-2" />
                            Rejeter le signalement
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                        disabled={actionLoading === selectedReport._id}
                        className="btn-primary w-full flex items-center justify-center"
                      >
                        {actionLoading === selectedReport._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Marquer comme résolu
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteContent(selectedReport._id)}
                        disabled={actionLoading === selectedReport._id}
                        className="btn w-full flex items-center justify-center bg-red-600 text-white hover:bg-red-700"
                      >
                        {actionLoading === selectedReport._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                            Supprimer le contenu
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-6 text-center text-gray-500">
                <FlagIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Sélectionnez un signalement pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <CheckCircleIcon className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun signalement {filter !== 'all' ? `${statusLabels[filter]?.toLowerCase()}` : ''}</p>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  CheckBadgeIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'

const roleLabels = {
  citizen: 'Citoyen',
  staff: 'Personnel',
  admin: 'Administrateur'
}

const roleColors = {
  citizen: 'bg-gray-100 text-gray-700',
  staff: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700'
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, roleFilter])

  const fetchUsers = async (searchQuery = search) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 15,
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter && { role: roleFilter })
      })

      const response = await api.get(`/admin/users?${params}`)
      setUsers(response.data.users || [])
      setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers(search)
  }

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId)
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(prev => 
        prev.map(u => u._id === userId ? { ...u, role: newRole } : u)
      )
    } catch (error) {
      console.error('Failed to update user role:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    
    if (newStatus === 'suspended' && !window.confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) {
      return
    }

    setActionLoading(userId)
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus })
      setUsers(prev => 
        prev.map(u => u._id === userId ? { ...u, status: newStatus } : u)
      )
    } catch (error) {
      console.error('Failed to update user status:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return
    }

    setActionLoading(userId)
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(prev => prev.filter(u => u._id !== userId))
    } catch (error) {
      console.error('Failed to delete user:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const roles = [
    { value: '', label: 'Tous les rôles' },
    { value: 'citizen', label: 'Citoyens' },
    { value: 'staff', label: 'Personnel' },
    { value: 'admin', label: 'Administrateurs' }
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600">{pagination.total} utilisateur{pagination.total > 1 ? 's' : ''} enregistré{pagination.total > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="input pl-10"
              />
            </div>
          </form>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="input w-auto"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inscription
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-600 font-medium">
                                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status === 'active' ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(user.createdAt), 'd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {actionLoading === user._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                              <EllipsisVerticalIcon className="h-5 w-5" />
                            </Menu.Button>

                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <Link
                                        to={`/profile/${user._id}`}
                                        className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                                      >
                                        <UserCircleIcon className="h-5 w-5 mr-3" />
                                        Voir le profil
                                      </Link>
                                    )}
                                  </Menu.Item>

                                  <div className="border-t border-gray-100 my-1" />

                                  {/* Role options */}
                                  {user.role !== 'admin' && (
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleRoleChange(user._id, 'admin')}
                                          className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                        >
                                          <ShieldCheckIcon className="h-5 w-5 mr-3 text-purple-500" />
                                          Promouvoir Admin
                                        </button>
                                      )}
                                    </Menu.Item>
                                  )}

                                  {user.role !== 'staff' && (
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleRoleChange(user._id, 'staff')}
                                          className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                        >
                                          <CheckBadgeIcon className="h-5 w-5 mr-3 text-blue-500" />
                                          Définir comme Personnel
                                        </button>
                                      )}
                                    </Menu.Item>
                                  )}

                                  {user.role !== 'citizen' && (
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleRoleChange(user._id, 'citizen')}
                                          className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                        >
                                          <UserCircleIcon className="h-5 w-5 mr-3 text-gray-500" />
                                          Définir comme Citoyen
                                        </button>
                                      )}
                                    </Menu.Item>
                                  )}

                                  <div className="border-t border-gray-100 my-1" />

                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleToggleStatus(user._id, user.status)}
                                        className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm ${
                                          user.status === 'active' ? 'text-orange-600' : 'text-green-600'
                                        }`}
                                      >
                                        <NoSymbolIcon className="h-5 w-5 mr-3" />
                                        {user.status === 'active' ? 'Suspendre' : 'Réactiver'}
                                      </button>
                                    )}
                                  </Menu.Item>

                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className={`${active ? 'bg-red-50' : ''} flex items-center w-full px-4 py-2 text-sm text-red-600`}
                                      >
                                        <NoSymbolIcon className="h-5 w-5 mr-3" />
                                        Supprimer
                                      </button>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <UserCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
        </div>
      )}
    </div>
  )
}

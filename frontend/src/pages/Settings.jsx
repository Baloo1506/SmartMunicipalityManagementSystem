import { useState } from 'react'
import { 
  UserIcon, 
  LockClosedIcon, 
  BellIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import useAuthStore from '../stores/authStore'

export default function Settings() {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    avatar: user?.avatar || ''
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    commentNotifications: true,
    eventNotifications: true
  })

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings(prev => ({ ...prev, [name]: checked }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await api.put('/users/profile', profileData)
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à jour' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' })
      setLoading(false)
      return
    }

    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Failed to change password:', error)
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors du changement de mot de passe' })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await api.put('/users/notifications', notificationSettings)
      setMessage({ type: 'success', text: 'Préférences de notification mises à jour' })
    } catch (error) {
      console.error('Failed to update notifications:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des préférences' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return
    }

    const confirmation = window.prompt('Tapez "SUPPRIMER" pour confirmer la suppression de votre compte:')
    if (confirmation !== 'SUPPRIMER') {
      return
    }

    try {
      await api.delete('/users/account')
      logout()
    } catch (error) {
      console.error('Failed to delete account:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du compte' })
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: UserIcon },
    { id: 'password', label: 'Sécurité', icon: LockClosedIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'danger', label: 'Zone Danger', icon: ExclamationTriangleIcon }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Paramètres</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setMessage({ type: '', text: '' })
                }}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${tab.id === 'danger' ? 'text-red-600 hover:bg-red-50' : ''}`}
              >
                <tab.icon className={`h-5 w-5 mr-3 ${tab.id === 'danger' ? 'text-red-500' : ''}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Message */}
          {message.text && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations du profil</h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    rows={3}
                    className="input resize-none"
                    placeholder="Parlez un peu de vous..."
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    className="input"
                    placeholder="Votre ville ou quartier"
                  />
                </div>

                <div>
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                    Photo de profil (URL)
                  </label>
                  <input
                    type="url"
                    id="avatar"
                    name="avatar"
                    value={profileData.avatar}
                    onChange={handleProfileChange}
                    className="input"
                    placeholder="https://exemple.com/photo.jpg"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <LoadingSpinner size="sm" /> : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Changer le mot de passe</h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="input"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <LoadingSpinner size="sm" /> : 'Changer le mot de passe'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Préférences de notification</h2>
              
              <form onSubmit={handleNotificationSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Notifications par email</span>
                      <p className="text-sm text-gray-500">Recevoir des résumés par email</p>
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Notifications push</span>
                      <p className="text-sm text-gray-500">Notifications en temps réel dans l'application</p>
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="commentNotifications"
                      checked={notificationSettings.commentNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Commentaires</span>
                      <p className="text-sm text-gray-500">Notification quand quelqu'un commente vos publications</p>
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="eventNotifications"
                      checked={notificationSettings.eventNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Événements</span>
                      <p className="text-sm text-gray-500">Rappels pour les événements auxquels vous participez</p>
                    </span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <LoadingSpinner size="sm" /> : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="card p-6 border-red-200">
              <h2 className="text-lg font-semibold text-red-600 mb-6 flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                Zone Danger
              </h2>
              
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">Supprimer le compte</h3>
                <p className="text-sm text-red-700 mb-4">
                  Une fois votre compte supprimé, toutes vos données seront définitivement effacées.
                  Cette action est irréversible.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const categories = [
  { value: 'community', label: 'Communauté' },
  { value: 'sports', label: 'Sports' },
  { value: 'culture', label: 'Culture' },
  { value: 'education', label: 'Éducation' },
  { value: 'health', label: 'Santé' },
  { value: 'government', label: 'Gouvernement' },
  { value: 'environment', label: 'Environnement' }
]

export default function CreateEvent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'community',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    maxAttendees: '',
    image: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Combine date and time
      const startDateTime = `${formData.startDate}T${formData.startTime}`
      const endDateTime = formData.endDate && formData.endTime 
        ? `${formData.endDate}T${formData.endTime}`
        : startDateTime

      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        startDate: startDateTime,
        endDate: endDateTime,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        image: formData.image || undefined
      }

      const response = await api.post('/events', eventData)
      navigate(`/events/${response.data.event._id}`)
    } catch (error) {
      console.error('Failed to create event:', error)
      setError(error.response?.data?.message || 'Erreur lors de la création de l\'événement')
    } finally {
      setLoading(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link 
        to="/events" 
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Retour aux événements
      </Link>

      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Créer un événement</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre de l'événement *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={100}
              className="input"
              placeholder="Ex: Fête de quartier annuelle"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="input"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="input resize-none"
              placeholder="Décrivez votre événement en détail..."
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Lieu *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="input"
              placeholder="Ex: Place de la Mairie, 123 Rue Principale"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                min={today}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Heure de début *
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || today}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                Heure de fin
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Max Attendees */}
          <div>
            <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre maximum de participants
            </label>
            <input
              type="number"
              id="maxAttendees"
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              min="1"
              className="input"
              placeholder="Laisser vide pour illimité"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image de couverture (URL)
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <PhotoIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="https://exemple.com/image.jpg"
                />
              </div>
            </div>
            {formData.image && (
              <div className="mt-3">
                <img 
                  src={formData.image} 
                  alt="Aperçu" 
                  className="h-32 w-full object-cover rounded-lg"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Link to="/events" className="btn-secondary">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[150px]"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

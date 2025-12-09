import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'

const categories = [
  { value: 'news', label: 'Actualité' },
  { value: 'announcement', label: 'Annonce' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'alert', label: 'Alerte' }
]

export default function CreatePost() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'discussion',
    tags: '',
    location: {
      city: '',
      region: ''
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('location.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      }

      const response = await api.post('/posts', postData)
      toast.success('Publication créée avec succès!')
      navigate(`/posts/${response.data.data._id}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Nouvelle Publication
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="Titre de votre publication"
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
            className="input"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Contenu *
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            value={formData.content}
            onChange={handleChange}
            className="input resize-none"
            placeholder="Écrivez votre publication..."
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={formData.tags}
            onChange={handleChange}
            className="input"
            placeholder="tag1, tag2, tag3"
          />
          <p className="mt-1 text-sm text-gray-500">Séparez les tags par des virgules</p>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-1">
              Ville
            </label>
            <input
              id="location.city"
              name="location.city"
              type="text"
              value={formData.location.city}
              onChange={handleChange}
              className="input"
              placeholder="Paris"
            />
          </div>
          <div>
            <label htmlFor="location.region" className="block text-sm font-medium text-gray-700 mb-1">
              Région
            </label>
            <input
              id="location.region"
              name="location.region"
              type="text"
              value={formData.location.region}
              onChange={handleChange}
              className="input"
              placeholder="Île-de-France"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-outline"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50"
          >
            {isSubmitting ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </form>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ChatBubbleLeftIcon,
  EyeIcon,
  HandThumbUpIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

const categoryColors = {
  news: 'bg-blue-100 text-blue-800',
  announcement: 'bg-purple-100 text-purple-800',
  discussion: 'bg-green-100 text-green-800',
  alert: 'bg-red-100 text-red-800',
  event: 'bg-orange-100 text-orange-800'
}

const categoryLabels = {
  news: 'Actualité',
  announcement: 'Annonce',
  discussion: 'Discussion',
  alert: 'Alerte',
  event: 'Événement'
}

export default function PostCard({ post }) {
  return (
    <article className="card hover:shadow-md transition-shadow">
      <Link to={`/posts/${post._id}`}>
        {/* Image */}
        {post.images?.[0] && (
          <img
            src={post.images[0].url}
            alt={post.images[0].caption || post.title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
        )}

        <div className="p-5">
          {/* Category & Official Badge */}
          <div className="flex items-center space-x-2 mb-3">
            <span className={`badge ${categoryColors[post.category]}`}>
              {categoryLabels[post.category]}
            </span>
            {post.isOfficial && (
              <span className="badge bg-primary-100 text-primary-800">
                Officiel
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Location */}
          {post.location?.city && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {post.location.city}
            </div>
          )}

          {/* Author & Date */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
              </div>
              <span className="ml-2">
                {post.author?.firstName} {post.author?.lastName}
              </span>
            </div>
            <span>
              {format(new Date(post.publishedAt || post.createdAt), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
            <span className="flex items-center">
              <HandThumbUpIcon className="h-4 w-4 mr-1" />
              {post.voteScore || 0}
            </span>
            <span className="flex items-center">
              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
              {post.commentCount || 0}
            </span>
            <span className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              {post.viewCount || 0}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

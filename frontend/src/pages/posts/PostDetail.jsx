import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeftIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  FlagIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useAuthStore from '../../stores/authStore'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userVote, setUserVote] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/comments/post/${id}`)
        ])
        setPost(postRes.data.data)
        setComments(commentsRes.data.comments || [])

        // Check user's vote
        if (user) {
          const post = postRes.data.data
          if (post.votes?.up?.includes(user._id)) setUserVote('up')
          else if (post.votes?.down?.includes(user._id)) setUserVote('down')
        }
      } catch (error) {
        toast.error('Publication introuvable')
        navigate('/posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, navigate, user])

  const handleVote = async (type) => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour voter')
      return
    }

    try {
      const newType = userVote === type ? 'none' : type
      const response = await api.post(`/posts/${id}/vote`, { type: newType })
      setPost(prev => ({
        ...prev,
        voteScore: response.data.data.voteScore,
        votes: {
          up: Array(response.data.data.upvotes).fill(null),
          down: Array(response.data.data.downvotes).fill(null)
        }
      }))
      setUserVote(newType === 'none' ? null : newType)
    } catch (error) {
      toast.error('Erreur lors du vote')
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    setSubmitting(true)
    try {
      const response = await api.post(`/comments/${id}`, { content: commentContent })
      setComments(prev => [{ ...response.data.data, replies: [] }, ...prev])
      setCommentContent('')
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }))
      toast.success('Commentaire ajouté')
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du commentaire')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/posts"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Retour aux publications
      </Link>

      {/* Post */}
      <article className="card">
        {/* Header Image */}
        {post.images?.[0] && (
          <img
            src={post.images[0].url}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-t-xl"
          />
        )}

        <div className="p-6 md:p-8">
          {/* Category & Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="badge bg-primary-100 text-primary-800">
              {post.category}
            </span>
            {post.isOfficial && (
              <span className="badge bg-green-100 text-green-800">Officiel</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Author & Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-6 border-b">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">
                  {post.author?.firstName} {post.author?.lastName}
                </p>
                <p>
                  {format(new Date(post.publishedAt || post.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </p>
              </div>
            </div>

            {post.location?.city && (
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {post.location.city}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-8">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleVote('up')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  userVote === 'up' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
                }`}
              >
                {userVote === 'up' ? (
                  <HandThumbUpSolidIcon className="h-5 w-5" />
                ) : (
                  <HandThumbUpIcon className="h-5 w-5" />
                )}
                <span>{post.votes?.up?.length || 0}</span>
              </button>

              <button
                onClick={() => handleVote('down')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  userVote === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
                }`}
              >
                {userVote === 'down' ? (
                  <HandThumbDownSolidIcon className="h-5 w-5" />
                ) : (
                  <HandThumbDownIcon className="h-5 w-5" />
                )}
                <span>{post.votes?.down?.length || 0}</span>
              </button>

              <span className="flex items-center text-gray-500">
                <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                {post.commentCount || 0}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ShareIcon className="h-5 w-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FlagIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Commentaires ({comments.length})
        </h2>

        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleComment} className="card p-4 mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Ajouter un commentaire..."
              rows={3}
              className="input resize-none mb-3"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !commentContent.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Envoi...' : 'Commenter'}
              </button>
            </div>
          </form>
        ) : (
          <div className="card p-4 mb-6 text-center">
            <p className="text-gray-600">
              <Link to="/login" className="text-primary-600 hover:underline">
                Connectez-vous
              </Link>{' '}
              pour commenter
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="card p-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm">
                  {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {comment.author?.firstName} {comment.author?.lastName}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(comment.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1">{comment.content}</p>
                </div>
              </div>

              {/* Replies */}
              {comment.replies?.length > 0 && (
                <div className="ml-11 mt-4 space-y-3 border-l-2 border-gray-100 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="flex items-start">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-xs">
                        {reply.author?.firstName?.[0]}
                      </div>
                      <div className="ml-2">
                        <span className="font-medium text-sm text-gray-900">
                          {reply.author?.firstName}
                        </span>
                        <p className="text-gray-700 text-sm">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Aucun commentaire pour le moment
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

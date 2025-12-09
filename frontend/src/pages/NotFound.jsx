import { Link } from 'react-router-dom'
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-primary-200">404</h1>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          Vérifiez l'URL ou retournez à l'accueil.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center justify-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Page précédente
          </button>
        </div>

        {/* Search suggestion */}
        <div className="mt-12 pt-8 border-t border-gray-200 max-w-md mx-auto">
          <p className="text-sm text-gray-500 mb-4">
            Vous cherchez quelque chose de précis ?
          </p>
          <div className="flex gap-4 justify-center text-sm">
            <Link to="/posts" className="text-primary-600 hover:text-primary-700 flex items-center">
              <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
              Publications
            </Link>
            <Link to="/events" className="text-primary-600 hover:text-primary-700 flex items-center">
              <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
              Événements
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

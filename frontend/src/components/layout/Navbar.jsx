import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  NewspaperIcon,
  CalendarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import useAuthStore from '../../stores/authStore'
import useNotificationStore from '../../stores/notificationStore'

const navigation = [
  { name: 'Accueil', href: '/', icon: HomeIcon },
  { name: 'Publications', href: '/posts', icon: NewspaperIcon },
  { name: 'Événements', href: '/events', icon: CalendarIcon },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { unreadCount, fetchNotifications } = useNotificationStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    }
  }, [isAuthenticated, fetchNotifications])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">SMMS</span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <item.icon className="h-5 w-5 mr-1.5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="hidden md:block text-sm font-medium">
                      {user?.firstName}
                    </span>
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
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } flex items-center px-4 py-2 text-sm text-gray-700`}
                            >
                              <UserCircleIcon className="h-5 w-5 mr-2" />
                              Mon Profil
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/settings"
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } flex items-center px-4 py-2 text-sm text-gray-700`}
                            >
                              <Cog6ToothIcon className="h-5 w-5 mr-2" />
                              Paramètres
                            </Link>
                          )}
                        </Menu.Item>
                        
                        {user?.role === 'admin' && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin"
                                className={`${
                                  active ? 'bg-gray-50' : ''
                                } flex items-center px-4 py-2 text-sm text-gray-700`}
                              >
                                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                                Administration
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        
                        <hr className="my-1" />
                        
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                            >
                              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                              Déconnexion
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-outline text-sm">
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2 text-gray-600 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

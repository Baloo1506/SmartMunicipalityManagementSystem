import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

export default function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Check if staff can access admin routes
    if (requiredRole === 'admin' && user?.role === 'staff') {
      return <Outlet />
    }
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Posts from './pages/posts/Posts'
import PostDetail from './pages/posts/PostDetail'
import CreatePost from './pages/posts/CreatePost'
import Events from './pages/events/Events'
import EventDetail from './pages/events/EventDetail'
import CreateEvent from './pages/events/CreateEvent'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import AdminDashboard from './pages/admin/Dashboard'
import AdminReports from './pages/admin/Reports'
import AdminUsers from './pages/admin/Users'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="posts" element={<Posts />} />
          <Route path="posts/:id" element={<PostDetail />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          
          {/* Protected Routes - Require Auth */}
          <Route element={<ProtectedRoute />}>
            <Route path="posts/create" element={<CreatePost />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/reports" element={<AdminReports />} />
            <Route path="admin/users" element={<AdminUsers />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AllBooks from './pages/AllBooks.jsx'
import MyBooks from './pages/MyBooks.jsx'
import OTPVerify from './pages/OTPVerify.jsx'
import Profile from './pages/Profile.jsx'
import ExchangeHub from './pages/ExchangeHub.jsx'
import Users from './pages/Users.jsx'
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx'
import Layout from './components/Layout.jsx'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/verify-otp" element={<OTPVerify />} />
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/books" element={<ProtectedRoute><Layout><AllBooks /></Layout></ProtectedRoute>} />
            <Route path="/my-books" element={
              <RoleProtectedRoute allowedRoles={['admin', 'librarian']}>
                <ProtectedRoute><Layout><MyBooks /></Layout></ProtectedRoute>
              </RoleProtectedRoute>
            } />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/exchange-hub" element={<ProtectedRoute><Layout><ExchangeHub /></Layout></ProtectedRoute>} />
            <Route path="/users" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>
              </RoleProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App

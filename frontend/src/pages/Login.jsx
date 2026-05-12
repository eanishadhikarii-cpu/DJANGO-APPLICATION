import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { UserIcon, LockClosedIcon, BookOpenIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.password) newErrors.password = 'Password is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { data } = await api.post('/auth/login/', formData)
      login(data)
      toast.success('Logged in successfully')
      navigate('/')
    } catch (err) {
      if (err.response?.data?.error) {
        setErrors({ form: err.response.data.error })
      } else if (err.response?.data?.non_field_errors) {
        setErrors({ form: err.response.data.non_field_errors[0] })
      } else {
        toast.error('Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: null, form: null })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10 m-4">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-white/20 p-8 sm:p-10 transform transition-all hover:scale-[1.01] duration-500">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 mb-4 shadow-lg shadow-cyan-500/30 transform hover:rotate-12 transition-transform duration-300">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
            <p className="text-cyan-100/80 mt-2 font-medium">Log in to your account.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {/* Hidden fields to prevent aggressive browser autofill */}
            <input type="text" name="hidden_username" style={{ display: 'none' }} autoComplete="username" />
            <input type="password" name="hidden_password" style={{ display: 'none' }} autoComplete="current-password" />
            
            {errors.form && <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl text-sm font-medium">{errors.form}</div>}
            
            {/* Username */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-white/50 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                name="username"
                type="text"
                placeholder="Username"
                className={`w-full pl-11 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:bg-white/10 transition-all duration-300 ${errors.username ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:ring-cyan-400/50 focus:border-cyan-400/50'}`}
                value={formData.username}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-white/50 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                className={`w-full pl-11 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:bg-white/10 transition-all duration-300 ${errors.password ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:ring-cyan-400/50 focus:border-cyan-400/50'}`}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-[#0f172a] shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/70">
              Don't have an account? {' '}
              <Link to="/register" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors drop-shadow-md">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

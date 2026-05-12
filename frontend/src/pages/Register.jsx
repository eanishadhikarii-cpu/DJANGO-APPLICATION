import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { UserIcon, EnvelopeIcon, MapPinIcon, LockClosedIcon, BookOpenIcon } from '@heroicons/react/24/outline'

export default function Register() {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    password2: '', 
    city: '',
    role: 'user'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format'
    
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    
    if (formData.password !== formData.password2) newErrors.password2 = 'Passwords do not match'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      // Force role='user' on signup
      await api.post('/auth/register/', { ...formData, role: 'user' })

      // Send OTP immediately after registration
      await api.post('/send-otp/', { email: formData.email })
      toast.success('Account created! Please verify your email.')
      // Redirect to OTP page with the email pre-filled
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      if (err.response?.data?.error) {
        setErrors({ form: err.response.data.error })
      } else {
        toast.error('Registration failed')
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
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-white/20 p-8 sm:p-10 transform transition-all hover:scale-[1.01] duration-500 overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          
          <div className="relative text-center mb-6">
            <div className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 mb-3 shadow-lg shadow-cyan-500/30 transform hover:rotate-12 transition-transform duration-300 border border-white/20">
              <BookOpenIcon className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">Create your account</h2>
            <p className="text-sm font-medium text-white/70 mt-1">Sign up as a normal user — admins can assign librarian role later.</p>
          </div>


          <form className="space-y-3" onSubmit={handleSubmit} autoComplete="off">
            {/* Hidden fields to prevent aggressive browser autofill */}
            <input type="text" name="hidden_username" style={{ display: 'none' }} autoComplete="username" />
            <input type="email" name="hidden_email" style={{ display: 'none' }} autoComplete="email" />
            <input type="password" name="hidden_password" style={{ display: 'none' }} autoComplete="new-password" />

            {errors.form && <div className="p-2.5 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl text-xs font-medium text-center">{errors.form}</div>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Username */}
              <div className="relative group">
                <input
                  name="username"
                  type="text"
                  placeholder="Username"
                  className={`w-full pl-4 pr-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:bg-white/10 transition-all duration-300 ${errors.username ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-cyan-400/50'}`}
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="off"
                />
                {errors.username && <p className="mt-1 text-[10px] text-red-400">{errors.username}</p>}
              </div>

              {/* Email */}
              <div className="relative group">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className={`w-full pl-4 pr-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:bg-white/10 transition-all duration-300 ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-cyan-400/50'}`}
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                />
                {errors.email && <p className="mt-1 text-[10px] text-red-400">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* City */}
              <div className="relative group">
                <input
                  name="city"
                  type="text"
                  placeholder="City"
                  className="w-full pl-4 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:bg-white/10 transition-all duration-300"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              {/* Role is fixed for self-signup (normal users only). */}
              <div className="relative group">
                <input
                  type="text"
                  value="User"
                  readOnly
                  className="w-full pl-4 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:bg-white/10 transition-all duration-300"
                />
                <input type="hidden" name="role" value="user" />
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password */}
              <div className="relative group">
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className={`w-full pl-4 pr-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:bg-white/10 transition-all duration-300 ${errors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-cyan-400/50'}`}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.password && <p className="mt-1 text-[10px] text-red-400">{errors.password}</p>}
              </div>

              {/* Confirm */}
              <div className="relative group">
                <input
                  name="password2"
                  type="password"
                  placeholder="Confirm"
                  className={`w-full pl-4 pr-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:bg-white/10 transition-all duration-300 ${errors.password2 ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-cyan-400/50'}`}
                  value={formData.password2}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.password2 && <p className="mt-1 text-[10px] text-red-400">{errors.password2}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Sign Up Now'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/70">
              Already have an account? {' '}
              <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors drop-shadow-md">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

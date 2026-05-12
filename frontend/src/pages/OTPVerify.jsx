import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { EnvelopeIcon, KeyIcon, BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function OTPVerify() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1: Send, 2: Verify
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-fill email if passed in URL
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (emailParam) {
      setEmail(emailParam)
      setStep(2) // Skip to step 2 (Enter Code)
    }
  }, [])

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Email is required')

    setLoading(true)
    try {
      await api.post('/send-otp/', { email })
      toast.success('OTP sent to your email!')
      setStep(2)
      setTimer(60) // 1 minute cooldown for resend
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp) return toast.error('Please enter the 6-digit code')

    setLoading(true)
    try {
      const { data } = await api.post('/verify-otp/', { email, otp })
      toast.success('Verification successful!')
      
      if (data.access) {
        // If the API returned tokens (Login via OTP)
        login(data)
        navigate('/')
      } else {
        // Just verified, maybe redirect to complete registration or login
        navigate('/login')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-5%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full relative z-10 m-4">
        <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/20 p-8 sm:p-10 transition-all duration-500">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 mb-4 shadow-lg shadow-cyan-500/30">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {step === 1 ? 'Verify Email' : 'Enter Code'}
            </h2>
            <p className="text-cyan-100/80 mt-2 font-medium">
              {step === 1 
                ? 'We will send a 6-digit code to your email.' 
                : `We've sent a code to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-white/50 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-white/50 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="6-digit OTP"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-center tracking-[1em] font-mono text-xl placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div className="flex flex-col items-center space-y-4 pt-2">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={timer > 0 || loading}
                  className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 disabled:text-white/30 transition-colors"
                >
                  {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center text-sm text-white/50 hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-1" />
                  Change Email
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <Link to="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

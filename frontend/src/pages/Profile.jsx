import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { 
  UserCircleIcon, 
  MapPinIcon, 
  BookOpenIcon, 
  ArrowsRightLeftIcon,
  CheckBadgeIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [city, setCity] = useState(user?.city || '')
  const [loading, setLoading] = useState(false)
  const [profilePic, setProfilePic] = useState(null)
  const [stats, setStats] = useState({ books_owned: 0, exchanges_total: 0, community_users: 0, points: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/user-stats/')
        setStats(data.data || data)
      } catch (err) {
        console.error('Failed to load profile stats')
      }
    }
    fetchStats()
  }, [])

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('profile_picture', file)
    
    setLoading(true)
    try {
      const { data } = await api.patch(`/auth/user/`, formData)
      updateUser(data)
      toast.success('Profile picture updated!')
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.patch(`/auth/user/`, { city })
      updateUser(data)
      toast.success('Profile updated!')
      setIsEditing(false)
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex items-end justify-between">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-pic-input').click()}>
              <div className="bg-white p-2 rounded-3xl shadow-lg inline-block transition-transform group-hover:scale-105">
                <div className="w-32 h-32 rounded-2xl bg-gray-100 flex items-center justify-center border-4 border-white overflow-hidden">
                  {user?.profile_picture ? (
                    <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircleIcon className="w-24 h-24 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                <PencilSquareIcon className="w-8 h-8 text-white" />
              </div>
              <input 
                id="profile-pic-input"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition flex items-center space-x-2"
            >
              <PencilSquareIcon className="w-5 h-5" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-3xl font-black text-gray-900">{user?.username}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  user?.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                  user?.role === 'librarian' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  'bg-blue-100 text-blue-700 border-blue-200'
                }`}>
                  {user?.role || 'User'}
                </span>
              </div>
              <p className="text-gray-500 font-medium">{user?.email}</p>
            </div>

            <div className="flex items-center text-gray-600 space-x-4">
              <div className="flex items-center space-x-1">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="flex items-center space-x-2">
                    <input 
                      className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                    />
                    <button 
                      disabled={loading}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <span className="font-medium">{user?.city || 'Location not set'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Books Owned</p>
          <p className="text-4xl font-black text-gray-900 mt-1">{stats.books_owned}</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ArrowsRightLeftIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Successful Exchanges</p>
          <p className="text-4xl font-black text-gray-900 mt-1">{stats.exchanges_total}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckBadgeIcon className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Community Power</p>
          <p className="text-4xl font-black text-gray-900 mt-1">{stats.community_users}</p>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-bold text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive alerts when someone wants to exchange.</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-bold text-gray-900">Public Profile</p>
              <p className="text-sm text-gray-500">Allow others to see your book collection.</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

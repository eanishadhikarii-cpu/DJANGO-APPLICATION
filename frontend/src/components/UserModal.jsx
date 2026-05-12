import { useState, useEffect } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function UserModal({ isOpen, onClose, onSuccess, user }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    city: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        city: user.city || '',
        password: '' // Keep empty when editing
      })
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        city: ''
      })
    }
  }, [user])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (user) {
        // Update existing user
        const updateData = { ...formData }
        if (!updateData.password) delete updateData.password
        await api.patch(`/users/${user.id}/`, updateData)
        toast.success('User updated successfully')
      } else {
        // Create new user
        await api.post('/users/', { ...formData, password2: formData.password })
        toast.success('User created successfully')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-black text-gray-900">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition shadow-sm">
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Username</label>
              <input
                required
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Email Address</label>
              <input
                required
                type="email"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Role</label>
                <select
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-bold text-blue-600"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="librarian">Librarian</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">City</label>
                <input
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">
                {user ? 'New Password (Leave blank to keep current)' : 'Password'}
              </label>
              <input
                required={!user}
                type="password"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 mt-4 disabled:opacity-50"
          >
            {loading ? 'Processing...' : user ? 'Update User' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  )
}

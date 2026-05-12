import { useState, useEffect } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { UserIcon, EnvelopeIcon, MapPinIcon, ShieldCheckIcon, TrashIcon, PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import UserModal from '../components/UserModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/')
      setUsers(response.data.data || response.data || [])
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200'
      case 'librarian': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    setDeleteLoading(true)
    try {
      await api.delete(`/users/${selectedUser.id}/`)
      toast.success(`Account ${selectedUser.username} deleted`)
      fetchUsers()
      setShowDeleteConfirm(false)
    } catch (err) {
      toast.error('Deletion failed')
    } finally {
      setDeleteLoading(false)
      setSelectedUser(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-500 font-medium">Overview of all system users and roles</p>
        </div>
        <button 
          onClick={() => { setSelectedUser(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition flex items-center justify-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-[2.5rem]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <div key={u.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:scale-110 transition-transform">
                  {u.profile_picture ? (
                    <img src={u.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getRoleStyle(u.role)}`}>
                  {u.role}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-black text-gray-900 flex items-center">
                  {u.username}
                  {u.role === 'admin' && <ShieldCheckIcon className="w-5 h-5 text-red-500 ml-2" />}
                </h3>
                
                <div className="flex items-center text-gray-500 text-sm font-medium">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  {u.email}
                </div>
                
                <div className="flex items-center text-gray-400 text-sm font-bold uppercase tracking-wider">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  {u.city || 'No Location'}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex space-x-3">
                <button 
                  onClick={() => { setSelectedUser(u); setShowModal(true); }}
                  className="flex-1 bg-gray-50 text-gray-600 py-3 rounded-xl font-bold hover:bg-blue-50 hover:text-blue-600 transition flex items-center justify-center space-x-2"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                  <span>Edit</span>
                </button>
                {u.role !== 'admin' && (
                  <button 
                    onClick={() => { setSelectedUser(u); setShowDeleteConfirm(true); }}
                    className="px-4 py-3 bg-red-50 border border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition flex items-center justify-center space-x-2"
                    title="Delete User"
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span className="text-sm">Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <UserModal 
          isOpen={showModal}
          onClose={() => { setShowModal(false); setSelectedUser(null); }}
          onSuccess={fetchUsers}
          user={selectedUser}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
        onConfirm={handleDelete}
        title="Delete User?"
        message={`Are you sure you want to permanently delete ${selectedUser?.username}? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  )
}

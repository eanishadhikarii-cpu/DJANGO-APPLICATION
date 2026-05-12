import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import api from '../services/api.js'
import { 
  UsersIcon, 
  BookOpenIcon, 
  ArrowsRightLeftIcon,
  CircleStackIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const [tab, setTab] = useState('users')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [tab])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      let endpoint = tab === 'users' ? '/users/' : tab === 'books' ? '/books/' : '/exchanges/'
      const res = await api.get(endpoint)
      const result = Array.isArray(res.data) ? res.data : []
      setData(result)
    } catch (err) {
      setError('Failed to fetch data from the server.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = (data || []).filter(item => {
    if (!item) return false;
    const searchLower = (search || '').toLowerCase()
    
    try {
      if (tab === 'users') {
        return (item.username || '').toLowerCase().includes(searchLower) || 
               (item.email || '').toLowerCase().includes(searchLower)
      } else if (tab === 'books') {
        return (item.title || '').toLowerCase().includes(searchLower) || 
               (item.author || '').toLowerCase().includes(searchLower)
      } else {
        return (item.sender_username || '').toLowerCase().includes(searchLower) || 
               (item.receiver_username || '').toLowerCase().includes(searchLower)
      }
    } catch (e) {
      return false
    }
  })

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center">
              <CircleStackIcon className="w-10 h-10 mr-3 text-blue-600" />
              SQLite Viewer
            </h1>
            <p className="text-gray-500 mt-1">Live Database Administration Panel</p>
          </div>
          
          <div className="relative w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter data..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-2xl shadow-sm border mb-8 max-w-md">
          <button 
            onClick={() => { setTab('users'); setSearch(''); setData([]); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-medium ${tab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <UsersIcon className="w-5 h-5" />
            <span>Users</span>
          </button>
          <button 
            onClick={() => { setTab('books'); setSearch(''); setData([]); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-medium ${tab === 'books' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <BookOpenIcon className="w-5 h-5" />
            <span>Books</span>
          </button>
          <button 
            onClick={() => { setTab('exchanges'); setSearch(''); setData([]); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-medium ${tab === 'exchanges' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <ArrowsRightLeftIcon className="w-5 h-5" />
            <span>Exchanges</span>
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 mr-3" />
            {error}
          </div>
        )}

        {/* Table View */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                {tab === 'users' ? (
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Username</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">City</th>
                  </tr>
                ) : tab === 'books' ? (
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Author</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Owner</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Condition</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Sender</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Receiver</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Created</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {tab === 'users' ? (
                        <>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                        </>
                      )}
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No records found.</td>
                  </tr>
                ) : filteredData.map((item) => (
                  <tr key={item?.id || Math.random()} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-gray-400">#{item?.id}</td>
                    {tab === 'users' ? (
                      <>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item?.username || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item?.email || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item?.city || '-'}</td>
                      </>
                    ) : tab === 'books' ? (
                      <>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item?.title || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item?.author || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">@{item?.owner_username || 'unknown'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md uppercase">
                            {(item?.condition || 'good').replace('_', ' ')}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">@{item?.sender_username || 'unknown'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">@{item?.receiver_username || 'unknown'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase ${
                            item?.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            item?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {item?.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item?.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

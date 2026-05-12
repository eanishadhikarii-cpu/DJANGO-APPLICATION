import { useState, useEffect } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { 
  ArrowsRightLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon
} from '@heroicons/react/24/outline'

export default function ExchangeHub() {
  const [sentRequests, setSentRequests] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('received') // 'received' or 'sent'

  const fetchData = async () => {
    try {
      const [sent, received] = await Promise.all([
        api.get('/exchanges/'),
        api.get('/received-requests/')
      ])
      setSentRequests(sent.data.data || sent.data)
      setReceivedRequests(received.data.data || received.data)
    } catch (err) {
      toast.error('Failed to load exchanges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/exchanges/${id}/`, { status })
      toast.success(`Request ${status}`)
      fetchData()
    } catch (err) {
      toast.error('Action failed')
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-amber-100 text-amber-700'
    }
  }

  const RequestCard = ({ req, type }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl ${type === 'sent' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
            {type === 'sent' ? <ArrowUpRightIcon className="w-6 h-6" /> : <ArrowDownLeftIcon className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">
              {type === 'sent' ? `Request to ${req.receiver_username}` : `Request from ${req.sender_username}`}
            </h4>
            <p className="text-sm text-gray-500">
              {new Date(req.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(req.status)}`}>
          {req.status}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between bg-gray-50 rounded-2xl p-4">
        <div className="text-center flex-1">
          <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Your Book</p>
          <p className="font-bold text-gray-800 line-clamp-1">
            {type === 'sent' ? req.book_from_title : req.book_to_title}
          </p>
        </div>
        <ArrowsRightLeftIcon className="w-5 h-5 text-gray-300 mx-4" />
        <div className="text-center flex-1">
          <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Their Book</p>
          <p className="font-bold text-gray-800 line-clamp-1">
            {type === 'sent' ? req.book_to_title : req.book_from_title}
          </p>
        </div>
      </div>

      {type === 'received' && req.status === 'pending' && (
        <div className="mt-6 flex space-x-3">
          <button 
            onClick={() => handleStatusUpdate(req.id, 'accepted')}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center space-x-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>Accept</span>
          </button>
          <button 
            onClick={() => handleStatusUpdate(req.id, 'rejected')}
            className="flex-1 bg-white border border-gray-200 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center space-x-2"
          >
            <XCircleIcon className="w-5 h-5" />
            <span>Reject</span>
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-900">Exchange Hub</h2>
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('received')}
            className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'received' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Received
          </button>
          <button 
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'sent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sent
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeTab === 'received' ? (
            receivedRequests.length > 0 ? (
              receivedRequests.map(req => <RequestCard key={req.id} req={req} type="received" />)
            ) : (
              <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">No received requests yet.</p>
              </div>
            )
          ) : (
            sentRequests.length > 0 ? (
              sentRequests.map(req => <RequestCard key={req.id} req={req} type="sent" />)
            ) : (
              <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">No sent requests yet.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

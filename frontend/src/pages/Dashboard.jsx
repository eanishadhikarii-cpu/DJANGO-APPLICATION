import { useState, useEffect } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import BookCard from '../components/BookCard.jsx'
import AddBookModal from '../components/AddBookModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  UserGroupIcon,
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [stats, setStats] = useState({ books_owned: 0, exchanges_total: 0, community_users: 0, points: 0 })
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchData = async () => {
    try {
      const bookEndpoint = user?.role === 'user' ? '/books/' : '/my-books/'
      const [booksRes, statsRes] = await Promise.all([
        api.get(bookEndpoint),
        api.get('/user-stats/')
      ])
      setBooks(booksRes.data.data || booksRes.data)
      setStats(statsRes.data.data || statsRes.data)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!selectedBook) return
    setDeleteLoading(true)
    try {
      await api.delete(`/books/${selectedBook.id}/`)
      toast.success('Book deleted')
      fetchData()
      setShowDeleteConfirm(false)
    } catch (err) {
      toast.error('Delete failed')
    } finally {
      setDeleteLoading(false)
      setSelectedBook(null)
    }
  }

  const handleEdit = (book) => {
    setSelectedBook(book)
    setShowAddModal(true)
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-6">
            <SparklesIcon className="w-4 h-4" />
            <span>Community Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
            {user?.role === 'admin' ? 'System Management' : 
             user?.role === 'librarian' ? 'Library Inventory' : 
             'Explore Your Library'}
          </h1>
          <p className="text-blue-100 text-lg font-medium mb-8">
            {user?.role === 'admin' ? 'Full control over users and stock management.' :
             user?.role === 'librarian' ? 'Manage the library stock and exchange requests.' :
             'Find your next favorite book and trade with the community.'}
          </p>
          {user?.role !== 'user' ? (
            <button 
              onClick={() => { setSelectedBook(null); setShowAddModal(true); }}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition flex items-center space-x-2"
            >
              <PlusIcon className="w-6 h-6" />
              <span>Add New Book</span>
            </button>
          ) : (
            <button 
              onClick={() => window.location.href='/books'}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition flex items-center space-x-2"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
              <span>Discover Books</span>
            </button>
          )}
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[30%] w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            <BookOpenIcon className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase">My Collection</p>
            <p className="text-2xl font-black text-gray-900">{stats.books_owned}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <ArrowTrendingUpIcon className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase">Exchanges</p>
            <p className="text-2xl font-black text-gray-900">{stats.exchanges_total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
            <UserGroupIcon className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase">Community</p>
            <p className="text-2xl font-black text-gray-900">{stats.community_users}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
            <SparklesIcon className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase">Points</p>
            <p className="text-2xl font-black text-gray-900">{stats.points}</p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900">
            {user?.role === 'user' ? 'Available in Library' : 'Your Recent Books'}
          </h2>
          <button onClick={fetchData} className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-[2rem]"></div>
            ))}
          </div>
        ) : (
          books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {books.slice(0, 4).map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onDelete={() => { setSelectedBook(book); setShowDeleteConfirm(true); }} 
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <BookOpenIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">Your library is empty</h3>
              <p className="text-gray-400 mt-1">Start by adding a book to share with the community.</p>
            </div>
          )
        )}
      </div>

      {showAddModal && (
        <AddBookModal 
          isOpen={showAddModal} 
          onClose={() => { setShowAddModal(false); setSelectedBook(null); }}
          onSuccess={fetchData}
          book={selectedBook}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedBook(null); }}
        onConfirm={handleDelete}
        title="Delete Book?"
        message={`Are you sure you want to permanently delete "${selectedBook?.title}"?`}
        loading={deleteLoading}
      />
    </div>
  )
}

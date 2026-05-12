import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import BookCard from '../components/BookCard.jsx'
import AddBookModal from '../components/AddBookModal.jsx'
import ReviewModal from '../components/ReviewModal.jsx'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

export default function AllBooks() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    condition: searchParams.get('condition') || ''
  })
  const [selectedBook, setSelectedBook] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const loadBooks = async () => {
    setLoading(true)
    setError(false)
    try {
      let url = '/books/?'
      Object.entries(filters).forEach(([key, value]) => {
        if (value) url += `${key}=${encodeURIComponent(value)}&`
      })
      const response = await api.get(url)
      setBooks(response.data.data || response.data || [])
    } catch (err) {
      setError(true)
      toast.error('Could not load books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
  }, [filters])

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    setSearchParams(params)
  }

  const handleEdit = (book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return
    try {
      await api.delete(`/books/${id}/`)
      toast.success('Book deleted')
      setBooks(books.filter(b => b.id !== id))
    } catch (err) {
      toast.error('Failed to delete book')
    }
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Discover Books</h1>
        <p className="text-gray-500 font-medium">Find books to exchange near you</p>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or author..."
              className="w-full pl-14 pr-4 py-4 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm outline-none text-lg"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>
        <div>
          <button className="w-full bg-white border border-gray-100 p-4 rounded-[2rem] shadow-sm hover:shadow-md transition flex items-center justify-center space-x-2 font-bold text-gray-700">
            <FunnelIcon className="w-5 h-5" />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-center py-20 bg-red-50 rounded-[3rem] border border-red-100">
          <h3 className="text-2xl font-bold text-red-900 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-6 max-w-md mx-auto">We couldn't load the books. Please check your connection.</p>
          <button onClick={loadBooks} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition shadow-lg">
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm animate-pulse border border-gray-50">
                  <div className="h-56 bg-gray-100 rounded-[2rem] mb-4"></div>
                  <div className="h-6 bg-gray-100 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-3"></div>
                  <div className="h-10 bg-gray-100 rounded-2xl"></div>
                </div>
              ))
            ) : (
              books.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAction={(b) => toast.success(`Requesting ${b.title}...`)}
                  onReview={(b) => { setSelectedBook(b); setIsReviewModalOpen(true); }}
                />
              ))
            )}
          </div>

          {books.length === 0 && !loading && (
            <div className="text-center py-24 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-gray-300">No books found</h3>
              <p className="text-gray-400 mt-2">Try adjusting your filters or searching for something else.</p>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <AddBookModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setSelectedBook(null); }} 
          book={selectedBook}
          onSuccess={loadBooks}
        />
      )}

      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => { setIsReviewModalOpen(false); setSelectedBook(null); }}
          book={selectedBook}
        />
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { PlusIcon, BookOpenIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import AddBookModal from '../components/AddBookModal.jsx'
import BookCard from '../components/BookCard.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import api from '../services/api.js'
import toast from 'react-hot-toast'

export default function MyBooks() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadBooks = async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await api.get('/my-books/')
      setBooks(Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []))
    } catch (err) {
      setError(true)
      toast.error('Failed to load your books')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedBook) return
    setDeleteLoading(true)
    try {
      await api.delete(`/books/${selectedBook.id}/`)
      toast.success('Book deleted')
      setBooks(books.filter(b => b.id !== selectedBook.id))
      setShowDeleteConfirm(false)
    } catch (err) {
      toast.error('Failed to delete book')
    } finally {
      setDeleteLoading(false)
      setSelectedBook(null)
    }
  }

  const handleEdit = (book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  useEffect(() => {
    loadBooks()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-500 font-medium">Manage the books you've listed for exchange</p>
        </div>
        <button 
          onClick={() => { setSelectedBook(null); setIsModalOpen(true); }} 
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center"
        >
          <PlusIcon className="w-6 h-6 inline mr-2" />
          Add New Book
        </button>
      </div>
      
      {error ? (
        <div className="text-center py-20 bg-red-50 rounded-[3rem] border border-red-100 max-w-2xl mx-auto">
          <ExclamationCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-red-900 mb-2">Failed to load books</h3>
          <p className="text-red-600 mb-6">There was a problem reaching the server. Please try again.</p>
          <button onClick={loadBooks} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-sm">
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            Array(3).fill().map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm animate-pulse border border-gray-100 h-64"></div>
            ))
          ) : (
            <>
              {books.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
              <div 
                onClick={() => { setSelectedBook(null); setIsModalOpen(true); }} 
                className="cursor-pointer bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-dashed border-gray-100 text-center hover:border-emerald-300 transition group flex flex-col items-center justify-center min-h-[350px]"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition">
                  <PlusIcon className="w-8 h-8 text-gray-400 group-hover:text-emerald-500 transition" />
                </div>
                <p className="text-gray-400 font-bold group-hover:text-emerald-600 transition">Add Another Book</p>
              </div>
            </>
          )}
        </div>
      )}

      {isModalOpen && (
        <AddBookModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setSelectedBook(null); }} 
          book={selectedBook}
          onSuccess={loadBooks}
        />
      )}
    </div>
  )
}

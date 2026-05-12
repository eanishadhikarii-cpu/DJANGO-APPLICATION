import { PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function BookCard({ book, onAction, onEdit, onDelete, onReview }) {
  const { user } = useAuth()
  const isOwner = user && user.username === book.owner_username

  const getImageUrl = () => {
    if (book.cover_image_url) return book.cover_image_url
    if (book.image) {
      if (typeof book.image === 'string' && book.image.includes('/media/')) {
        // Extract just the relative path so Vite proxy handles it
        const urlObj = new URL(book.image, window.location.origin)
        return urlObj.pathname
      }
      return book.image
    }
    return null
  }

  const imageUrl = getImageUrl()


  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border hover:border-blue-200">
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-105 transition-transform duration-300">
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={book.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
              }}
              className="w-full h-full object-cover group-hover:brightness-110 transition"
            />
            <div className="w-full h-full hidden flex-col items-center justify-center bg-gray-50 border-b border-gray-100 p-6 absolute inset-0">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-4 text-blue-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-400 font-black text-xs uppercase tracking-widest">No Cover Found</p>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-b border-gray-100 p-6 absolute inset-0">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-4 text-blue-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest">No Cover Found</p>
          </div>
        )}
        
        {isOwner && (
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit && onEdit(book); }}
              className="p-2 bg-white/90 backdrop-blur rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg transition"
              title="Edit Book"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete && onDelete(book.id); }}
              className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-600 hover:bg-red-600 hover:text-white shadow-lg transition"
              title="Delete Book"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">{book.title}</h3>
        <p className="text-gray-600 mb-1">by {book.author}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm font-semibold rounded-lg">
            {book.condition.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-sm font-medium text-gray-700">{book.city}</span>
        </div>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{book.category_name}</p>
        {onAction && (
          <div className="flex gap-2">
            <button 
              onClick={() => onAction(book)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              Exchange
            </button>
            {onReview && (
              <button 
                onClick={() => onReview(book)}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center gap-1"
              >
                <StarIcon className="w-5 h-5" />
                Review
              </button>
            )}
          </div>
        )}
        {!onAction && !isOwner && (
          <div className="text-xs text-gray-500">Owner: {book.owner_username}</div>
        )}
        {isOwner && !onAction && (
          <div className="text-xs text-blue-600 font-semibold">This is your book</div>
        )}
      </div>
    </div>
  )
}

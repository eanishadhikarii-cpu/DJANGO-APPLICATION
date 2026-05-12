import { useState } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export default function ReviewModal({ isOpen, onClose, book }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !book) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/reviews/', {
        book: book.id,
        rating,
        comment
      })
      toast.success('Review submitted successfully')
      onClose()
    } catch (err) {
      toast.error('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-black text-gray-900">Write a Review</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition shadow-sm">
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="text-center">
            <p className="text-gray-500 font-medium mb-4">How was "{book.title}"?</p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  {star <= rating ? (
                    <StarIconSolid className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Comment</label>
            <textarea
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium min-h-[120px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of the book?"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 mt-4 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}

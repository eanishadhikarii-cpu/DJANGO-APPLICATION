import { useState, useEffect } from 'react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function AddBookModal({ isOpen, onClose, onSuccess, book }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    condition: 'good',
    city: '',
    image: null,
    cover_image_url: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      api.get('/categories/').then(res => setCategories(res.data)).catch(console.error)
      if (book) {
        setFormData({
          title: book.title,
          author: book.author,
          category: book.category || '',
          condition: book.condition,
          city: book.city,
          image: null,
          cover_image_url: book.cover_image_url || ''
        })
      } else {
        setFormData({
          title: '',
          author: '',
          category: '',
          condition: 'good',
          city: '',
          image: null,
          cover_image_url: ''
        })
      }
    }
  }, [isOpen, book])

  if (!isOpen) return null

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.author.trim()) newErrors.author = 'Author is required'
    if (!formData.category) newErrors.category = 'Please select a category'
    
    if (formData.image) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!validTypes.includes(formData.image.type)) {
        newErrors.image = 'Only JPG/PNG images are allowed'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const dataToSubmit = new FormData()
      dataToSubmit.append('title', formData.title)
      dataToSubmit.append('author', formData.author)
      dataToSubmit.append('category', formData.category)
      dataToSubmit.append('condition', formData.condition)
      dataToSubmit.append('city', formData.city)
      dataToSubmit.append('cover_image_url', formData.cover_image_url)
      if (formData.image) {
        dataToSubmit.append('image', formData.image)
      }

      let response;
      if (book) {
        response = await api.patch(`/books/${book.id}/`, dataToSubmit, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Book updated successfully!')
      } else {
        response = await api.post('/books/', dataToSubmit, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Book added successfully!')
      }
      
      if (onSuccess) onSuccess(response.data)
      onClose()
    } catch (err) {
      if (err.response?.data?.error) {
        setErrors({ form: err.response.data.error })
      } else {
        toast.error(book ? 'Failed to update book' : 'Failed to add book')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 p-2">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{book ? 'Edit Book' : 'Add New Book'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium">{errors.form}</div>}
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" className={`w-full border rounded-xl px-4 py-2 ${errors.title ? 'border-red-500' : 'border-gray-300'}`} value={formData.title} onChange={e => { setFormData({...formData, title: e.target.value}); setErrors({...errors, title: null, form: null}) }} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input type="text" className={`w-full border rounded-xl px-4 py-2 ${errors.author ? 'border-red-500' : 'border-gray-300'}`} value={formData.author} onChange={e => { setFormData({...formData, author: e.target.value}); setErrors({...errors, author: null, form: null}) }} />
              {errors.author && <p className="mt-1 text-xs text-red-500">{errors.author}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className={`w-full border rounded-xl px-4 py-2 bg-white ${errors.category ? 'border-red-500' : 'border-gray-300'}`} value={formData.category} onChange={e => { setFormData({...formData, category: e.target.value}); setErrors({...errors, category: null, form: null}) }}>
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input required type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-sm font-bold text-gray-800 mb-2 underline">Book Cover Image</label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Option 1: Paste Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/book-cover.jpg"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
                  value={formData.cover_image_url} 
                  onChange={e => setFormData({...formData, cover_image_url: e.target.value})} 
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs font-medium">
                  <span className="px-2 bg-white text-gray-400">OR</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Option 2: Upload File</label>
                <input type="file" accept="image/png, image/jpeg, image/jpg" className={`w-full border rounded-xl px-4 py-2 text-sm ${errors.image ? 'border-red-500' : 'border-gray-300'}`} onChange={e => { setFormData({...formData, image: e.target.files[0]}); setErrors({...errors, image: null, form: null}) }} />
                {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 mt-2 disabled:opacity-50">
            {loading ? (book ? 'Updating...' : 'Adding...') : (book ? 'Update Book' : 'Add Book')}
          </button>
        </form>
      </div>
    </div>
  )
}

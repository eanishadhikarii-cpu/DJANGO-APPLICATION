import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", loading = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 transform animate-in fade-in zoom-in duration-200">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 font-medium leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col space-y-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : confirmText}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

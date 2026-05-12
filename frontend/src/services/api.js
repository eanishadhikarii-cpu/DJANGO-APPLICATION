import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    // Unwrap the backend standardized response if present
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config

    // Global Error Toasts
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.error || 'An error occurred';
      
      if (status === 403) toast.error('Unauthorized access');
      else if (status === 404) toast.error('Resource not found');
      else if (status >= 500) toast.error('Server error, try again later');
      // 401 is handled silently via token refresh below
      // For 400 validation errors, we let the component handle specific UI errors,
      // but we can show a general toast if we want.
    } else {
      toast.error('Network error, please check your connection');
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh')
        // We use axios directly to avoid interceptor loops, but it won't unwrap the data
        const { data } = await axios.post('/api/auth/refresh/', { refresh: refreshToken })
        const access = data.success ? data.data.access : data.access;
        localStorage.setItem('access', access)
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

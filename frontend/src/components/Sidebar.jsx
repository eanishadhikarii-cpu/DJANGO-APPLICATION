import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  HomeIcon, 
  BookOpenIcon, 
  UserIcon,
  ArrowsRightLeftIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ServerIcon,
  BookOpenIcon as LibraryIcon
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, roles: ['admin', 'librarian', 'user'] },
    { name: 'Discover', path: '/books', icon: MagnifyingGlassIcon, roles: ['admin', 'librarian', 'user'] },
    { name: 'Manage Stock', path: '/my-books', icon: LibraryIcon, roles: ['admin', 'librarian'] },
    { name: 'Exchange Hub', path: '/exchange-hub', icon: ArrowsRightLeftIcon, roles: ['admin', 'librarian', 'user'] },
    { name: 'User Management', path: '/users', icon: UserGroupIcon, roles: ['admin'] },
    { name: 'Master Database', path: 'http://localhost:8000/admin', icon: ServerIcon, roles: ['admin'], external: true },
    { name: 'Profile', path: '/profile', icon: UserIcon, roles: ['admin', 'librarian', 'user'] },
  ]

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || 'user'))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm">
      {/* Brand */}
      <div className="p-8">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-300">
            <BookOpenIcon className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tight">BookHub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {filteredNavItems.map((item) => (
          item.external ? (
            <a
              key={item.name}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
            >
              <item.icon className="w-6 h-6" />
              <span>{item.name}</span>
            </a>
          ) : (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-2' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}
              `}
            >
              <item.icon className="w-6 h-6" />
              <span>{item.name}</span>
            </NavLink>
          )
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-6 mt-auto">
        <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm overflow-hidden border border-gray-100">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 truncate leading-none mb-1">{user?.username}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{user?.role || 'user'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white text-gray-400 font-bold rounded-xl hover:text-red-500 hover:bg-red-50 transition-all duration-300 border border-transparent hover:border-red-100"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

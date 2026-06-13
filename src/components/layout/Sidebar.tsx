import { NavLink } from 'react-router-dom'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { navItems } from './navItems'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 bottom-0 flex-col bg-white border-r border-gray-200 overflow-hidden transition-[width] duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center min-h-[72px] border-b border-gray-100 px-3 gap-2">
        <div className={`flex-1 overflow-hidden transition-[opacity,width] duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
          <img
            src="/images/logo.jpg"
            alt="Uniformes D'Johanna"
            className="h-10 w-auto object-contain"
          />
        </div>
        <button
          onClick={onToggle}
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span
              className={`overflow-hidden transition-[opacity,max-width] duration-300 ${
                collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-xs'
              }`}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-gray-100">
        <div
          className={`overflow-hidden transition-[opacity,max-height] duration-300 ${
            collapsed ? 'opacity-0 max-h-0' : 'opacity-100 max-h-20'
          }`}
        >
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors whitespace-nowrap ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span
            className={`overflow-hidden transition-[opacity,max-width] duration-300 ${
              collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-xs'
            }`}
          >
            Cerrar sesion
          </span>
        </button>
      </div>
    </aside>
  )
}

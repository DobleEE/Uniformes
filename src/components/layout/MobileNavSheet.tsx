import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { navItems } from './navItems'

interface MobileNavSheetProps {
  open: boolean
  onClose: () => void
}

export function MobileNavSheet({ open, onClose }: MobileNavSheetProps) {
  const { user, logout } = useAuthStore()
  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-2xl md:hidden transition-transform duration-300 ease-in-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border-strong)' }} />
        </div>

        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <p className="text-[14px] font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
            {user?.email}
          </p>
          <p className="text-[12px] capitalize" style={{ color: 'var(--color-text-muted)' }}>
            {user?.role}
          </p>
        </div>

        <nav className="px-3 py-2 max-h-[60vh] overflow-y-auto">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-colors"
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--color-accent-light)', color: 'var(--color-accent)' }
                  : { color: 'var(--color-text-secondary)' }
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pt-2 pb-8" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => { logout(); onClose() }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[14px] font-medium transition-colors hover:bg-red-50 hover:text-red-600"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  )
}

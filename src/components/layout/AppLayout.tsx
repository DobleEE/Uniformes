import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { Sidebar } from './Sidebar'
import { MobileNavSheet } from './MobileNavSheet'
import { ToastProvider } from '../../contexts/ToastContext'

export function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const [navOpen, setNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!user) return <Navigate to="/login" replace />

  return (
    <ToastProvider>
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />

        {/* Top bar móvil */}
        <div
          className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4"
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <img
            src="/images/logo.png"
            alt="Uniformes D'Johanna"
            className="h-9 w-auto object-contain"
          />
          <button
            onClick={() => setNavOpen(true)}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface-2)]"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <MobileNavSheet open={navOpen} onClose={() => setNavOpen(false)} />

        <main
          className={`transition-[margin-left] duration-300 ease-in-out p-4 sm:p-6 lg:p-8 pt-18 md:pt-8 ${
            sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  )
}

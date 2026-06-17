import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { toastVariants } from '../lib/motion'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const STYLES = {
  success: { bg: '#F0FDF4', border: '#86EFAC', icon: '#16A34A', text: '#15803D' },
  error:   { bg: '#FEF2F2', border: '#FCA5A5', icon: '#DC2626', text: '#B91C1C' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', icon: '#D97706', text: '#B45309' },
  info:    { bg: '#EFF6FF', border: '#93C5FD', icon: '#2563EB', text: '#1D4ED8' },
}

const DISMISS_DELAY: Record<ToastType, number> = {
  success: 4000,
  info:    4000,
  warning: 6000,
  error:   0, // manual
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type]
  const style = STYLES[toast.type]
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startTimer = useCallback(() => {
    const delay = DISMISS_DELAY[toast.type]
    if (!delay) return
    timerRef.current = setTimeout(() => onDismiss(toast.id), delay)
  }, [toast.id, toast.type, onDismiss])

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current) }

  // auto-start on mount
  useState(() => { startTimer() })

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        minWidth: 300,
        maxWidth: 400,
        boxShadow: 'var(--shadow-dropdown)',
        pointerEvents: 'all',
      }}
    >
      <Icon size={18} color={style.icon} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 14, color: style.text, flex: 1, lineHeight: 1.5 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: style.icon, flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const add = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => {
      const next = [...prev, { id, type, message }]
      return next.slice(-3) // máximo 3
    })
  }, [])

  const value: ToastContextValue = {
    success: (m) => add('success', m),
    error:   (m) => add('error', m),
    warning: (m) => add('warning', m),
    info:    (m) => add('info', m),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

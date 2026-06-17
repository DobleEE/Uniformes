import { type ReactNode, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { modalVariants, overlayVariants } from '../../lib/motion'
import { useSafeVariants } from '../../hooks/useMotion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const maxWidths = { sm: 'max-w-[560px]', md: 'max-w-[720px]', lg: 'max-w-[960px]' }

export function Modal({ open, onClose, title, children, size = 'sm' }: ModalProps) {
  const safeModal = useSafeVariants(modalVariants)
  const safeOverlay = useSafeVariants(overlayVariants)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            className="absolute inset-0 bg-black/40"
            variants={safeOverlay}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          <motion.div
            className={`relative bg-white rounded-xl w-full ${maxWidths[size]} max-h-[90vh] overflow-y-auto`}
            style={{ boxShadow: 'var(--shadow-modal)' }}
            variants={safeModal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-[16px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surface-2)]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

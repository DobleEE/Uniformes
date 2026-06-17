import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children?: ReactNode
}

const variants = {
  primary:   'bg-accent text-white hover:bg-accent-dark shadow-sm',
  secondary: 'bg-white text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]',
  danger:    'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-600',
  ghost:     'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]',
}

const sizes = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-5 text-[14px]',
  lg: 'h-11 px-6 text-[14px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  loading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

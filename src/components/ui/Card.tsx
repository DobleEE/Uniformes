import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  padding = 'md',
  hoverable,
}: CardProps) {
  return (
    <div
      style={{ boxShadow: 'var(--shadow-card)' }}
      className={`bg-white rounded-[10px] border border-[var(--color-border)] transition-all duration-150 ${
        hoverable ? 'hover:-translate-y-px hover:shadow-md cursor-pointer' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] text-[15px]">{title}</h3>
            {subtitle && <p className="text-caption mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={paddings[padding]}>{children}</div>
    </div>
  )
}

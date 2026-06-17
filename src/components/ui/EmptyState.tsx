import type { ComponentType, ReactNode } from 'react'

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--color-surface-2)' }}
      >
        <Icon className="h-7 w-7" style={{ color: 'var(--color-text-muted)' } as any} />
      </div>
      <div>
        <p className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </p>
        {description && (
          <p className="text-caption mt-1 max-w-xs mx-auto">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

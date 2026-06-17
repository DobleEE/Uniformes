import { useEffect, useRef, useState, type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: string
  action?: ReactNode
  actions?: ReactNode
  sticky?: boolean
}

export function PageHeader({ title, subtitle, breadcrumb, action, actions, sticky }: PageHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sticky) return
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [sticky])

  const slot = actions ?? action

  if (sticky) {
    return (
      <div
        ref={ref}
        className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 transition-all duration-150 mb-6"
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: scrolled ? 'var(--shadow-card)' : 'none',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 h-16">
          <div>
            {breadcrumb && <p className="text-label mb-0.5">{breadcrumb}</p>}
            <h1 className="text-[18px] font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h1>
            {subtitle && <p className="text-caption mt-0.5">{subtitle}</p>}
          </div>
          {slot && <div className="flex-shrink-0 flex items-center gap-2">{slot}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
      <div>
        {breadcrumb && <p className="text-label mb-0.5">{breadcrumb}</p>}
        <h1 className="text-[20px] sm:text-[22px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h1>
        {subtitle && <p className="text-caption mt-0.5">{subtitle}</p>}
      </div>
      {slot && <div className="flex-shrink-0 flex items-center gap-2">{slot}</div>}
    </div>
  )
}

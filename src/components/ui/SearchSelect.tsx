import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface SearchSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  required?: boolean
}

export function SearchSelect({ label, value, onChange, options, placeholder, required }: SearchSelectProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const selectedLabel = options.find((o) => o.value === value)?.label || ''
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  function handleFocus() {
    setSearch('')
    setOpen(true)
  }

  function handleBlur() {
    setTimeout(() => setOpen(false), 150)
  }

  function select(opt: Option) {
    onChange(opt.value)
    setSearch('')
    setOpen(false)
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setSearch('')
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
      )}
      <div className="relative">
        <input
          value={open ? search : selectedLabel}
          onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={open ? 'Buscar...' : (placeholder || '')}
          required={required && !value}
          className="w-full h-10 px-3 pr-8 border rounded-lg text-[14px] bg-white outline-none transition-all border-[var(--color-border-strong)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,82,214,0.12)]"
          style={{ color: 'var(--color-text-primary)' }}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {value && !open && (
            <button type="button" onClick={clear} className="text-gray-300 hover:text-gray-500">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {open && (
        <div
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-lg max-h-52 overflow-y-auto"
          style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-dropdown)' }}
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-2.5 text-[13px] text-caption">Sin resultados</p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onMouseDown={() => select(o)}
                className="w-full text-left px-3 py-2 text-[13px] transition-colors"
                style={
                  o.value === value
                    ? { background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontWeight: 500 }
                    : { color: 'var(--color-text-primary)' }
                }
                onMouseEnter={(e) => { if (o.value !== value) e.currentTarget.style.background = 'var(--color-surface-2)' }}
                onMouseLeave={(e) => { if (o.value !== value) e.currentTarget.style.background = '' }}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

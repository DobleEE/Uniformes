import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder = 'Seleccionar...', className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label
            className="block text-[13px] font-medium mb-1.5"
            style={{ color: error ? '#DC2626' : 'var(--color-text-secondary)' }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full h-10 px-3 border rounded-lg text-[14px] bg-white outline-none transition-all ${
            error
              ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.10)]'
              : 'border-[var(--color-border-strong)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,82,214,0.12)]'
          } ${className}`}
          style={{ color: 'var(--color-text-primary)' }}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
      </div>
    )
  }
)

import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
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
        <input
          ref={ref}
          className={`w-full h-10 px-3 border rounded-lg text-[14px] bg-white outline-none transition-all ${
            error
              ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.10)]'
              : 'border-[var(--color-border-strong)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,82,214,0.12)]'
          } ${className}`}
          style={{ color: 'var(--color-text-primary)' }}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[12px] text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

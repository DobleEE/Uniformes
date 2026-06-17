import { useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'

export function useSafeVariants(variants: Variants): Variants {
  const reduce = useReducedMotion()
  if (!reduce) return variants
  return Object.fromEntries(
    Object.entries(variants).map(([k, v]) => [
      k,
      typeof v === 'object' && v !== null && 'transition' in v
        ? { ...v, transition: { ...(v as any).transition, duration: 0 } }
        : v,
    ])
  )
}

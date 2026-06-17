import type { Variants } from 'framer-motion'

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
}

export const fadeInList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

export const fadeInItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
}

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
}

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as any } },
  exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: 0.12 } },
}

export const toastVariants: Variants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as any } },
  exit: { opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.18, ease: 'easeIn' } },
}

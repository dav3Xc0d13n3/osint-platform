import { Variants } from 'framer-motion'

/**
 * Shared motion variants for consistent animations across the app.
 * Respects prefers-reduced-motion via the `reducedMotion` prop.
 */

// Page transition variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -20, filter: 'blur(4px)' },
}

export const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.35,
}

// Container stagger variants
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

export const containerVariantsFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
}

// Item entrance variants
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const itemVariantsSlide: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// List variants for staggered children
export const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
}

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// Card variants with spring
export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
}

// Modal/overlay variants
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
}

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

// Status indicator variants
export const pulseVariants: Variants = {
  initial: { opacity: 0.6, scale: 1 },
  animate: {
    opacity: [0.6, 1, 0.6],
    scale: [1, 1.05, 1],
  },
}

export const blinkVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: [0, 1, 0] },
  transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
}

// Counter animation
export const countUp = (target: number, duration = 1.2) => ({
  hidden: { value: 0 },
  visible: {
    value: target,
    transition: { duration, ease: [0.25, 0.46, 0.45, 0.94] },
  },
})

// Hover/tap variants for interactive elements
export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
}

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
    transition: { duration: 0.3 },
  },
}

export const iconSpin = {
  whileHover: { rotate: 15, scale: 1.1, transition: { duration: 0.3 } },
  whileTap: { scale: 0.9 },
}

export const neonRipple = {
  whileTap: { scale: 0.95 },
}

// Skeleton shimmer
export const shimmerVariants: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
  },
}

// Progress bar animation
export const progressVariants = (progress: number): Variants => ({
  hidden: { scaleX: 0 },
  visible: {
    scaleX: progress / 100,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
})

// Reduced motion variants (minimal)
export const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
}

// Utility to conditionally apply reduced motion
export const getVariants = (
  normal: Variants,
  _reduced = reducedVariants
): { variants: Variants; transition?: Variants['animate'] } => {
  // The actual prefers-reduced-motion check happens in components via useReducedMotion hook
  return { variants: normal }
}
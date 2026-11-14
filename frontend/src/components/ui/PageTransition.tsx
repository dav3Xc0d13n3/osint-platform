import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { pageVariants, pageTransition, reducedVariants } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks'

interface PageTransitionProps {
  children: ReactNode
  className?: string
  mode?: 'wait' | 'popLayout'
}

export function PageTransition({ children, className, mode = 'wait' }: PageTransitionProps) {
  const location = useLocation()
  const reduced = useReducedMotion()

  const variants = useMemo(() => (reduced ? reducedVariants : pageVariants), [reduced])
  const transition = useMemo(() => (reduced ? { duration: 0.1 } : pageTransition), [reduced])

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delayChildren?: number
  staggerChildren?: number
}

export function StaggerContainer({
  children,
  className,
  delayChildren = 0.1,
  staggerChildren = 0.06,
}: StaggerContainerProps) {
  const reduced = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduced ? 0 : staggerChildren,
        delayChildren: reduced ? 0 : delayChildren,
      },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
  custom?: number
}

export function StaggerItem({ children, className, custom = 0 }: StaggerItemProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      variants={reduced ? reducedVariants : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } }}
      className={className}
      custom={custom}
    >
      {children}
    </motion.div>
  )
}
import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode, forwardRef } from 'react'
import { clsx } from 'clsx'
import { cardVariants, hoverLift, hoverGlow } from '../../lib/motion'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'whileHover' | 'whileTap'> {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
}

const variantClasses = {
  default: 'bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 dark:border-white/5',
  bordered: 'bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-cyan-500/30 dark:border-purple-500/30',
  elevated: 'bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-[0_0_40px_rgba(0,240,255,0.08),0_0_80px_rgba(139,92,246,0.04)]',
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = true, glow = false, variant = 'default', padding = 'md', ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={hover ? { ...hoverLift.whileHover, ...(glow ? hoverGlow.whileHover : {}) } : undefined}
        whileTap={hover ? hoverLift.whileTap : undefined}
        className={clsx(
          'rounded-2xl',
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
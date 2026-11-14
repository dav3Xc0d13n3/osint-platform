import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode, forwardRef, ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { neonRipple, hoverLift } from '../../lib/motion'

type NeonButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline'

const variantStyles: Record<NeonButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 
    text-white 
    hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500
    shadow-[0_0_20px_rgba(0,240,255,0.4),0_0_40px_rgba(139,92,246,0.2)]
    hover:shadow-[0_0_30px_rgba(0,240,255,0.6),0_0_60px_rgba(139,92,246,0.3)]
    focus:ring-cyan-500
  `,
  secondary: `
    bg-white/10 dark:bg-white/5 
    text-dark-100 dark:text-white
    border border-white/20 dark:border-white/10
    hover:bg-white/20 dark:hover:bg-white/10
    hover:border-white/30 dark:hover:border-white/20
    shadow-[0_0_20px_rgba(255,255,255,0.05)]
    hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]
    focus:ring-white/50
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-pink-600
    text-white
    hover:from-red-500 hover:to-pink-500
    shadow-[0_0_20px_rgba(255,59,92,0.4)]
    hover:shadow-[0_0_30px_rgba(255,59,92,0.6)]
    focus:ring-red-500
  `,
  ghost: `
    bg-transparent
    text-cyan-400 dark:text-cyan-300
    hover:bg-cyan-500/10 dark:hover:bg-cyan-500/5
    hover:text-cyan-300 dark:hover:text-cyan-200
    focus:ring-cyan-500
  `,
  success: `
    bg-gradient-to-r from-green-600 to-emerald-600
    text-white
    hover:from-green-500 hover:to-emerald-500
    shadow-[0_0_20px_rgba(34,255,136,0.4)]
    hover:shadow-[0_0_30px_rgba(34,255,136,0.6)]
    focus:ring-green-500
  `,
  outline: `
    bg-transparent
    text-cyan-400 dark:text-cyan-300
    border border-cyan-500/50 dark:border-cyan-500/30
    hover:bg-cyan-500/10 dark:hover:bg-cyan-500/5
    hover:border-cyan-400 dark:hover:border-cyan-400
    shadow-[0_0_20px_rgba(0,240,255,0.2)]
    hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
    focus:ring-cyan-500
  `,
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
  xl: 'px-8 py-4 text-xl gap-3',
}

interface NeonButtonProps extends Omit<HTMLMotionProps<'button'>, 'whileHover' | 'whileTap' | 'type'>, ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  variant?: NeonButtonVariant
  size?: keyof typeof sizeStyles
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  loading?: boolean
  className?: string
  fullWidth?: boolean
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    loading = false,
    className,
    fullWidth = false,
    disabled,
    type = 'button',
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        whileHover={!isDisabled ? hoverLift.whileHover : undefined}
        whileTap={!isDisabled ? neonRipple.whileTap : undefined}
        className={clsx(
          'inline-flex items-center justify-center font-medium rounded-xl',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-950',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        style={{
          // Ensure the gradient renders properly
          backgroundSize: '200% 200%',
        }}
        {...props}
      >
        {loading ? (
          <>
            <motion.svg
              className="w-4 h-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </motion.svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    )
  }
)

NeonButton.displayName = 'NeonButton'
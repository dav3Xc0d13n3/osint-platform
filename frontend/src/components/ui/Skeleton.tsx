import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { shimmerVariants } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({
  className,
  variant = 'text',
  width = '100%',
  height,
  lines = 1,
  ...props
}: SkeletonProps) {
  const reduced = useReducedMotion()

  const baseStyles = {
    width,
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '3rem' : '100%'),
    borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '0.375rem' : '0.75rem',
  }

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width,
  } as React.CSSProperties

  if (reduced) {
    return (
      <div
        className={clsx('bg-white/10 dark:bg-white/5 rounded', className)}
        style={{
          ...baseStyles,
          opacity: 0.5,
        }}
        {...props}
      />
    )
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx(className)} style={containerStyles} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className={clsx('bg-white/10 dark:bg-white/5 rounded')}
            style={{
              width: i === lines - 1 ? '70%' : '100%',
              height: '1rem',
              borderRadius: '0.375rem',
            }}
            initial="initial"
            animate="animate"
            variants={shimmerVariants}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={clsx(
        'bg-white/10 dark:bg-white/5 rounded overflow-hidden relative',
        className
      )}
      style={{
        ...baseStyles,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
        backgroundSize: '200% 100%',
      }}
      initial="initial"
      animate="animate"
      variants={shimmerVariants}
      {...props}
    />
  )
}

interface SkeletonCardProps {
  className?: string
  showImage?: boolean
  lines?: number
}

export function SkeletonCard({ className, showImage = true, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={clsx('rounded-2xl bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 dark:border-white/5 p-5', className)}>
      {showImage && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="160px"
          className="rounded-xl mb-4"
        />
      )}
      <Skeleton variant="text" width="60%" className="mb-2" />
      <Skeleton variant="text" width="40%" className="mb-4" />
      <Skeleton variant="text" width="100%" lines={lines} />
    </div>
  )
}

interface SkeletonTableProps {
  rows?: number
  cols?: number
  className?: string
}

export function SkeletonTable({ rows = 5, cols = 4, className }: SkeletonTableProps) {
  return (
    <div className={clsx('rounded-2xl bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 dark:border-white/5 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 dark:border-white/5">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton variant="text" width="80%" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row} className="border-b border-white/5 dark:border-white/5">
                {Array.from({ length: cols }).map((_, col) => (
                  <td key={col} className="px-4 py-3">
                    <Skeleton variant="text" width="90%" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
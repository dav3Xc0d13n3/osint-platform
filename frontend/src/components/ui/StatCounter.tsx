import { useCountUp } from '../../lib/hooks'
import { clsx } from 'clsx'

interface StatCounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  delay?: number
  className?: string
  label?: string
  trend?: string
  trendUp?: boolean
}

export function StatCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.2,
  delay = 0,
  className,
  label,
  trend,
  trendUp = true,
}: StatCounterProps) {
  const animatedValue = useCountUp(value, duration, delay)
  const displayValue = animatedValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <p className="text-xs font-medium text-dark-400 dark:text-dark-500 uppercase tracking-wider">
          {label}
        </p>
      )}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-mono font-bold text-cyan-300 dark:text-cyan-400 tabular-nums">
          {prefix}{displayValue}{suffix}
        </span>
        {trend && (
          <span
            className={clsx(
              'text-sm font-medium flex items-center gap-1',
              trendUp ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trendUp ? '▲' : '▼'} {trend}
          </span>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  icon?: React.ReactNode
  iconColor?: string
  trend?: string
  trendUp?: boolean
  className?: string
  delay?: number
}

export function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  icon,
  iconColor = 'cyan',
  trend,
  trendUp = true,
  className,
  delay = 0,
}: StatCardProps) {
  const iconColors: Record<string, string> = {
    cyan: 'text-cyan-500 bg-cyan-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    green: 'text-green-500 bg-green-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
    red: 'text-red-500 bg-red-500/10',
    magenta: 'text-pink-500 bg-pink-500/10',
  }

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-2xl',
        'bg-white/5 dark:bg-black/30 backdrop-blur-xl',
        'border border-white/10 dark:border-white/5',
        'shadow-[0_0_20px_rgba(0,240,255,0.05)]',
        'hover:shadow-[0_0_40px_rgba(0,240,255,0.1),0_0_80px_rgba(139,92,246,0.05)]',
        'transition-all duration-300',
        'p-5 sm:p-6',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-dark-400 dark:text-dark-500 uppercase tracking-wider">
            {title}
          </p>
          <StatCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            delay={delay}
            trend={trend}
            trendUp={trendUp}
          />
        </div>
        {icon && (
          <div
            className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              iconColors[iconColor] || iconColors.cyan
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
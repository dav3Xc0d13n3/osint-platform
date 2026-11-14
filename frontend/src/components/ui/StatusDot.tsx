import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { usePulse, useBlink } from '../../lib/hooks'

type Status = 'online' | 'offline' | 'degraded' | 'unknown'
type Size = 'sm' | 'md' | 'lg'

const sizeClasses: Record<Size, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2.5 h-2.5',
  lg: 'w-4 h-4',
}

const statusColors: Record<Status, string> = {
  online: 'bg-green-400 shadow-[0_0_8px_rgba(34,255,136,0.8),0_0_16px_rgba(34,255,136,0.4)]',
  offline: 'bg-red-400 shadow-[0_0_8px_rgba(255,59,92,0.8),0_0_16px_rgba(255,59,92,0.4)]',
  degraded: 'bg-yellow-400 shadow-[0_0_8px_rgba(255,209,102,0.8),0_0_16px_rgba(255,209,102,0.4)]',
  unknown: 'bg-dark-400 shadow-[0_0_8px_rgba(148,163,184,0.4)]',
}

interface StatusDotProps {
  status: Status
  size?: Size
  className?: string
  label?: string
  showPulse?: boolean
  showBlink?: boolean
}

export function StatusDot({
  status,
  size = 'md',
  className,
  label,
  showPulse = true,
  showBlink = false,
}: StatusDotProps) {
  const pulse = usePulse(2000)
  const blink = useBlink(1000)

  return (
    <div className={clsx('flex items-center gap-1.5', className)}>
      <motion.span
        className={clsx(
          'rounded-full relative',
          sizeClasses[size],
          statusColors[status],
          status === 'online' && 'animate-pulse',
        )}
        style={{
          // Add custom glow for online status
          boxShadow: status === 'online'
            ? '0 0 8px currentColor, 0 0 16px currentColor, 0 0 24px currentColor'
            : undefined,
        }}
        animate={
          status === 'online' && showPulse && pulse
            ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }
            : status === 'degraded' && showBlink && blink
            ? { opacity: [1, 0.3, 1] }
            : undefined
        }
        transition={{
          duration: status === 'online' ? 2 : 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {label && (
        <span className={clsx(
          'text-xs font-mono font-medium',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          status === 'online' && 'text-green-400',
          status === 'offline' && 'text-red-400',
          status === 'degraded' && 'text-yellow-400',
          status === 'unknown' && 'text-dark-400',
        )}>
        {label}
      </span>}
    </div>
  )
}

interface ServiceStatusProps {
  services: Array<{
    name: string
    status: Status
    latency?: number
  }>
  className?: string
}

export function ServiceStatusBar({ services, className }: ServiceStatusProps) {
  return (
    <div className={clsx('flex flex-wrap items-center gap-3 sm:gap-6', className)}>
      {services.map((service) => (
        <motion.div
          key={service.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 dark:border-white/5"
        >
          <StatusDot status={service.status} size="sm" label={service.name} />
          {service.latency !== undefined && (
            <span className="text-xs font-mono text-cyan-400/80 dark:text-cyan-400/80">
              {service.latency}ms
            </span>
          )}
        </motion.div>
      ))}
    </div>
  )
}
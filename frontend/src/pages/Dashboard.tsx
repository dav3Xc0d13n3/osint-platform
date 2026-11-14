import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useJobsStore } from '../stores/jobs'
import { useAuthStore } from '../stores/auth'
import { Search, Image, Link2, Clock, CheckCircle, XCircle, Loader2, Plus, ExternalLink, TrendingUp, Activity, Database, Zap, BarChart2, Target } from 'lucide-react'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { GlassCard, NeonButton, StatCard, StatusDot, ServiceStatusBar, SkeletonCard, StaggerContainer, StaggerItem } from '../components/ui'
import { containerVariants, itemVariants, listVariants, listItemVariants, cardVariants } from '../lib/motion'

const jobTypeConfig = {
  username: { icon: Search, label: 'Username', color: 'cyan', iconColor: 'cyan' },
  image: { icon: Image, label: 'Image', color: 'green', iconColor: 'green' },
  link: { icon: Link2, label: 'Link', color: 'purple', iconColor: 'purple' },
}

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', color: 'orange' },
  running: { icon: Loader2, label: 'Running', color: 'cyan' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'green' },
  failed: { icon: XCircle, label: 'Failed', color: 'red' },
}

const colorClasses: Record<string, string> = {
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  green: 'text-green-400 bg-green-500/10 border-green-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  red: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const statCardsData = [
  { title: 'Total Searches', icon: Database, color: 'cyan', trend: '+12%', trendUp: true },
  { title: 'Active Jobs', icon: Activity, color: 'green', trend: '+5%', trendUp: true },
  { title: 'Success Rate', icon: TrendingUp, color: 'purple', trend: '+2%', trendUp: true },
  { title: 'Platforms', icon: Target, color: 'orange', trend: '300+', trendUp: true },
]

export default function Dashboard() {
  const { jobs, loading, fetchJobs } = useJobsStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchJobs({ limit: 10 })
  }, [fetchJobs])

  const recentJobs = jobs.slice(0, 10)

  const stats = useMemo(() => [
    { value: jobs.length, ...statCardsData[0] },
    { value: jobs.filter(j => j.status === 'running').length, ...statCardsData[1] },
    { value: jobs.length > 0 ? Math.round((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100) : 0, ...statCardsData[2], suffix: '%' },
    { value: 300, ...statCardsData[3] },
  ], [jobs])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <motion.h1
            className="heading-1"
            whileHover={{ letterSpacing: '0.02em' }}
          >
            Dashboard
          </motion.h1>
          <motion.p className="text-[var(--text-secondary)] mt-1">
            Welcome back, <span className="font-mono text-cyan-400">{user?.name || 'Operator'}</span>
          </motion.p>
        </div>
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          <Link to="/username">
            <NeonButton
              leftIcon={<Plus className="w-4 h-4" />}
              rightIcon={<Zap className="w-4 h-4" />}
              size="md"
            >
              New Search
            </NeonButton>
          </Link>
        </motion.div>
      </motion.div>

      {/* Service Status Bar */}
      <motion.div
        variants={itemVariants}
        className="mb-4"
      >
        <ServiceStatusBar
          services={[
            { name: 'API', status: 'online', latency: 12 },
            { name: 'Database', status: 'online', latency: 5 },
            { name: 'Redis', status: 'online', latency: 2 },
            { name: 'Workers', status: 'online', latency: 8 },
          ]}
        />
      </motion.div>

      {/* Stats Cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerChildren={0.08} delayChildren={0.1}>
        {stats.map((stat, index) => (
          <StaggerItem key={stat.title} custom={index}>
            <StatCard
              {...stat}
              icon={<stat.icon className="w-6 h-6" />}
              delay={index * 100}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/username', icon: Search, title: 'Username Search', desc: 'Find accounts across 300+ platforms', color: 'cyan', accent: 'from-cyan-500 to-blue-500' },
          { href: '/image', icon: Image, title: 'Image Search', desc: 'Reverse image search with EXIF & face matching', color: 'green', accent: 'from-green-500 to-emerald-500' },
          { href: '/link', icon: Link2, title: 'Link Analysis', desc: 'Analyze URLs, redirects, metadata & threats', color: 'purple', accent: 'from-purple-500 to-pink-500' },
        ].map((action, index) => (
          <StaggerItem key={action.href} custom={index}>
            <Link
              to={action.href}
              className={clsx(
                'group relative overflow-hidden rounded-2xl',
                'bg-white/5 dark:bg-black/30 backdrop-blur-xl',
                'border border-white/10 dark:border-white/5',
                'shadow-[0_0_20px_rgba(0,240,255,0.05)]',
                'hover:shadow-[0_0_40px_rgba(0,240,255,0.1),0_0_80px_rgba(139,92,246,0.05)]',
                'transition-all duration-300',
                'p-5 sm:p-6'
              )}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-500/5 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="relative flex items-start gap-4">
                <motion.div
                  className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', `${action.color}-100/20 dark:${action.color}-900/10`)}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <action.icon className={clsx('w-6 h-6', `text-${action.color}-400`)} />
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    className="font-semibold text-[var(--text-primary)] group-hover:text-cyan-400 dark:group-hover:text-cyan-400 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    {action.title}
                  </motion.h3>
                  <motion.p className="text-sm text-[var(--text-secondary)] mt-1">{action.desc}</motion.p>
                </div>
                <motion.div
                  className="w-5 h-5 text-[var(--text-muted)] group-hover:text-cyan-400 transition-colors flex-shrink-0"
                  whileHover={{ x: 4, rotate: 15 }}
                >
                  <ExternalLink className="w-5 h-5" />
                </motion.div>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </motion.div>

      {/* Recent Jobs */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10"
        >
          <motion.h2 className="heading-4">Recent Jobs</motion.h2>
          <motion.a
            href="/settings"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            whileHover={{ x: 4 }}
          >
            View all
          </motion.a>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center"
            >
              <StaggerContainer staggerChildren={0.1} delayChildren={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} showImage={false} lines={2} />
                ))}
              </StaggerContainer>
            </motion.div>
          ) : recentJobs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 text-center"
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-xl"
                style={{
                  background: 'radial-gradient(circle, rgba(0,240,255,0.2) 0%, transparent 70%)',
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="w-16 h-16 text-cyan-400/50 mx-auto" />
              </motion.div>
              <motion.h3 className="heading-4 mb-1">No jobs yet</motion.h3>
              <motion.p className="text-[var(--text-secondary)] mb-4">Start your first investigation using the quick actions above</motion.p>
              <Link to="/username">
                <NeonButton
                  leftIcon={<Plus className="w-4 h-4" />}
                  rightIcon={<Zap className="w-4 h-4" />}
                  size="md"
                >
                  New Search
                </NeonButton>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="jobs"
              variants={listVariants}
              className="divide-y divide-white/5"
            >
              {recentJobs.map((job, index) => {
                const typeCfg = jobTypeConfig[job.job_type]
                const statusCfg = statusConfig[job.status]
                const TypeIcon = typeCfg.icon
                const StatusIcon = statusCfg.icon
                const colorClass = colorClasses[typeCfg.color] || colorClasses.cyan
                const statusColorClass = colorClasses[statusCfg.color] || colorClasses.cyan

                return (
                  <StaggerItem key={job.id} custom={index}>
                    <Link
                      to={`/jobs/${job.id}`}
                      className={clsx(
                        'flex items-center gap-4 p-4 sm:p-5 hover:bg-white/5 dark:hover:bg-white/5',
                        'transition-colors relative overflow-hidden group'
                      )}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent"
                        initial={{ opacity: 0, width: 0 }}
                        whileHover={{ opacity: 1, width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <TypeIcon className="w-6 h-6" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <motion.span
                            className="font-medium text-[var(--text-primary)] truncate"
                            whileHover={{ x: 2 }}
                          >
                            {job.input_data.username || job.input_data.image_url || job.input_data.url || 'Unknown'}
                          </motion.span>
                          <motion.span
                            className={clsx('neon-badge', statusColorClass)}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusCfg.label}
                          </motion.span>
                        </div>
                        <motion.div
                          className="flex items-center gap-3 mt-1 text-sm text-[var(--text-secondary)]"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <span className="font-mono">{typeCfg.label}</span>
                          <span className="text-[var(--text-muted)]">•</span>
                          <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                          {job.progress > 0 && job.status === 'running' && (
                            <motion.div
                              className="w-32 h-1.5 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                            >
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${job.progress}%` }}
                                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                      <motion.div
                        className="w-5 h-5 text-[var(--text-muted)] group-hover:text-cyan-400 transition-colors flex-shrink-0"
                        whileHover={{ x: 4, rotate: 15 }}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </motion.div>
                    </Link>
                  </StaggerItem>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
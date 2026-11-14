import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useJobsStore } from '../stores/jobs'
import { useAuthStore } from '../stores/auth'
import { Search, Image, Link2, Clock, CheckCircle, XCircle, Loader2, Plus, ExternalLink, TrendingUp, Activity, Database } from 'lucide-react'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const jobTypeConfig = {
  username: { icon: Search, label: 'Username', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' },
  image: { icon: Image, label: 'Image', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  link: { icon: Link2, label: 'Link', color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' },
}

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' },
  running: { icon: Loader2, label: 'Running', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' },
}

const statCards = [
  { name: 'Total Searches', icon: Database, color: 'blue', trend: '+12%' },
  { name: 'Active Jobs', icon: Activity, color: 'green', trend: '+5%' },
  { name: 'Success Rate', icon: TrendingUp, color: 'purple', trend: '+2%' },
  { name: 'Platforms', icon: Search, color: 'orange', trend: '300+' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function Dashboard() {
  const { jobs, loading, fetchJobs } = useJobsStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchJobs({ limit: 10 })
  }, [fetchJobs])

  const recentJobs = jobs.slice(0, 10)

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <motion.h1
            className="text-2xl font-bold text-dark-900 dark:text-white"
            whileHover={{ letterSpacing: '0.02em' }}
          >
            Dashboard
          </motion.h1>
          <motion.p className="text-dark-500 dark:text-dark-400 mt-1">
            Welcome back, {user?.name || 'User'}
          </motion.p>
        </div>
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          <motion.a
            href="/username"
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 20px -5px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            <span>New Search</span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={listVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            variants={cardVariants}
            transition={{ delay: index * 0.08 }}
            className="card p-5 hover:shadow-lg transition-all duration-300 group"
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <motion.p className="text-sm font-medium text-dark-500 dark:text-dark-400">{stat.name}</motion.p>
                <motion.p className="text-2xl font-bold text-dark-900 dark:text-white mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {stat.trend}
                </motion.p>
              </div>
              <motion.div
                className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', `${stat.color}-100 dark:${stat.color}-900/30`)}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <stat.icon className={clsx('w-6 h-6', `text-${stat.color}-600 dark:text-${stat.color}-400`)} />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={listVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { href: '/username', icon: Search, title: 'Username Search', desc: 'Find accounts across 300+ platforms', color: 'blue' },
          { href: '/image', icon: Image, title: 'Image Search', desc: 'Reverse image search with EXIF & face matching', color: 'green' },
          { href: '/link', icon: Link2, title: 'Link Analysis', desc: 'Analyze URLs, redirects, metadata & threats', color: 'purple' },
        ].map((action, index) => (
          <motion.div key={action.href} variants={cardVariants} transition={{ delay: index * 0.08 }}>
            <Link
              to={action.href}
              className="card p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-500/5 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="relative flex items-start gap-4">
                <motion.div
                  className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', `${action.color}-100 dark:${action.color}-900/30`)}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <action.icon className={clsx('w-6 h-6', `text-${action.color}-600 dark:text-${action.color}-400`)} />
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    className="font-semibold text-dark-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    {action.title}
                  </motion.h3>
                  <motion.p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{action.desc}</motion.p>
                </div>
                <motion.div
                  className="w-5 h-5 text-dark-400 group-hover:text-primary-600 transition-colors flex-shrink-0"
                  whileHover={{ x: 4, rotate: 15 }}
                >
                  <ExternalLink className="w-5 h-5" />
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Jobs */}
      <motion.div variants={itemVariants} className="card overflow-hidden">
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-700"
        >
          <motion.h2 className="text-lg font-semibold text-dark-900 dark:text-white">Recent Jobs</motion.h2>
          <motion.a
            href="/settings"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
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
              <motion.div
                className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-8 h-8" />
              </motion.div>
              <motion.p className="text-dark-500 dark:text-dark-400">Loading jobs...</motion.p>
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
                className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-3"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="w-12 h-12" />
              </motion.div>
              <motion.h3 className="text-lg font-medium text-dark-900 dark:text-white mb-1">No jobs yet</motion.h3>
              <motion.p className="text-dark-500 dark:text-dark-400 mb-4">Start your first investigation using the quick actions above</motion.p>
              <motion.a
                href="/username"
                className="btn-primary inline-flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                New Search
              </motion.a>
            </motion.div>
          ) : (
            <motion.div
              key="jobs"
              variants={listVariants}
              className="divide-y divide-dark-200 dark:divide-dark-700"
            >
              {recentJobs.map((job, index) => {
                const typeCfg = jobTypeConfig[job.job_type]
                const statusCfg = statusConfig[job.status]
                const TypeIcon = typeCfg.icon
                const StatusIcon = statusCfg.icon

                return (
                  <motion.div
                    key={job.id}
                    variants={listItemVariants}
                    className="group"
                  >
                    <Link
                      to={`/jobs/${job.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent"
                        initial={{ opacity: 0, width: 0 }}
                        whileHover={{ opacity: 1, width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeCfg.color)}
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <TypeIcon className="w-5 h-5" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <motion.span
                            className="font-medium text-dark-900 dark:text-white truncate"
                            whileHover={{ x: 2 }}
                          >
                            {job.input_data.username || job.input_data.image_url || job.input_data.url || 'Unknown'}
                          </motion.span>
                          <motion.span
                            className={clsx('badge', statusCfg.color)}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusCfg.label}
                          </motion.span>
                        </div>
                        <motion.div
                          className="flex items-center gap-3 mt-1 text-sm text-dark-500 dark:text-dark-400"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <span className="font-mono">{typeCfg.label}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                          {job.progress > 0 && job.status === 'running' && (
                            <motion.span
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                            >
                              <div className="w-24 h-1.5 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-primary-600 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${job.progress}%` }}
                                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                                />
                              </div>
                            </motion.span>
                          )}
                        </motion.div>
                      </div>
                      <motion.div
                        className="w-5 h-5 text-dark-400 group-hover:text-primary-600 transition-colors flex-shrink-0"
                        whileHover={{ x: 4, rotate: 15 }}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
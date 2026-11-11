import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useJobsStore } from '../stores/jobs'
import { useAuthStore } from '../stores/auth'
import { Search, Image, Link2, Clock, CheckCircle, XCircle, Loader2, Plus, ExternalLink } from 'lucide-react'
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

export default function Dashboard() {
  const { jobs, loading, fetchJobs } = useJobsStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchJobs({ limit: 10 })
  }, [fetchJobs])

  const recentJobs = jobs.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
          <p className="text-dark-500 dark:text-dark-400">Welcome back, {user?.name || 'User'}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/username" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Search
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/username', icon: Search, title: 'Username Search', desc: 'Find accounts across 300+ platforms', color: 'blue' },
          { href: '/image', icon: Image, title: 'Image Search', desc: 'Reverse image search with EXIF & face matching', color: 'green' },
          { href: '/link', icon: Link2, title: 'Link Analysis', desc: 'Analyze URLs, redirects, metadata & threats', color: 'purple' },
        ].map((action) => (
          <Link key={action.href} to={action.href} className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', `${action.color}-100 dark:${action.color}-900/30`)}>
                <action.icon className={clsx('w-6 h-6', `text-${action.color}-600 dark:text-${action.color}-400`)} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dark-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{action.title}</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{action.desc}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-dark-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-700">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Recent Jobs</h2>
          <Link to="/settings" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">View all</Link>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
            <p className="text-dark-500 dark:text-dark-400">Loading jobs...</p>
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-1">No jobs yet</h3>
            <p className="text-dark-500 dark:text-dark-400 mb-4">Start your first investigation using the quick actions above</p>
            <Link to="/username" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" />
              New Search
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {recentJobs.map((job) => {
              const typeCfg = jobTypeConfig[job.job_type]
              const statusCfg = statusConfig[job.status]
              const TypeIcon = typeCfg.icon
              const StatusIcon = statusCfg.icon

              return (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
                >
                  <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeCfg.color)}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-dark-900 dark:text-white truncate">
                        {job.input_data.username || job.input_data.image_url || job.input_data.url || 'Unknown'}
                      </span>
                      <span className={clsx('badge', statusCfg.color)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-dark-500 dark:text-dark-400">
                      <span className="font-mono">{typeCfg.label}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                      {job.progress > 0 && job.status === 'running' && (
                        <span>• {job.progress}%</span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-dark-400" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
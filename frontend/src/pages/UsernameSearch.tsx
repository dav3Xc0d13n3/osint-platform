import { useState } from 'react'
import { useJobsStore } from '../stores/jobs'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, User, Globe, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const POPULAR_PLATFORMS = [
  'GitHub', 'Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'Reddit', 'YouTube', 'TikTok',
  'Twitch', 'Discord', 'Telegram', 'Medium', 'Dev.to', 'GitLab', 'Bitbucket', 'StackOverflow',
  'Reddit', 'Steam', 'SoundCloud', 'Behance', 'Dribbble', 'Pinterest', 'Vimeo', 'Spotify'
]

export default function UsernameSearch() {
  const navigate = useNavigate()
  const createJob = useJobsStore((state) => state.createJob)
  const [username, setUsername] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [timeout, setTimeout] = useState(30)
  const [loading, setLoading] = useState(false)
  const [showAllPlatforms, setShowAllPlatforms] = useState(false)

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    try {
      const job = await createJob('username', {
        username: username.trim(),
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        timeout,
      })
      if (job) {
        toast.success('Search started')
        navigate(`/jobs/${job.id}`)
      }
    } catch {
      toast.error('Failed to start search')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          Username Search
        </h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Find accounts across 300+ platforms by username</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Username Input */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input pl-10"
              placeholder="johndoe"
              maxLength={50}
              required
              disabled={loading}
              autoFocus
            />
          </div>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">Enter the username to search for (no @ symbol needed)</p>
        </div>

        {/* Platform Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
              Platforms <HelpCircle className="w-4 h-4 inline text-dark-400" title="Leave empty to search all 300+ platforms" />
            </label>
            <button
              type="button"
              onClick={() => setShowAllPlatforms(!showAllPlatforms)}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {showAllPlatforms ? 'Show less' : 'Show all'} ({POPULAR_PLATFORMS.length}+ platforms)
            </button>
          </div>

          <div className={clsx('flex flex-wrap gap-2', !showAllPlatforms && 'max-h-40 overflow-y-auto pr-2')}>
            {POPULAR_PLATFORMS.slice(0, showAllPlatforms ? undefined : 20).map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                  selectedPlatforms.includes(platform)
                    ? 'bg-primary-100 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-400'
                    : 'bg-white border-dark-200 text-dark-700 hover:bg-dark-50 dark:bg-dark-800 dark:border-dark-600 dark:text-dark-300 dark:hover:bg-dark-700'
                )}
              >
                {platform}
              </button>
            ))}
            {!showAllPlatforms && POPULAR_PLATFORMS.length > 20 && (
              <span className="px-3 py-1.5 text-sm text-dark-500 dark:text-dark-400">
                +{POPULAR_PLATFORMS.length - 20} more
              </span>
            )}
          </div>

          {selectedPlatforms.length > 0 && (
            <p className="mt-2 text-sm text-dark-500 dark:text-dark-400">
              {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Advanced Options */}
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-dark-700 dark:text-dark-300">
            <Globe className="w-5 h-5" />
            Advanced Options
          </summary>
          <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700 space-y-4">
            <div>
              <label htmlFor="timeout" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Request Timeout (seconds)
              </label>
              <input
                id="timeout"
                type="number"
                value={timeout}
                onChange={(e) => setTimeout(Math.min(120, Math.max(5, parseInt(e.target.value) || 30)))}
                className="input w-32"
                min={5}
                max={120}
              />
              <p className="mt-1 text-xs text-dark-500 dark:text-dark-400">Timeout per platform request (5-120s)</p>
            </div>
          </div>
        </details>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="btn-primary w-full py-3 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            'Start Search'
          )}
        </button>
      </form>

      {/* Info */}
      <div className="card p-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex gap-4">
          <Search className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-primary-800 dark:text-primary-300">How it works</h3>
            <ul className="mt-2 text-sm text-primary-700 dark:text-primary-400 space-y-1">
              <li>• Checks 300+ platforms concurrently</li>
              <li>• Validates profile existence via HTTP status & content</li>
              <li>• Returns profile URLs, response times, and errors</li>
              <li>• Results cached for faster repeated lookups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
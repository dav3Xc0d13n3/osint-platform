import { useState } from 'react'
import { motion } from 'framer-motion'
import { useJobsStore } from '../stores/jobs'
import { useNavigate } from 'react-router-dom'
import { Search, User, Globe, HelpCircle, Zap, Target } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { NeonButton, GlassCard, StaggerItem } from '../components/ui'
import { itemVariants, containerVariants, listVariants } from '../lib/motion'

const POPULAR_PLATFORMS = [
  'GitHub', 'Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'Reddit', 'YouTube', 'TikTok',
  'Twitch', 'Discord', 'Telegram', 'Medium', 'Dev.to', 'GitLab', 'Bitbucket', 'StackOverflow',
  'Steam', 'SoundCloud', 'Behance', 'Dribbble', 'Pinterest', 'Vimeo', 'Spotify', 'Reddit'
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
        toast.success('Search started', { icon: '🔍' })
        navigate(`/jobs/${job.id}`)
      }
    } catch {
      toast.error('Failed to start search', { icon: '⚠️' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <motion.div className="flex items-center gap-3 mb-2">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)' }}
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <motion.h1 className="heading-2">Username Search</motion.h1>
            <motion.p className="text-[var(--text-secondary)] mt-1">Enumerate accounts across 300+ platforms by username</motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-cyan-400">300+</div>
          <div className="text-xs text-[var(--text-muted)]">Platforms</div>
        </GlassCard>
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-green-400">{'<30s'}</div>
          <div className="text-xs text-[var(--text-muted)]">Avg Time</div>
        </GlassCard>
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-purple-400">99.9%</div>
          <div className="text-xs text-[var(--text-muted)]">Uptime</div>
        </GlassCard>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        variants={itemVariants}
        className="glass-card p-6 space-y-6"
      >
        {/* Username Input */}
        <motion.div variants={itemVariants}>
          <label htmlFor="username" className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1">
            Username <span className="text-red-400">*</span>
          </label>
          <motion.div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" aria-hidden="true" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="neon-input pl-10 pr-10"
              placeholder="johndoe"
              maxLength={50}
              required
              disabled={loading}
              autoFocus
            />
            {username && (
              <motion.button
                type="button"
                onClick={() => setUsername('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-cyan-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Clear username"
              >
                <Search className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Enter the username to search for (no @ symbol needed)</p>
        </motion.div>

        {/* Platform Selection */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1">
              Platforms
              <HelpCircle className="w-4 h-4 text-[var(--text-muted)]" aria-label="Leave empty to search all 300+ platforms" />
            </label>
            <motion.button
              type="button"
              onClick={() => setShowAllPlatforms(!showAllPlatforms)}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showAllPlatforms ? 'Show less' : 'Show all'} ({POPULAR_PLATFORMS.length} platforms)
            </motion.button>
          </div>

          <motion.div
            className={clsx('flex flex-wrap gap-2', !showAllPlatforms && 'max-h-48 overflow-y-auto pr-2 scrollbar-cyber')}
            initial="hidden"
            animate="visible"
            variants={listVariants}
          >
            {POPULAR_PLATFORMS.slice(0, showAllPlatforms ? undefined : 20).map((platform) => (
              <StaggerItem key={platform} custom={POPULAR_PLATFORMS.indexOf(platform)}>
                <motion.button
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-mono text-xs border transition-all duration-200',
                    selectedPlatforms.includes(platform)
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : 'bg-white/5 dark:bg-black/30 border-white/10 text-[var(--text-secondary)] hover:bg-white/10 dark:hover:bg-white/5 hover:border-cyan-500/30'
                  )}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {platform}
                </motion.button>
              </StaggerItem>
            ))}
            {!showAllPlatforms && POPULAR_PLATFORMS.length > 20 && (
              <motion.span className="px-3 py-1.5 text-sm text-[var(--text-muted)]">
                +{POPULAR_PLATFORMS.length - 20} more
              </motion.span>
            )}
          </motion.div>

          {selectedPlatforms.length > 0 && (
            <motion.p
              className="mt-2 text-sm text-cyan-400/80"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
            </motion.p>
          )}
        </motion.div>

        {/* Advanced Options */}
        <motion.div variants={itemVariants}>
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--text-secondary)]">
              <Globe className="w-5 h-5" />
              Advanced Options
            </summary>
            <motion.div
              className="mt-4 pt-4 border-t border-white/10 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <motion.div>
                <label htmlFor="timeout" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Request Timeout (seconds)
                </label>
                <input
                  id="timeout"
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(Math.min(120, Math.max(5, parseInt(e.target.value) || 30)))}
                  className="neon-input w-32"
                  min={5}
                  max={120}
                />
                <p className="mt-1 text-xs text-[var(--text-muted)]">Timeout per platform request (5-120s)</p>
              </motion.div>
            </motion.div>
          </details>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants}>
          <NeonButton
            type="submit"
            disabled={loading || !username.trim()}
            loading={loading}
            leftIcon={<Zap className="w-5 h-5" />}
            rightIcon={<Target className="w-5 h-5" />}
            className="w-full"
            size="lg"
          >
            Start Search
          </NeonButton>
        </motion.div>
      </motion.form>

      {/* Info Panel */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6 border-cyan-500/20"
        style={{ background: 'rgba(0,240,255,0.03)' }}
      >
        <motion.div className="flex gap-4">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)' }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Search className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <motion.h3 className="font-medium text-cyan-400">How it works</motion.h3>
            <motion.ul className="mt-2 text-sm text-[var(--text-secondary)] space-y-1.5" variants={listVariants}>
              <motion.li variants={listItemVariants}>• Checks 300+ platforms concurrently</motion.li>
              <motion.li variants={listItemVariants}>• Validates profile existence via HTTP status & content</motion.li>
              <motion.li variants={listItemVariants}>• Returns profile URLs, response times, and errors</motion.li>
              <motion.li variants={listItemVariants}>• Results cached for faster repeated lookups</motion.li>
            </motion.ul>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useJobsStore } from '../stores/jobs'
import { useNavigate } from 'react-router-dom'
import { Link2, Loader2, Search, Globe, Shield, Clock, Zap, Target, Zap as ZapIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { NeonButton, GlassCard, StaggerContainer, StaggerItem } from '../components/ui'
import { itemVariants, cardVariants, containerVariants, listVariants } from '../lib/motion'

const options = [
  { key: 'expandShorteners', label: 'Expand URL Shorteners', desc: 'Resolve bit.ly, t.co, tinyurl, etc.', icon: Link2, color: 'cyan' },
  { key: 'followRedirects', label: 'Follow Redirects', desc: 'Trace full redirect chain with timing', icon: Globe, color: 'blue' },
  { key: 'extractMetadata', label: 'Extract Metadata', desc: 'Open Graph, Twitter Cards, JSON-LD, microdata', icon: Search, color: 'purple' },
  { key: 'checkSSL', label: 'SSL Certificate Analysis', desc: 'Issuer, validity, SAN, fingerprint', icon: Shield, color: 'green' },
  { key: 'enumerateSubdomains', label: 'Subdomain Enumeration', desc: 'Passive discovery via CT logs', icon: Globe, color: 'orange' },
  { key: 'checkArchives', label: 'Archive Snapshots', desc: 'Wayback Machine historical captures', icon: Clock, color: 'magenta' },
  { key: 'threatIntel', label: 'Threat Intelligence', desc: 'VirusTotal, URLhaus, AlienVault OTX', icon: Shield, color: 'red' },
]

export default function LinkAnalysis() {
  const navigate = useNavigate()
  const createJob = useJobsStore((state) => state.createJob)
  const [url, setUrl] = useState('')
  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>(
    options.reduce((acc, opt) => ({ ...acc, [opt.key]: true }), {})
  )
  const [loading, setLoading] = useState(false)

  const toggleOption = (key: string) => {
    setCheckedOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    try {
      new URL(url.trim())
    } catch {
      toast.error('Please enter a valid URL', { icon: '⚠️' })
      return
    }

    setLoading(true)
    try {
      const job = await createJob('link', {
        url: url.trim(),
        expand_shorteners: checkedOptions.expandShorteners,
        follow_redirects: checkedOptions.followRedirects,
        extract_metadata: checkedOptions.extractMetadata,
        check_ssl: checkedOptions.checkSSL,
        enumerate_subdomains: checkedOptions.enumerateSubdomains,
        check_archives: checkedOptions.checkArchives,
        threat_intel: checkedOptions.threatIntel,
      })
      if (job) {
        toast.success('Analysis started', { icon: '🔗' })
        navigate(`/jobs/${job.id}`)
      }
    } catch {
      toast.error('Failed to start analysis', { icon: '⚠️' })
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
            style={{ background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-magenta) 100%)' }}
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link2 className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <motion.h1 className="heading-2">Link Analysis</motion.h1>
            <motion.p className="text-[var(--text-secondary)] mt-1">Analyze URLs: redirects, metadata, SSL, subdomains, archives & threat intel</motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-3">
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-purple-400">7</div>
          <div className="text-xs text-[var(--text-muted)]">Modules</div>
        </GlassCard>
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-cyan-400"><5s</div>
          <div className="text-xs text-[var(--text-muted)]">Avg Time</div>
        </GlassCard>
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-green-400">SSL</div>
          <div className="text-xs text-[var(--text-muted)]">Analysis</div>
        </GlassCard>
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-orange-400">CT Logs</div>
          <div className="text-xs text-[var(--text-muted)]">Subdomains</div>
        </GlassCard>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        variants={itemVariants}
        className="glass-card p-6 space-y-6"
      >
        {/* URL Input */}
        <motion.div variants={itemVariants}>
          <label htmlFor="url" className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1">
            URL <span className="text-red-400">*</span>
          </label>
          <motion.div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" aria-hidden="true" />
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="neon-input pl-10 pr-10"
              placeholder="https://example.com"
              required
              disabled={loading}
              autoFocus
            />
            {url && (
              <motion.button
                type="button"
                onClick={() => setUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-cyan-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Clear URL"
              >
                <Search className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {/* Options */}
        <motion.div variants={itemVariants}>
          <motion.h3 className="font-medium text-[var(--text-secondary)] mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Analysis Modules
          </motion.h3>
          <StaggerContainer className="space-y-3" staggerChildren={0.05}>
            {options.map((option) => (
              <StaggerItem key={option.key}>
                <motion.label
                  className={clsx(
                    'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200',
                    checkedOptions[option.key]
                      ? `border-${option.color}-500/50 bg-${option.color}-500/10 shadow-[0_0_20px_rgba(0,240,255,0.1)]`
                      : 'border-white/10 hover:border-cyan-400/30'
                  )}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    type="checkbox"
                    checked={checkedOptions[option.key]}
                    onChange={() => toggleOption(option.key)}
                    className="w-4 h-4 text-green-500 border-white/20 rounded focus:ring-green-500"
                  />
                  <div className="flex items-center gap-3">
                    <option.icon className={`w-5 h-5 text-${option.color}-400 flex-shrink-0`} />
                    <div className="flex-1">
                      <span className="font-medium text-[var(--text-primary)]">{option.label}</span>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{option.desc}</p>
                    </div>
                  </div>
                </motion.label>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants}>
          <NeonButton
            type="submit"
            disabled={loading || !url.trim()}
            loading={loading}
            leftIcon={<ZapIcon className="w-5 h-5" />}
            rightIcon={<Target className="w-5 h-5" />}
            className="w-full"
            size="lg"
          >
            Start Analysis
          </NeonButton>
        </motion.div>
      </motion.form>

      {/* Info Panel */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6 border-purple-500/20"
        style={{ background: 'rgba(139,92,246,0.03)' }}
      >
        <motion.div className="flex gap-4">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-magenta) 100%)' }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Link2 className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <motion.h3 className="font-medium text-purple-400">What you get</motion.h3>
            <motion.ul className="mt-2 text-sm text-[var(--text-secondary)] space-y-1.5 grid grid-cols-1 md:grid-cols-2 gap-x-4" variants={listVariants}>
              <motion.li variants={listItemVariants}>• Full redirect chain with status codes & latency</motion.li>
              <motion.li variants={listItemVariants}>• Open Graph, Twitter Cards, JSON-LD metadata</motion.li>
              <motion.li variants={listItemVariants}>• SSL certificate details (issuer, validity, SAN)</motion.li>
              <motion.li variants={listItemVariants}>• Passive subdomain enumeration via CT logs</motion.li>
              <motion.li variants={listItemVariants}>• Wayback Machine snapshot history</motion.li>
              <motion.li variants={listItemVariants}>• Threat intel: VirusTotal, URLhaus, AlienVault</motion.li>
            </motion.ul>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
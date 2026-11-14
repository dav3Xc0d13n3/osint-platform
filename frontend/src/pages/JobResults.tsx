import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useJobsStore } from '../stores/jobs'
import { Loader2, CheckCircle, XCircle, Clock, Search, Image, Link2, ExternalLink, ChevronDown, Copy, Download, Shield, Globe, Link as LinkIcon, Zap, Target } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { clsx } from 'clsx'
import { NeonButton, GlassCard, StaggerContainer, StaggerItem } from '../components/ui'
import { itemVariants, cardVariants, containerVariants, listVariants, listItemVariants, progressVariants } from '../lib/motion'

const jobTypeConfig = {
  username: { icon: Search, label: 'Username Search', color: 'cyan' },
  image: { icon: Image, label: 'Image Search', color: 'green' },
  link: { icon: Link2, label: 'Link Analysis', color: 'purple' },
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
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

const statusColorClasses: Record<string, string> = {
  pending: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  running: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  completed: 'text-green-400 bg-green-500/10 border-green-500/20',
  failed: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function JobResults() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchJob, pollJob, currentJob, clearCurrentJob } = useJobsStore()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchJob(id).then((job) => {
        if (job && (job.status === 'pending' || job.status === 'running')) {
          pollJob(id)
        }
      })
    }
    return () => clearCurrentJob()
  }, [id, fetchJob, pollJob, clearCurrentJob])

  if (!currentJob || currentJob.id !== id) {
    return (
      <motion.div
        className="flex items-center justify-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-8 h-8 text-cyan-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8" />
        </motion.div>
      </motion.div>
    )
  }

  const job = currentJob
  const typeCfg = jobTypeConfig[job.job_type as keyof typeof jobTypeConfig] || jobTypeConfig.username
  const statusCfg = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.pending
  const TypeIcon = typeCfg.icon
  const StatusIcon = statusCfg.icon
  const typeColorClass = colorClasses[typeCfg.color] || colorClasses.cyan
  const statusColorClass = statusColorClasses[job.status] || statusColorClasses.pending

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const renderSection = (title: string, sectionKey: string, icon: React.ReactNode, children: React.ReactNode) => (
    <motion.div
      className="glass-card rounded-xl overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors text-left"
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="font-medium text-cyan-400 flex items-center gap-2">
          {icon}
          {title}
        </span>
        <motion.div
          className="w-5 h-5 transition-transform duration-300"
          animate={{ rotate: expandedSections[sectionKey] !== false ? 180 : 0 }}
        >
          <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
        </motion.div>
      </motion.button>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        {expandedSections[sectionKey] !== false && (
          <div className="p-4 pt-0">{children}</div>
        )}
      </motion.div>
    </motion.div>
  )

  const renderUsernameResults = (data: any) => {
    if (!data?.results) return null

    const found = data.results.filter((r: any) => r.exists)
    const notFound = data.results.filter((r: any) => !r.exists && !r.error)
    const errors = data.results.filter((r: any) => r.error)

    return (
      <motion.div className="space-y-4" variants={listVariants}>
        <motion.div
          variants={listItemVariants}
          className="grid grid-cols-3 gap-3"
        >
          <GlassCard variant="bordered" padding="md" className="text-center">
            <motion.div className="text-3xl font-mono font-bold text-green-400">{found.length}</motion.div>
            <motion.div className="text-xs text-[var(--text-muted)]">Found</motion.div>
          </GlassCard>
          <GlassCard variant="bordered" padding="md" className="text-center">
            <motion.div className="text-3xl font-mono font-bold text-[var(--text-muted)]">{notFound.length}</motion.div>
            <motion.div className="text-xs text-[var(--text-muted)]">Not Found</motion.div>
          </GlassCard>
          <GlassCard variant="bordered" padding="md" className="text-center">
            <motion.div className="text-3xl font-mono font-bold text-red-400">{errors.length}</motion.div>
            <motion.div className="text-xs text-[var(--text-muted)]">Errors</motion.div>
          </GlassCard>
        </motion.div>

        {found.length > 0 && renderSection(
          `Found Profiles (${found.length})`,
          'found',
          <CheckCircle className="w-5 h-5 text-green-400" />,
          <motion.div className="space-y-2 max-h-96 overflow-y-auto" variants={listVariants}>
            {found.map((result: any, i: number) => (
              <StaggerItem key={i} custom={i}>
                <motion.div className="glass-card p-3 flex items-center justify-between gap-3" whileHover={{ x: 4 }}>
                  <div className="flex-1 min-w-0">
                    <motion.a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-cyan-400 hover:text-cyan-300 truncate block"
                      whileHover={{ x: 2 }}
                    >
                      {result.platform}
                    </motion.a>
                    <motion.div className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-1">
                      {result.status_code && <span>HTTP {result.status_code}</span>}
                      {result.response_time && <span>• {result.response_time}s</span>}
                    </motion.div>
                  </div>
                  <motion.button
                    onClick={() => copyToClipboard(result.url, `url-${i}`)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {copiedField === `url-${i}` ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </motion.button>
                </motion.div>
              </StaggerItem>
            ))}
          </motion.div>
        )}
      </motion.div>
    )
  }

  const renderImageResults = (data: any) => {
    if (!data) return null

    return (
      <motion.div className="space-y-4" variants={listVariants}>
        {data.exif && renderSection(
          'EXIF Metadata',
          'exif',
          <Image className="w-5 h-5 text-cyan-400" />,
          <motion.div className="p-3 bg-white/5 dark:bg-black/30 backdrop-blur-xl rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(data.exif, null, 2)}</pre>
          </motion.div>
        )}

        {data.perceptual_hash && renderSection(
          'Perceptual Hash',
          'phash',
          <Search className="w-5 h-5 text-cyan-400" />,
          <motion.div className="p-3 bg-white/5 dark:bg-black/30 backdrop-blur-xl rounded-lg font-mono text-sm">
            <code>{data.perceptual_hash}</code>
            <motion.button
              onClick={() => copyToClipboard(data.perceptual_hash, 'phash')}
              className="ml-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {copiedField === 'phash' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
            </motion.button>
          </motion.div>
        )}

        {data.face_matches && data.face_matches.length > 0 && renderSection(
          `Face Matches (${data.face_matches.length})`,
          'faces',
          <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">👤</span>,
          <motion.div className="space-y-2" variants={listVariants}>
            {data.face_matches.map((match: any, i: number) => (
              <StaggerItem key={i} custom={i}>
                <motion.div className="glass-card p-3 flex items-center gap-3" whileHover={{ x: 4 }}>
                  {match.thumbnail && (
                    <motion.img
                      src={match.thumbnail}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    />
                  )}
                  <div className="flex-1">
                    <motion.a
                      href={match.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-cyan-400 hover:text-cyan-300"
                      whileHover={{ x: 2 }}
                    >
                      {match.platform}
                    </motion.a>
                    <motion.div className="text-sm text-[var(--text-secondary)]">Confidence: {(match.confidence * 100).toFixed(1)}%</motion.div>
                  </div>
                  <motion.button
                    onClick={() => copyToClipboard(match.profile_url, `face-${i}`)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {copiedField === `face-${i}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
                  </motion.button>
                </motion.div>
              </StaggerItem>
            ))}
          </motion.div>
        )}

        {data.engine_results && Object.keys(data.engine_results).length > 0 && renderSection(
          'Engine Results',
          'engines',
          <Globe className="w-5 h-5 text-cyan-400" />,
          <motion.div className="space-y-3" variants={listVariants}>
            {Object.entries(data.engine_results).map(([engine, results]: [string, any], engineIndex) => (
              <StaggerItem key={engine} custom={engineIndex}>
                <motion.div className="glass-card p-3" whileHover={{ x: 4 }}>
                  <motion.h5 className="font-medium text-[var(--text-primary)] capitalize mb-2">{engine} ({results.length} results)</motion.h5>
                  <motion.div className="space-y-2" variants={listVariants}>
                    {results.slice(0, 10).map((r: any, i: number) => (
                      <StaggerItem key={i} custom={i}>
                        <motion.a
                          href={r.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                          whileHover={{ x: 4 }}
                        >
                          <div className="font-medium text-cyan-400 truncate">{r.title}</div>
                          <div className="text-[var(--text-muted)] truncate">{r.link}</div>
                          <div className="text-xs text-[var(--text-muted)]">{r.snippet}</div>
                        </motion.a>
                      </StaggerItem>
                    ))}
                  </motion.div>
                </motion.div>
              </StaggerItem>
            ))}
          </motion.div>
        )}
      </motion.div>
    )
  }

  const renderLinkResults = (data: any) => {
    if (!data) return null

    return (
      <motion.div className="space-y-4" variants={listVariants}>
        {data.redirect_chain && data.redirect_chain.length > 0 && renderSection(
          `Redirect Chain (${data.redirect_chain.length} hops)`,
          'redirects',
          <LinkIcon className="w-5 h-5 text-cyan-400" />,
          <motion.div className="space-y-2" variants={listVariants}>
            {data.redirect_chain.map((hop: any, i: number) => (
              <StaggerItem key={i} custom={i}>
                <motion.div className="glass-card p-3 flex items-center gap-3" whileHover={{ x: 4 }}>
                  <motion.span className="w-6 text-center text-[var(--text-muted)] font-mono">{i + 1}</motion.span>
                  <div className="flex-1 min-w-0">
                    <motion.a
                      href={hop.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-cyan-400 hover:text-cyan-300 truncate block"
                      whileHover={{ x: 2 }}
                    >
                      {hop.url}
                    </motion.a>
                    <motion.div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                      <motion.span
                        className={clsx(
                          'px-1.5 py-0.5 rounded text-xs font-mono',
                          hop.status_code >= 400
                            ? 'text-red-400 bg-red-500/10'
                            : 'text-green-400 bg-green-500/10'
                        )}
                      >
                        {hop.status_code}
                      </motion.span>
                      <span>{hop.latency}s</span>
                    </motion.div>
                  </div>
                  <motion.button
                    onClick={() => copyToClipboard(hop.url, `redirect-${i}`)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {copiedField === `redirect-${i}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
                  </motion.button>
                </motion.div>
              </StaggerItem>
            ))}
          </motion.div>
        )}

        {data.metadata && renderSection(
          'Page Metadata',
          'metadata',
          <Search className="w-5 h-5 text-cyan-400" />,
          <motion.div className="p-3 bg-white/5 dark:bg-black/30 backdrop-blur-xl rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(data.metadata, null, 2)}</pre>
          </motion.div>
        )}

        {data.ssl && renderSection(
          'SSL Certificate',
          'ssl',
          <Shield className="w-5 h-5 text-cyan-400" />,
          <motion.div className="p-3 bg-white/5 dark:bg-black/30 backdrop-blur-xl rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(data.ssl, null, 2)}</pre>
          </motion.div>
        )}

        {data.subdomains && data.subdomains.length > 0 && renderSection(
          `Subdomains (${data.subdomains.length})`,
          'subdomains',
          <Globe className="w-5 h-5 text-cyan-400" />,
          <motion.div className="flex flex-wrap gap-2" variants={listVariants}>
            {data.subdomains.slice(0, 50).map((sub: string, i: number) => (
              <StaggerItem key={i} custom={i}>
                <motion.span
                  className="neon-badge text-cyan-400 border-cyan-500/30 font-mono text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {sub}
                </motion.span>
              </StaggerItem>
            ))}
            {data.subdomains.length > 50 && (
              <motion.span className="neon-badge text-[var(--text-muted)] border-white/10">+{data.subdomains.length - 50} more</motion.span>
            )}
          </motion.div>
        )}

        {data.archive_snapshots && data.archive_snapshots.length > 0 && renderSection(
          `Archive Snapshots (${data.archive_snapshots.length})`,
          'archives',
          <Clock className="w-5 h-5 text-cyan-400" />,
          <motion.div className="space-y-2" variants={listVariants}>
            {data.archive_snapshots.slice(0, 20).map((snap: string, i: number) => (
              <StaggerItem key={i} custom={i}>
                <motion.a
                  href={snap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-3 flex items-center justify-between gap-3 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-shadow"
                  whileHover={{ x: 4 }}
                >
                  <motion.span className="font-mono text-sm text-cyan-400 truncate flex-1">{snap}</motion.span>
                  <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                </motion.a>
              </StaggerItem>
            ))}
          </motion.div>
        )}

        {data.threat_intel && data.threat_intel.length > 0 && renderSection(
          'Threat Intelligence',
          'threats',
          <Shield className="w-5 h-5 text-cyan-400" />,
          <motion.div className="space-y-3" variants={listVariants}>
            {data.threat_intel.map((t: any, i: number) => (
              <StaggerItem key={i} custom={i}>
                <motion.div className="glass-card p-3" whileHover={{ x: 4 }}>
                  <motion.div className="flex items-center justify-between">
                    <motion.span className="font-medium text-[var(--text-primary)]">{t.source}</motion.span>
                    <motion.span className={clsx('neon-badge', t.malicious ? 'text-red-400 border-red-500/30' : 'text-green-400 border-green-500/30')}>
                      {t.malicious ? 'Malicious' : 'Clean'}
                    </motion.span>
                  </motion.div>
                  {t.categories && t.categories.length > 0 && (
                    <motion.div className="mt-2 flex flex-wrap gap-1" variants={listVariants}>
                      {t.categories.map((c: string, j: number) => (
                        <StaggerItem key={j} custom={j}>
                          <motion.span className="neon-badge text-[var(--text-secondary)] border-white/10 text-xs" whileHover={{ scale: 1.05 }}>
                            {c}
                          </motion.span>
                        </StaggerItem>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </StaggerItem>
            ))}
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <motion.div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <div>
            <motion.div className="flex items-center gap-2">
              <motion.div
                className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', typeColorClass)}
                whileHover={{ scale: 1.05, rotate: 3 }}
              >
                <TypeIcon className="w-6 h-6" />
              </motion.div>
              <motion.h1 className="heading-3">{typeCfg.label}</motion.h1>
            </motion.div>
            <motion.p className="text-[var(--text-secondary)]">
              {job.input_data.username || job.input_data.image_url || job.input_data.url || 'Unknown'}
            </motion.p>
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <motion.span
            className={clsx('neon-badge flex items-center gap-1', statusColorClass)}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </motion.span>
          {job.status === 'completed' && job.result_data && (
            <NeonButton
              variant="secondary"
              onClick={() => {
                const blob = new Blob([JSON.stringify(job.result_data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `osint-${job.job_type}-${job.id.slice(0, 8)}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              leftIcon={<Download className="w-4 h-4" />}
              size="sm"
            >
              Export JSON
            </NeonButton>
          )}
        </motion.div>
      </motion.div>

      {/* Progress */}
      {(job.status === 'pending' || job.status === 'running') && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-4"
        >
          <motion.div className="flex items-center justify-between mb-2">
            <motion.span className="text-sm font-medium text-[var(--text-secondary)]">Progress</motion.span>
            <motion.span
              className="text-sm font-mono text-cyan-400"
              animate={{ text: [0, job.progress] }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {job.progress}%
            </motion.span>
          </motion.div>
          <motion.div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                backgroundSize: '200% 100%',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${job.progress}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </motion.div>
          <motion.p className="text-xs text-[var(--text-muted)] mt-2 text-center">
            {job.status === 'pending' ? 'Queued for processing...' : 'Processing...'}
          </motion.p>
        </motion.div>
      )}

      {/* Error */}
      {job.status === 'failed' && job.error_message && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-4 border-red-500/30"
          style={{ background: 'rgba(255,59,92,0.1)' }}
        >
          <motion.div className="flex items-center gap-3" whileHover={{ x: 2 }}>
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,59,92,0.2)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <XCircle className="w-5 h-5 text-red-400" />
            </motion.div>
            <div>
              <motion.p className="font-medium text-red-400">Job Failed</motion.p>
              <motion.p className="text-sm text-red-400/80">{job.error_message}</motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Results */}
      {job.status === 'completed' && job.result_data && (
        <motion.div
          variants={itemVariants}
          className="glass-card overflow-hidden"
        >
          <motion.div className="p-4 border-b border-white/10">
            <motion.h2 className="heading-4">Results</motion.h2>
          </motion.div>
          <motion.div className="p-4">
            {job.job_type === 'username' && renderUsernameResults(job.result_data)}
            {job.job_type === 'image' && renderImageResults(job.result_data)}
            {job.job_type === 'link' && renderLinkResults(job.result_data)}
          </motion.div>
        </motion.div>
      )}

      {/* Job Info */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-4"
      >
        <motion.h3 className="font-medium text-[var(--text-primary)] mb-3">Job Information</motion.h3>
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" staggerChildren={0.05}>
          <StaggerItem>
            <motion.div className="glass-card p-3 text-center" whileHover={{ y: -2 }}>
              <motion.p className="text-[var(--text-muted)]">Job ID</motion.p>
              <motion.p className="font-mono text-[var(--text-primary)] truncate">{job.id}</motion.p>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div className="glass-card p-3 text-center" whileHover={{ y: -2 }}>
              <motion.p className="text-[var(--text-muted)]">Type</motion.p>
              <motion.p className="font-medium text-[var(--text-primary)] capitalize">{job.job_type}</motion.p>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div className="glass-card p-3 text-center" whileHover={{ y: -2 }}>
              <motion.p className="text-[var(--text-muted)]">Created</motion.p>
              <motion.p className="font-mono text-[var(--text-primary)]">{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</motion.p>
            </motion.div>
          </StaggerItem>
          {job.started_at && (
            <StaggerItem>
              <motion.div className="glass-card p-3 text-center" whileHover={{ y: -2 }}>
                <motion.p className="text-[var(--text-muted)]">Started</motion.p>
                <motion.p className="font-mono text-[var(--text-primary)]">{formatDistanceToNow(new Date(job.started_at), { addSuffix: true })}</motion.p>
              </motion.div>
            </StaggerItem>
          )}
          {job.completed_at && (
            <StaggerItem>
              <motion.div className="glass-card p-3 text-center" whileHover={{ y: -2 }}>
                <motion.p className="text-[var(--text-muted)]">Completed</motion.p>
                <motion.p className="font-mono text-[var(--text-primary)]">{formatDistanceToNow(new Date(job.completed_at), { addSuffix: true })}</motion.p>
              </motion.div>
            </StaggerItem>
          )}
          {job.elapsed_time && (
            <StaggerItem>
              <motion.div className="glass-card p-3 text-center" whileHover={{ y: -2 }}>
                <motion.p className="text-[var(--text-muted)]">Elapsed</motion.p>
                <motion.p className="font-mono text-[var(--text-primary)]">{job.elapsed_time}s</motion.p>
              </motion.div>
            </StaggerItem>
          )}
        </StaggerContainer>
      </motion.div>
    </motion.div>
  )
}
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJobsStore } from '../stores/jobs'
import { Loader2, CheckCircle, XCircle, Clock, Search, Image, Link2, ExternalLink, ChevronDown, Copy, Check, Download, Shield, Globe, Link as LinkIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { clsx } from 'clsx'

const jobTypeConfig = {
  username: { icon: Search, label: 'Username Search', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' },
  image: { icon: Image, label: 'Image Search', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  link: { icon: Link2, label: 'Link Analysis', color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' },
}

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' },
  running: { icon: Loader2, label: 'Running', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' },
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const job = currentJob
  const typeCfg = jobTypeConfig[job.job_type as keyof typeof jobTypeConfig] || jobTypeConfig.username
  const statusCfg = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.pending
  const TypeIcon = typeCfg.icon
  const StatusIcon = statusCfg.icon

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const renderSection = (title: string, sectionKey: string, icon: React.ReactNode, children: React.ReactNode) => (
    <details
      className="group"
      open={expandedSections[sectionKey] !== false}
      onToggle={() => toggleSection(sectionKey)}
    >
      <summary className="flex items-center justify-between cursor-pointer p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <span className="font-medium text-primary-800 dark:text-primary-300 flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ChevronDown className={clsx('w-5 h-5 transition-transform', expandedSections[sectionKey] && 'rotate-180')} />
      </summary>
      {expandedSections[sectionKey] !== false && <div className="mt-3">{children}</div>}
    </details>
  )

  const renderUsernameResults = (data: any) => {
    if (!data?.results) return null

    const found = data.results.filter((r: any) => r.exists)
    const notFound = data.results.filter((r: any) => !r.exists && !r.error)
    const errors = data.results.filter((r: any) => r.error)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{found.length}</div>
            <div className="text-sm text-dark-500 dark:text-dark-400">Found</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-dark-500 dark:text-dark-400">{notFound.length}</div>
            <div className="text-sm text-dark-500 dark:text-dark-400">Not Found</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{errors.length}</div>
            <div className="text-sm text-dark-500 dark:text-dark-400">Errors</div>
          </div>
        </div>

        {found.length > 0 && renderSection(
          `Found Profiles (${found.length})`,
          'found',
          <CheckCircle className="w-5 h-5" />,
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {found.map((result: any, i: number) => (
              <div key={i} className="card p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 truncate block">{result.platform}</a>
                  <div className="text-xs text-dark-500 dark:text-dark-400 flex items-center gap-2 mt-1">
                    {result.status_code && <span>HTTP {result.status_code}</span>}
                    {result.response_time && <span>• {result.response_time}s</span>}
                  </div>
                </div>
                <button onClick={() => copyToClipboard(result.url, `url-${i}`)} className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-800">
                  {copiedField === `url-${i}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderImageResults = (data: any) => {
    if (!data) return null

    return (
      <div className="space-y-4">
        {data.exif && renderSection(
          'EXIF Metadata',
          'exif',
          <Image className="w-5 h-5" />,
          <div className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(data.exif, null, 2)}</pre>
          </div>
        )}

        {data.perceptual_hash && renderSection(
          'Perceptual Hash',
          'phash',
          <Search className="w-5 h-5" />,
          <div className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg font-mono text-sm">
            <code>{data.perceptual_hash}</code>
            <button onClick={() => copyToClipboard(data.perceptual_hash, 'phash')} className="ml-2 p-1 rounded hover:bg-dark-200 dark:hover:bg-dark-700">
              {copiedField === 'phash' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}

        {data.face_matches && data.face_matches.length > 0 && renderSection(
          `Face Matches (${data.face_matches.length})`,
          'faces',
          <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">👤</span>,
          <div className="space-y-2">
            {data.face_matches.map((match: any, i: number) => (
              <div key={i} className="card p-3 flex items-center gap-3">
                {match.thumbnail && <img src={match.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <div className="flex-1">
                  <a href={match.profile_url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">{match.platform}</a>
                  <div className="text-sm text-dark-500 dark:text-dark-400">Confidence: {(match.confidence * 100).toFixed(1)}%</div>
                </div>
                <button onClick={() => copyToClipboard(match.profile_url, `face-${i}`)} className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-800">
                  {copiedField === `face-${i}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {data.engine_results && Object.keys(data.engine_results).length > 0 && renderSection(
          'Engine Results',
          'engines',
          <Globe className="w-5 h-5" />,
          <div className="space-y-3">
            {Object.entries(data.engine_results).map(([engine, results]: [string, any]) => (
              <div key={engine} className="card p-3">
                <h5 className="font-medium text-dark-900 dark:text-white capitalize mb-2">{engine} ({results.length} results)</h5>
                <div className="space-y-2">
                  {results.slice(0, 10).map((r: any, i: number) => (
                    <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="block p-2 rounded hover:bg-dark-100 dark:hover:bg-dark-800 text-sm">
                      <div className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 truncate">{r.title}</div>
                      <div className="text-dark-500 dark:text-dark-400 truncate">{r.link}</div>
                      <div className="text-xs text-dark-400">{r.snippet}</div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderLinkResults = (data: any) => {
    if (!data) return null

    return (
      <div className="space-y-4">
        {data.redirect_chain && data.redirect_chain.length > 0 && renderSection(
          `Redirect Chain (${data.redirect_chain.length} hops)`,
          'redirects',
          <LinkIcon className="w-5 h-5" />,
          <div className="space-y-2">
            {data.redirect_chain.map((hop: any, i: number) => (
              <div key={i} className="card p-3 flex items-center gap-3">
                <span className="w-6 text-center text-dark-400 font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <a href={hop.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 truncate block">{hop.url}</a>
                  <div className="text-xs text-dark-500 dark:text-dark-400 flex items-center gap-2">
                    <span className={clsx('px-1.5 py-0.5 rounded text-xs', hop.status_code >= 400 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400')}>
                      {hop.status_code}
                    </span>
                    <span>{hop.latency}s</span>
                  </div>
                </div>
                <button onClick={() => copyToClipboard(hop.url, `redirect-${i}`)} className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-800">
                  {copiedField === `redirect-${i}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {data.metadata && renderSection(
          'Page Metadata',
          'metadata',
          <Search className="w-5 h-5" />,
          <div className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(data.metadata, null, 2)}</pre>
          </div>
        )}

        {data.ssl && renderSection(
          'SSL Certificate',
          'ssl',
          <Shield className="w-5 h-5" />,
          <div className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(data.ssl, null, 2)}</pre>
          </div>
        )}

        {data.subdomains && data.subdomains.length > 0 && renderSection(
          `Subdomains (${data.subdomains.length})`,
          'subdomains',
          <Globe className="w-5 h-5" />,
          <div className="flex flex-wrap gap-2">
            {data.subdomains.slice(0, 50).map((sub: string, i: number) => (
              <span key={i} className="badge badge-info font-mono text-xs">{sub}</span>
            ))}
            {data.subdomains.length > 50 && <span className="badge badge-neutral">+{data.subdomains.length - 50} more</span>}
          </div>
        )}

        {data.archive_snapshots && data.archive_snapshots.length > 0 && renderSection(
          `Archive Snapshots (${data.archive_snapshots.length})`,
          'archives',
          <Clock className="w-5 h-5" />,
          <div className="space-y-2">
            {data.archive_snapshots.slice(0, 20).map((snap: string, i: number) => (
              <a key={i} href={snap} target="_blank" rel="noopener noreferrer" className="card p-3 flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
                <span className="font-mono text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 truncate flex-1">{snap}</span>
                <ExternalLink className="w-4 h-4 text-dark-400" />
              </a>
            ))}
          </div>
        )}

        {data.threat_intel && data.threat_intel.length > 0 && renderSection(
          'Threat Intelligence',
          'threats',
          <Shield className="w-5 h-5" />,
          <div className="space-y-3">
            {data.threat_intel.map((t: any, i: number) => (
              <div key={i} className="card p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-dark-900 dark:text-white">{t.source}</span>
                  <span className={clsx('badge', t.malicious ? 'badge-danger' : 'badge-success')}>
                    {t.malicious ? 'Malicious' : 'Clean'}
                  </span>
                </div>
                {t.categories && t.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.categories.map((c: string, j: number) => (
                      <span key={j} className="badge badge-neutral text-xs">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <TypeIcon className={clsx('w-6 h-6', typeCfg.color)} />
              <h1 className="text-xl font-bold text-dark-900 dark:text-white">{typeCfg.label}</h1>
            </div>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              {job.input_data.username || job.input_data.image_url || job.input_data.url || 'Unknown'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={clsx('badge', statusCfg.color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusCfg.label}
          </span>
          {job.status === 'completed' && job.result_data && (
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(job.result_data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `osint-${job.job_type}-${job.id.slice(0, 8)}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="btn-secondary"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      {(job.status === 'pending' || job.status === 'running') && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark-700 dark:text-dark-300">Progress</span>
            <span className="text-sm text-dark-500 dark:text-dark-400">{job.progress}%</span>
          </div>
          <div className="h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <p className="text-xs text-dark-500 dark:text-dark-400 mt-2 text-center">
            {job.status === 'pending' ? 'Queued for processing...' : 'Processing...'}
          </p>
        </div>
      )}

      {/* Error */}
      {job.status === 'failed' && job.error_message && (
        <div className="card p-4 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">Job Failed</p>
              <p className="text-sm text-red-700 dark:text-red-400">{job.error_message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {job.status === 'completed' && job.result_data && (
        <div className="card">
          <div className="p-4 border-b border-dark-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Results</h2>
          </div>
          <div className="p-4">
            {job.job_type === 'username' && renderUsernameResults(job.result_data)}
            {job.job_type === 'image' && renderImageResults(job.result_data)}
            {job.job_type === 'link' && renderLinkResults(job.result_data)}
          </div>
        </div>
      )}

      {/* Job Info */}
      <div className="card p-4">
        <h3 className="font-medium text-dark-900 dark:text-white mb-3">Job Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-dark-500 dark:text-dark-400">Job ID</p>
            <p className="font-mono text-dark-900 dark:text-white">{job.id}</p>
          </div>
          <div>
            <p className="text-dark-500 dark:text-dark-400">Type</p>
            <p className="font-medium text-dark-900 dark:text-white capitalize">{job.job_type}</p>
          </div>
          <div>
            <p className="text-dark-500 dark:text-dark-400">Created</p>
            <p className="font-mono text-dark-900 dark:text-white">{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</p>
          </div>
          {job.started_at && (
            <div>
              <p className="text-dark-500 dark:text-dark-400">Started</p>
              <p className="font-mono text-dark-900 dark:text-white">{formatDistanceToNow(new Date(job.started_at), { addSuffix: true })}</p>
            </div>
          )}
          {job.completed_at && (
            <div>
              <p className="text-dark-500 dark:text-dark-400">Completed</p>
              <p className="font-mono text-dark-900 dark:text-white">{formatDistanceToNow(new Date(job.completed_at), { addSuffix: true })}</p>
            </div>
          )}
          {job.elapsed_time && (
            <div>
              <p className="text-dark-500 dark:text-dark-400">Elapsed</p>
              <p className="font-mono text-dark-900 dark:text-white">{job.elapsed_time}s</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
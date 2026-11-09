import { useState } from 'react'
import { useJobsStore } from '../stores/jobs'
import { useNavigate } from 'react-router-dom'
import { Link2, Loader2, Search, Globe, Shield, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function LinkAnalysis() {
  const navigate = useNavigate()
  const createJob = useJobsStore((state) => state.createJob)
  const [url, setUrl] = useState('')
  const [expandShorteners, setExpandShorteners] = useState(true)
  const [followRedirects, setFollowRedirects] = useState(true)
  const [extractMetadata, setExtractMetadata] = useState(true)
  const [checkSSL, setCheckSSL] = useState(true)
  const [enumerateSubdomains, setEnumerateSubdomains] = useState(true)
  const [checkArchives, setCheckArchives] = useState(true)
  const [threatIntel, setThreatIntel] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    // Basic URL validation
    try {
      new URL(url.trim())
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setLoading(true)
    try {
      const job = await createJob('link', {
        url: url.trim(),
        expand_shorteners: expandShorteners,
        follow_redirects: followRedirects,
        extract_metadata: extractMetadata,
        check_ssl: checkSSL,
        enumerate_subdomains: enumerateSubdomains,
        check_archives: checkArchives,
        threat_intel: threatIntel,
      })
      if (job) {
        toast.success('Analysis started')
        navigate(`/jobs/${job.id}`)
      }
    } catch {
      toast.error('Failed to start analysis')
    } finally {
      setLoading(false)
    }
  }

  const options = [
    { key: 'expandShorteners', label: 'Expand URL Shorteners', desc: 'Resolve bit.ly, t.co, tinyurl, etc.', icon: Link2 },
    { key: 'followRedirects', label: 'Follow Redirects', desc: 'Trace full redirect chain with timing', icon: Globe },
    { key: 'extractMetadata', label: 'Extract Metadata', desc: 'Open Graph, Twitter Cards, JSON-LD, microdata', icon: Search },
    { key: 'checkSSL', label: 'SSL Certificate Analysis', desc: 'Issuer, validity, SAN, fingerprint', icon: Shield },
    { key: 'enumerateSubdomains', label: 'Subdomain Enumeration', desc: 'Passive discovery via CT logs', icon: Globe },
    { key: 'checkArchives', label: 'Archive Snapshots', desc: 'Wayback Machine historical captures', icon: Clock },
    { key: 'threatIntel', label: 'Threat Intelligence', desc: 'VirusTotal, URLhaus, AlienVault OTX', icon: Shield },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
          <Link2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          Link Analysis
        </h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Analyze URLs: redirects, metadata, SSL, subdomains, archives & threat intel</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* URL Input */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input pl-10"
              placeholder="https://example.com"
              required
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        {/* Options */}
        <div>
          <h3 className="text-sm font-medium text-dark-700 dark:text-dark-300 mb-4">Analysis Options</h3>
          <div className="space-y-3">
            {options.map((option) => {
              const Icon = option.icon
              const checked = (eval(option.key) as boolean)
              const setChecked = (key: string) => {
                if (key === 'expandShorteners') setExpandShorteners(!expandShorteners)
                else if (key === 'followRedirects') setFollowRedirects(!followRedirects)
                else if (key === 'extractMetadata') setExtractMetadata(!extractMetadata)
                else if (key === 'checkSSL') setCheckSSL(!checkSSL)
                else if (key === 'enumerateSubdomains') setEnumerateSubdomains(!enumerateSubdomains)
                else if (key === 'checkArchives') setCheckArchives(!checkArchives)
                else if (key === 'threatIntel') setThreatIntel(!threatIntel)
              }

              return (
                <label
                  key={option.key}
                  className={clsx(
                    'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                    checked
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-dark-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setChecked(option.key)}
                    className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500"
                  />
                  <Icon className="w-5 h-5 text-dark-400 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-dark-900 dark:text-white">{option.label}</span>
                    <p className="text-xs text-dark-500 dark:text-dark-400">{option.desc}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn-primary w-full py-3 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Start Analysis'
          )}
        </button>
      </form>

      {/* Info */}
      <div className="card p-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex gap-4">
          <Link2 className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-primary-800 dark:text-primary-300">What you get</h3>
            <ul className="mt-2 text-sm text-primary-700 dark:text-primary-400 space-y-1 grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <li>• Full redirect chain with status codes & latency</li>
              <li>• Open Graph, Twitter Cards, JSON-LD metadata</li>
              <li>• SSL certificate details (issuer, validity, SAN)</li>
              <li>• Passive subdomain enumeration via CT logs</li>
              <li>• Wayback Machine snapshot history</li>
              <li>• Threat intel: VirusTotal, URLhaus, AlienVault</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
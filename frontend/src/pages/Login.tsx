import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { Search, Key, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    setLoading(true)
    try {
      await login(apiKey.trim())
      toast.success('Authenticated successfully')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid API key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">OSINT Platform</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-2">Enter your API key to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" aria-hidden="true" />
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input pl-10 pr-12"
                placeholder="osint_abcdef123456..."
                autoComplete="off"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-dark-500 dark:text-dark-400">
              Your API key starts with <code className="font-mono">osint_</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="border-t border-dark-200 dark:border-dark-700 pt-4">
            <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-3">Need an API key?</h3>
            <div className="space-y-2 text-sm text-dark-600 dark:text-dark-400">
              <p>• Generate one via the API: <code className="font-mono bg-dark-100 dark:bg-dark-800 px-1.5 py-0.5 rounded">POST /api/v1/keys</code></p>
              <p>• Or ask your administrator</p>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-dark-500 dark:text-dark-400">
          <p>OSINT Platform — Social Media & Web Intelligence</p>
        </div>
      </div>
    </div>
  )
}
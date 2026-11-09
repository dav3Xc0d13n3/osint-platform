import { useState } from 'react'
import { useAuthStore } from '../stores/auth'
import { useJobsStore } from '../stores/jobs'
import { User, Key, Trash2, Plus, Loader2, Check, Bell, Shield, Palette, Moon, Sun, LogOut, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function Settings() {
  const { user, apiKey, logout } = useAuthStore()
  const { fetchJobs } = useJobsStore()
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyRateLimit, setNewKeyRateLimit] = useState('100/minute')
  const [newKeyExpires, setNewKeyExpires] = useState(30)
  const [creatingKey, setCreatingKey] = useState(false)
  const [showNewKey, setShowNewKey] = useState<string | null>(null)

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Key name required')
      return
    }

    setCreatingKey(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey || '',
        },
        body: JSON.stringify({
          name: newKeyName,
          rate_limit: newKeyRateLimit,
          expires_in_days: newKeyExpires,
        }),
      })

      if (!res.ok) throw new Error('Failed to create key')

      const data = await res.json()
      setShowNewKey(data.plain_key)
      setNewKeyName('')
      toast.success('API key created')
    } catch {
      toast.error('Failed to create API key')
    } finally {
      setCreatingKey(false)
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          Settings
        </h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Manage your account and API keys</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-medium text-dark-900 dark:text-white">{user?.name || 'API User'}</h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 font-mono">{user?.keyPrefix}...</p>
            <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Rate limit: {user?.rateLimit}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-secondary mt-4">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* API Keys */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </h2>
          <button
            onClick={() => setShowNewKey('create')}
            className="btn-primary"
            disabled={creatingKey}
          >
            <Plus className="w-4 h-4" />
            Create Key
          </button>
        </div>

        {/* Current Key */}
        <div className="mb-6 p-4 bg-dark-50 dark:bg-dark-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-dark-400" />
              <div>
                <p className="font-medium text-dark-900 dark:text-white">Current Session Key</p>
                <p className="text-sm text-dark-500 dark:text-dark-400 font-mono">{apiKey?.slice(0, 12)}...</p>
              </div>
            </div>
            <button
              onClick={() => copyKey(apiKey || '')}
              disabled={!apiKey}
              className="btn-secondary text-sm"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        </div>

        {/* Create New Key Modal */}
        {showNewKey === 'create' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="card w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Create API Key</h3>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="input"
                  placeholder="My new key"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Rate Limit</label>
                <select
                  value={newKeyRateLimit}
                  onChange={(e) => setNewKeyRateLimit(e.target.value)}
                  className="input"
                >
                  <option value="60/minute">60/minute</option>
                  <option value="100/minute">100/minute</option>
                  <option value="300/minute">300/minute</option>
                  <option value="1000/minute">1000/minute</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Expires In (days)</label>
                <input
                  type="number"
                  value={newKeyExpires}
                  onChange={(e) => setNewKeyExpires(parseInt(e.target.value) || 30)}
                  className="input w-32"
                  min={1}
                  max={365}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowNewKey(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleCreateKey} disabled={creatingKey} className="btn-primary flex-1">
                  {creatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show New Key */}
        {showNewKey && showNewKey !== 'create' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="card w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                API Key Created
              </h3>
              <div className="p-3 bg-dark-100 dark:bg-dark-800 rounded-lg font-mono text-sm break-all">
                {showNewKey}
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">Save this key now. It won't be shown again.</p>
              <div className="flex gap-2">
                <button onClick={() => copyKey(showNewKey)} className="btn-primary flex-1">
                  <Copy className="w-4 h-4" />
                  Copy Key
                </button>
                <button onClick={() => setShowNewKey(null)} className="btn-secondary flex-1">Done</button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Keys List */}
        <div className="border-t border-dark-200 dark:border-dark-700 pt-4">
          <h3 className="font-medium text-dark-900 dark:text-white mb-3">Your Keys</h3>
          <div className="space-y-2">
            <div className="card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-dark-400" />
                <div>
                  <p className="font-medium text-dark-900 dark:text-white">Default Key</p>
                  <p className="text-sm text-dark-500 dark:text-dark-400 font-mono">{user?.keyPrefix}...</p>
                </div>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Follow system preference</p>
            </div>
            <button className="btn-secondary">
              <Moon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Notifications</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Toast notifications for job completion</p>
            </div>
            <button className="btn-secondary">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card p-6 text-center text-dark-500 dark:text-dark-400">
        <p className="font-medium text-dark-900 dark:text-white">OSINT Platform v1.0.0</p>
        <p className="mt-1">Social Media & Web Intelligence</p>
        <p className="mt-4 text-sm">@oll.fx and killywilly cooked something dangerous</p>
      </div>
    </div>
  )
}
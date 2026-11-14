import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/auth'
import { User, Key, Plus, Loader2, Check, Bell, Shield, Palette, Moon, LogOut, Copy, Trash2, Sparkles, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { apiInstance as api } from '../services/api'

export default function Settings() {
  const { user, apiKey, logout } = useAuthStore()
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyRateLimit, setNewKeyRateLimit] = useState('100/minute')
  const [newKeyExpires, setNewKeyExpires] = useState(30)
  const [creatingKey, setCreatingKey] = useState(false)
  const [showNewKey, setShowNewKey] = useState<string | null>(null)
  const [keys, setKeys] = useState<Array<{id: string, name: string, prefix: string, active: boolean}>>([])
  const [loadingKeys, setLoadingKeys] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  }

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Key name required')
      return
    }

    setCreatingKey(true)
    try {
      const res = await api.post('/keys', {
        name: newKeyName,
        rate_limit: newKeyRateLimit,
        expires_in_days: newKeyExpires,
      })
      const data = res.data
      setKeys(prev => [...prev, { id: data.id, name: data.name, prefix: data.key_prefix, active: data.is_active }])
      setShowNewKey(data.plain_key)
      setNewKeyName('')
      toast.success('API key created')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create API key')
    } finally {
      setCreatingKey(false)
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('Copied to clipboard')
  }

  const fetchKeys = async () => {
    setLoadingKeys(true)
    try {
      const res = await api.get('/keys')
      setKeys(res.data.map((k: any) => ({ id: k.id, name: k.name, prefix: k.key_prefix, active: k.is_active })))
    } catch {
      toast.error('Failed to load keys')
    } finally {
      setLoadingKeys(false)
    }
  }

  const revokeKey = async (keyId: string) => {
    try {
      await api.patch(`/keys/${keyId}/revoke`)
      setKeys(prev => prev.map(k => k.id === keyId ? { ...k, active: false } : k))
      toast.success('Key revoked')
    } catch {
      toast.error('Failed to revoke key')
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
        <motion.h1
          className="text-2xl font-bold text-dark-900 dark:text-white flex items-center gap-2"
          whileHover={{ letterSpacing: '0.02em' }}
        >
          <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          Settings
        </motion.h1>
        <motion.p className="text-dark-500 dark:text-dark-400 mt-1">Manage your account and API keys</motion.p>
      </motion.div>

      {/* Profile */}
      <motion.div variants={itemVariants} className="card p-6">
        <motion.h2
          className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2"
          whileHover={{ letterSpacing: '0.02em' }}
        >
          <User className="w-5 h-5" />
          Profile
        </motion.h2>
        <motion.div
          whileHover={{ y: -2 }}
          className="flex items-center gap-4"
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <motion.h3 className="font-medium text-dark-900 dark:text-white">{user?.name || 'API User'}</motion.h3>
            <motion.p className="text-sm text-dark-500 dark:text-dark-400 font-mono mt-1">{user?.keyPrefix}...</motion.p>
            <motion.p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Rate limit: {user?.rateLimit}</motion.p>
          </div>
        </motion.div>
        <motion.button
          onClick={logout}
          className="btn-secondary mt-4 flex items-center gap-2"
          whileHover={{ scale: 1.02, gap: 8 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </motion.button>
      </motion.div>

      {/* API Keys */}
      <motion.div variants={itemVariants} className="card p-6">
        <motion.div className="flex items-center justify-between mb-4">
          <motion.h2
            className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2"
            whileHover={{ letterSpacing: '0.02em' }}
          >
            <Key className="w-5 h-5" />
            API Keys
          </motion.h2>
          <motion.button
            onClick={() => setShowNewKey('create')}
            disabled={creatingKey}
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 20px -5px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            Create Key
          </motion.button>
        </motion.div>

        {/* Current Session Key */}
        <motion.div
          variants={itemVariants}
          className="mb-6 p-4 bg-dark-50 dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700"
          whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <motion.div className="flex items-center justify-between">
            <motion.div className="flex items-center gap-3" whileHover={{ x: 4 }}>
              <Key className="w-5 h-5 text-dark-400" />
              <div>
                <p className="font-medium text-dark-900 dark:text-white">Current Session Key</p>
                <p className="text-sm text-dark-500 dark:text-dark-400 font-mono">{apiKey?.slice(0, 12)}...</p>
              </div>
            </motion.div>
            <motion.button
              onClick={() => copyKey(apiKey || '')}
              disabled={!apiKey}
              className="btn-secondary text-sm flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Copy className="w-4 h-4" />
              Copy
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Keys List */}
        <motion.div variants={itemVariants}>
          <motion.div className="flex items-center justify-between mb-3">
            <motion.h3 className="font-medium text-dark-900 dark:text-white">Your Keys</motion.h3>
            <motion.button
              onClick={fetchKeys}
              disabled={loadingKeys}
              className="btn-secondary text-sm flex items-center gap-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Loader2 className={clsx('w-4 h-4', loadingKeys ? 'animate-spin' : '')} />
              Refresh
            </motion.button>
          </motion.div>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={keys.length}
              variants={listVariants}
              className="space-y-2"
            >
              {keys.length === 0 && !loadingKeys ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 text-center"
                >
                  <motion.div
                    className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-3"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Key className="w-12 h-12" />
                  </motion.div>
                  <p className="text-dark-500 dark:text-dark-400">No additional keys yet</p>
                  <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">Create your first API key to manage multiple applications</p>
                </motion.div>
              ) : (
                keys.map((k) => (
                  <motion.div
                    key={k.id}
                    variants={listItemVariants}
                    className="card p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                    whileHover={{ x: 4, boxShadow: '0 8px 20px -5px rgba(0,0,0,0.1)' }}
                  >
                    <motion.div className="flex items-center gap-3" whileHover={{ x: 4 }}>
                      <Key className="w-5 h-5 text-dark-400" />
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white">{k.name}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400 font-mono">{k.prefix}...</p>
                      </div>
                    </motion.div>
                    <motion.div className="flex items-center gap-2">
                      <motion.span
                        className={clsx('badge', k.active ? 'badge-success' : 'badge-error')}
                        whileHover={{ scale: 1.05 }}
                      >
                        {k.active ? 'Active' : 'Revoked'}
                      </motion.span>
                      {k.active && (
                        <motion.button
                          onClick={() => revokeKey(k.id)}
                          className="btn-secondary text-sm text-red-600 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </motion.div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Create Key Modal */}
        <AnimatePresence>
          {showNewKey === 'create' && (
            <motion.div
              key="create-modal"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={backdropVariants}
            >
              <motion.div
                className="w-full max-w-md"
                variants={modalVariants}
              >
                <motion.div className="card p-6 space-y-4">
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ gap: 6 }}
                  >
                    <motion.div
                      className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-primary-600 flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                    <motion.h3 className="text-lg font-semibold text-dark-900 dark:text-white">Create API Key</motion.h3>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Name</label>
                    <motion.input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="input"
                      placeholder="My new key"
                      autoFocus
                      whileFocus={{ borderColor: 'rgb(59, 130, 246)', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Rate Limit</label>
                    <motion.select
                      value={newKeyRateLimit}
                      onChange={(e) => setNewKeyRateLimit(e.target.value)}
                      className="input"
                      whileFocus={{ borderColor: 'rgb(59, 130, 246)', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                    >
                      <option value="60/minute">60/minute</option>
                      <option value="100/minute">100/minute</option>
                      <option value="300/minute">300/minute</option>
                      <option value="1000/minute">1000/minute</option>
                    </motion.select>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Expires In (days)</label>
                    <motion.input
                      type="number"
                      value={newKeyExpires}
                      onChange={(e) => setNewKeyExpires(parseInt(e.target.value) || 30)}
                      className="input w-32"
                      min={1}
                      max={365}
                      whileFocus={{ borderColor: 'rgb(59, 130, 246)', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex gap-2 pt-2">
                    <motion.button
                      onClick={() => setShowNewKey(null)}
                      className="btn-secondary flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleCreateKey}
                      disabled={creatingKey}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {creatingKey ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Create
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show New Key Modal */}
        <AnimatePresence>
          {showNewKey && showNewKey !== 'create' && (
            <motion.div
              key="show-key-modal"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={backdropVariants}
            >
              <motion.div
                className="w-full max-w-md"
                variants={modalVariants}
              >
                <motion.div className="card p-6 space-y-4 text-center">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <motion.h3 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    API Key Created
                  </motion.h3>

                  <motion.div
                    className="p-4 bg-dark-100 dark:bg-dark-800 rounded-xl font-mono text-sm break-all relative"
                    whileHover={{ boxShadow: '0 8px 20px -5px rgba(0,0,0,0.1)' }}
                  >
                    <motion.span>{showNewKey}</motion.span>
                    <motion.button
                      onClick={() => copyKey(showNewKey)}
                      className="absolute right-2 top-2 px-2 py-1 text-xs font-medium rounded-lg text-green-600 hover:text-green-700"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Copy className="w-3 h-3" />
                    </motion.button>
                  </motion.div>

                  <motion.p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Save this key now. It won't be shown again.
                  </motion.p>

                  <motion.div className="flex gap-2">
                    <motion.button
                      onClick={() => copyKey(showNewKey)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Copy className="w-4 h-4" />
                      Copy Key
                    </motion.button>
                    <motion.button
                      onClick={() => setShowNewKey(null)}
                      className="btn-secondary flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Done
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={itemVariants} className="card p-6">
        <motion.h2
          className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2"
          whileHover={{ letterSpacing: '0.02em' }}
        >
          <Palette className="w-5 h-5" />
          Preferences
        </motion.h2>
        <motion.div className="space-y-4">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-dark-800"
            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
          >
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Follow system preference</p>
            </div>
            <motion.button className="btn-secondary" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Moon className="w-4 h-4" />
            </motion.button>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-dark-800"
            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
          >
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Notifications</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Toast notifications for job completion</p>
            </div>
            <motion.button className="btn-secondary" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Bell className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* About */}
      <motion.div
        variants={itemVariants}
        className="card p-6 text-center text-dark-500 dark:text-dark-400"
        whileHover={{ y: -2 }}
      >
        <motion.p className="font-medium text-dark-900 dark:text-white">OSINT Platform v1.0.0</motion.p>
        <motion.p className="mt-1">Social Media & Web Intelligence</motion.p>
        <motion.p className="mt-4 text-sm flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4 text-purple-500" />
          @oll.fx and killywilly cooked something dangerous
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
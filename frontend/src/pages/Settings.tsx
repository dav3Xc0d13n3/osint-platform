import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/auth'
import { User, Key, Plus, Loader2, Check, Bell, Shield, Palette, Moon, LogOut, Copy, Trash2, Sparkles, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { apiInstance as api } from '../services/api'
import { NeonButton, GlassCard, StaggerContainer, StaggerItem } from '../components/ui'
import { containerVariants, itemVariants, listVariants, listItemVariants, modalVariants, backdropVariants } from '../lib/motion'

export default function Settings() {
  const { user, apiKey, logout } = useAuthStore()
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyRateLimit, setNewKeyRateLimit] = useState('100/minute')
  const [newKeyExpires, setNewKeyExpires] = useState(30)
  const [creatingKey, setCreatingKey] = useState(false)
  const [showNewKey, setShowNewKey] = useState<string | null>(null)
  const [keys, setKeys] = useState<Array<{id: string, name: string, prefix: string, active: boolean}>>([])
  const [loadingKeys, setLoadingKeys] = useState(false)

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Key name required', { icon: '⚠️' })
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
      toast.success('API key created', { icon: '🔑' })
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create API key', { icon: '⚠️' })
    } finally {
      setCreatingKey(false)
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('Copied to clipboard', { icon: '📋' })
  }

  const fetchKeys = async () => {
    setLoadingKeys(true)
    try {
      const res = await api.get('/keys')
      setKeys(res.data.map((k: any) => ({ id: k.id, name: k.name, prefix: k.key_prefix, active: k.is_active })))
    } catch {
      toast.error('Failed to load keys', { icon: '⚠️' })
    } finally {
      setLoadingKeys(false)
    }
  }

  const revokeKey = async (keyId: string) => {
    try {
      await api.patch(`/keys/${keyId}/revoke`)
      setKeys(prev => prev.map(k => k.id === keyId ? { ...k, active: false } : k))
      toast.success('Key revoked', { icon: '🗑️' })
    } catch {
      toast.error('Failed to revoke key', { icon: '⚠️' })
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
          className="heading-2 flex items-center gap-2"
          whileHover={{ letterSpacing: '0.02em' }}
        >
          <Shield className="w-7 h-7 text-cyan-400" />
          Settings
        </motion.h1>
        <motion.p className="text-[var(--text-secondary)] mt-1">Manage your account and API keys</motion.p>
      </motion.div>

      {/* Profile */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <motion.h2
          className="heading-4 flex items-center gap-2 mb-4"
          whileHover={{ letterSpacing: '0.02em' }}
        >
          <User className="w-6 h-6 text-cyan-400" />
          Profile
        </motion.h2>
        <motion.div
          whileHover={{ y: -2 }}
          className="flex items-center gap-4"
        >
          <motion.div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)' }}
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <motion.h3 className="font-medium text-[var(--text-primary)]">{user?.name || 'API User'}</motion.h3>
            <motion.p className="text-sm text-[var(--text-secondary)] font-mono mt-1">{user?.keyPrefix}...</motion.p>
            <motion.p className="text-xs text-[var(--text-muted)] mt-1">Rate limit: {user?.rateLimit}</motion.p>
          </div>
        </motion.div>
        <NeonButton
          onClick={logout}
          variant="secondary"
          leftIcon={<LogOut className="w-4 h-4" />}
          className="mt-4"
          size="md"
        >
          Logout
        </NeonButton>
      </motion.div>

      {/* API Keys */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <motion.div className="flex items-center justify-between mb-4">
          <motion.h2
            className="heading-4 flex items-center gap-2"
            whileHover={{ letterSpacing: '0.02em' }}
          >
            <Key className="w-6 h-6 text-cyan-400" />
            API Keys
          </motion.h2>
          <NeonButton
            onClick={() => setShowNewKey('create')}
            disabled={creatingKey}
            leftIcon={<Plus className="w-4 h-4" />}
            size="md"
          >
            Create Key
          </NeonButton>
        </motion.div>

        {/* Current Session Key */}
        <motion.div
          variants={itemVariants}
          className="mb-6 glass-card p-4 border-cyan-500/20"
          style={{ background: 'rgba(0,240,255,0.03)' }}
          whileHover={{ boxShadow: '0 4px 12px rgba(0,240,255,0.1)' }}
        >
          <motion.div className="flex items-center justify-between">
            <motion.div className="flex items-center gap-3" whileHover={{ x: 4 }}>
              <Key className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">Current Session Key</p>
                <p className="text-sm text-[var(--text-secondary)] font-mono">{apiKey?.slice(0, 12)}...</p>
              </div>
            </motion.div>
            <NeonButton
              onClick={() => copyKey(apiKey || '')}
              disabled={!apiKey}
              variant="secondary"
              size="sm"
              leftIcon={<Copy className="w-4 h-4" />}
            >
              Copy
            </NeonButton>
          </motion.div>
        </motion.div>

        {/* Keys List */}
        <motion.div variants={itemVariants}>
          <motion.div className="flex items-center justify-between mb-3">
            <motion.h3 className="font-medium text-[var(--text-primary)]">Your Keys</motion.h3>
            <NeonButton
              onClick={fetchKeys}
              disabled={loadingKeys}
              variant="secondary"
              size="sm"
              leftIcon={<Loader2 className={clsx('w-4 h-4', loadingKeys ? 'animate-spin' : '')} />}
            >
              Refresh
            </NeonButton>
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
                    className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Key className="w-12 h-12" />
                  </motion.div>
                  <p className="text-[var(--text-secondary)]">No additional keys yet</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Create your first API key to manage multiple applications</p>
                </motion.div>
              ) : (
                keys.map((k) => (
                  <StaggerItem key={k.id} custom={keys.indexOf(k)}>
                    <motion.div
                      variants={listItemVariants}
                      className="glass-card p-3 flex items-center justify-between hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-shadow"
                      whileHover={{ x: 4 }}
                    >
                      <motion.div className="flex items-center gap-3" whileHover={{ x: 4 }}>
                        <Key className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{k.name}</p>
                          <p className="text-sm text-[var(--text-secondary)] font-mono">{k.prefix}...</p>
                        </div>
                      </motion.div>
                      <motion.div className="flex items-center gap-2">
                        <motion.span
                          className={clsx('neon-badge', k.active ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30')}
                          whileHover={{ scale: 1.05 }}
                        >
                          {k.active ? 'Active' : 'Revoked'}
                        </motion.span>
                        {k.active && (
                          <NeonButton
                            variant="danger"
                            size="sm"
                            onClick={() => revokeKey(k.id)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            className="p-1.5"
                          />
                        )}
                      </motion.div>
                    </motion.div>
                  </StaggerItem>
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
                <motion.div className="glass-card p-6 space-y-4" style={{ background: 'rgba(139,92,246,0.05)' }} variants={listVariants}>
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ gap: 6 }}
                  >
                    <motion.div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-magenta) 100%)' }}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </motion.div>
                    <motion.h3 className="text-lg font-semibold text-[var(--text-primary)]">Create API Key</motion.h3>
                  </motion.div>

                  <motion.div variants={listItemVariants}>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="neon-input"
                      placeholder="My new key"
                      autoFocus
                    />
                  </motion.div>

                  <motion.div variants={listItemVariants}>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Rate Limit</label>
                    <select
                      value={newKeyRateLimit}
                      onChange={(e) => setNewKeyRateLimit(e.target.value)}
                      className="neon-input"
                    >
                      <option value="60/minute">60/minute</option>
                      <option value="100/minute">100/minute</option>
                      <option value="300/minute">300/minute</option>
                      <option value="1000/minute">1000/minute</option>
                    </select>
                  </motion.div>

                  <motion.div variants={listItemVariants}>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Expires In (days)</label>
                    <input
                      type="number"
                      value={newKeyExpires}
                      onChange={(e) => setNewKeyExpires(parseInt(e.target.value) || 30)}
                      className="neon-input w-32"
                      min={1}
                      max={365}
                    />
                  </motion.div>

                  <motion.div variants={listItemVariants} className="flex gap-2 pt-2">
                    <NeonButton
                      variant="secondary"
                      onClick={() => setShowNewKey(null)}
                      className="flex-1"
                    >
                      Cancel
                    </NeonButton>
                    <NeonButton
                      onClick={handleCreateKey}
                      disabled={creatingKey}
                      loading={creatingKey}
                      leftIcon={<Sparkles className="w-4 h-4" />}
                      className="flex-1"
                    >
                      Create
                    </NeonButton>
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
                <motion.div className="glass-card p-6 space-y-4 text-center" style={{ background: 'rgba(34,255,136,0.05)' }} variants={listVariants}>
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                    style={{ background: 'rgba(34,255,136,0.2)' }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Check className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <motion.h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    API Key Created
                  </motion.h3>

                  <motion.div
                    className="p-4 bg-white/5 dark:bg-black/30 backdrop-blur-xl rounded-xl font-mono text-sm break-all relative"
                    whileHover={{ boxShadow: '0 8px 20px -5px rgba(0,0,0,0.1)' }}
                  >
                    <motion.span>{showNewKey}</motion.span>
                    <NeonButton
                      onClick={() => copyKey(showNewKey)}
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      leftIcon={<Copy className="w-3 h-3" />}
                    />
                  </motion.div>

                  <motion.p className="text-sm text-red-400 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Save this key now. It won't be shown again.
                  </motion.p>

                  <motion.div className="flex gap-2">
                    <NeonButton
                      onClick={() => copyKey(showNewKey)}
                      leftIcon={<Copy className="w-4 h-4" />}
                      className="flex-1"
                    >
                      Copy Key
                    </NeonButton>
                    <NeonButton
                      variant="secondary"
                      onClick={() => setShowNewKey(null)}
                      className="flex-1"
                    >
                      Done
                    </NeonButton>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <motion.h2
          className="heading-4 flex items-center gap-2 mb-4"
          whileHover={{ letterSpacing: '0.02em' }}
        >
          <Palette className="w-6 h-6 text-cyan-400" />
          Preferences
        </motion.h2>
        <StaggerContainer className="space-y-3" staggerChildren={0.05}>
          <StaggerItem>
            <motion.div
              variants={listItemVariants}
              className="flex items-center justify-between p-3 glass-card"
              whileHover={{ backgroundColor: 'rgba(0,240,255,0.05)' }}
            >
              <div>
                <p className="font-medium text-[var(--text-primary)]">Dark Mode</p>
                <p className="text-sm text-[var(--text-muted)]">Follow system preference</p>
              </div>
              <NeonButton variant="ghost" size="sm" leftIcon={<Moon className="w-4 h-4" />} />
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div
              variants={listItemVariants}
              className="flex items-center justify-between p-3 glass-card"
              whileHover={{ backgroundColor: 'rgba(0,240,255,0.05)' }}
            >
              <div>
                <p className="font-medium text-[var(--text-primary)]">Notifications</p>
                <p className="text-sm text-[var(--text-muted)]">Toast notifications for job completion</p>
              </div>
              <NeonButton variant="ghost" size="sm" leftIcon={<Bell className="w-4 h-4" />} />
            </motion.div>
          </StaggerItem>
        </StaggerContainer>
      </motion.div>

      {/* About */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6 text-center text-[var(--text-secondary)]"
        whileHover={{ y: -2 }}
      >
        <motion.p className="font-medium text-[var(--text-primary)]">OSINT Platform v1.0.0</motion.p>
        <motion.p className="mt-1">Social Media & Web Intelligence</motion.p>
        <motion.p className="mt-4 text-sm flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          @oll.fx and killywilly cooked something dangerous
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
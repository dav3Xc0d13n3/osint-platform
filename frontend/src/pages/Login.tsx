import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/auth'
import { Search, Key, Loader2, Eye, EyeOff, Shield, Sparkles, ArrowRight, CheckCircle, AlertTriangle, Terminal } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiInstance as api } from '../services/api'
import { NeonButton, GlassCard } from '../components/ui'
import { useReducedMotion, usePulse } from '../lib/hooks'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login')
  const [bootstrapName, setBootstrapName] = useState('admin')
  const [bootstrapRateLimit, setBootstrapRateLimit] = useState('1000/minute')
  const [bootstrapExpires, setBootstrapExpires] = useState(30)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const reduced = useReducedMotion()
  const pulse = usePulse(2000)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    setLoading(true)
    try {
      await login(apiKey.trim())
      toast.success('Authenticated successfully', { icon: '🔐' })
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid API key', { icon: '⚠️' })
    } finally {
      setLoading(false)
    }
  }

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bootstrapName.trim()) return

    setLoading(true)
    try {
      const response = await api.post('/keys/bootstrap', {
        name: bootstrapName.trim(),
        rate_limit: bootstrapRateLimit,
        expires_in_days: bootstrapExpires,
      })
      const key = response.data.plain_key
      setGeneratedKey(key)
      setCopySuccess(false)
      toast.success('First API key generated! Copy it now — it won\'t be shown again.', { icon: '🔑' })
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Bootstrap failed', { icon: '⚠️' })
    } finally {
      setLoading(false)
    }
  }

  const copyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Animated Background Grid */}
      <motion.div
        className="absolute inset-0 bg-grid-animated"
        style={{ opacity: 0.4 }}
        animate={{ backgroundPosition: ['0 0', '60px 60px'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Radial Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.12, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,43,214,0.03) 0%, transparent 70%)' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Scanline Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.02) 2px, rgba(0,240,255,0.02) 4px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
        animate={{ backgroundPosition: ['0 0', '0 100vh'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating Particles */}
      {!reduced && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${i % 3 === 0 ? 'var(--accent-cyan)' : i % 3 === 1 ? 'var(--accent-purple)' : 'var(--accent-magenta)'} 0%, transparent 70%)`,
              }}
              animate={{
                y: [-30, 30, -30],
                x: [-15, 15, -15],
                opacity: [0.2, 0.5, 0.2],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        className="w-full max-w-md relative z-10 px-4"
        variants={containerVariants}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="glass-card"
          >
            {/* Header */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 50%, var(--accent-magenta) 100%)',
                  boxShadow: '0 0 30px rgba(0,240,255,0.3), 0 0 60px rgba(139,92,246,0.2)',
                }}
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-8 h-8 text-white" />
              </motion.div>
              <motion.h1
                className="heading-1"
                whileHover={{ letterSpacing: '0.05em' }}
              >
                OSINT
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                  PLATFORM
                </span>
              </motion.h1>
              <motion.p
                className="text-lg text-[var(--text-secondary)] mt-2"
                variants={itemVariants}
                transition={{ delay: 0.1 }}
              >
                {mode === 'login' ? 'Initialize session with API key' : 'Bootstrap first API key'}
              </motion.p>
            </motion.div>

            {/* Mode Toggle */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.15 }}
              className="mb-6 flex items-center gap-1 bg-white/5 dark:bg-black/30 backdrop-blur-xl rounded-xl p-1 border border-white/10"
            >
              <motion.button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Terminal className="w-4 h-4 inline mr-1" /> Sign In
              </motion.button>
              <motion.button
                onClick={() => { setMode('bootstrap'); setGeneratedKey(null); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'bootstrap'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4 inline mr-1" /> Bootstrap
              </motion.button>
            </motion.div>

            {/* Login Form */}
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.form
                  key="login"
                  onSubmit={handleLogin}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <motion.div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      API Key
                    </label>
                    <motion.div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" aria-hidden="true" />
                      <input
                        id="apiKey"
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="neon-input pl-10 pr-12"
                        placeholder="osint_abcdef123456..."
                        autoComplete="off"
                        disabled={loading}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
                        aria-label={showKey ? 'Hide key' : 'Show key'}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.button>
                    </motion.div>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      Your API key starts with <code className="font-mono bg-white/5 px-1.5 py-0.5 rounded">osint_</code>
                    </p>
                  </motion.div>

                  <NeonButton
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    leftIcon={<Terminal className="w-5 h-5" />}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full"
                    size="lg"
                  >
                    Sign In
                  </NeonButton>
                </motion.form>
              )}

              {/* Bootstrap Form */}
              {mode === 'bootstrap' && !generatedKey && (
                <motion.form
                  key="bootstrap"
                  onSubmit={handleBootstrap}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <motion.div>
                    <label htmlFor="bootstrapName" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Key Name
                    </label>
                    <motion.div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" aria-hidden="true" />
                      <input
                        id="bootstrapName"
                        type="text"
                        value={bootstrapName}
                        onChange={(e) => setBootstrapName(e.target.value)}
                        className="neon-input pl-10"
                        placeholder="admin"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div>
                    <label htmlFor="bootstrapRateLimit" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Rate Limit
                    </label>
                    <motion.div className="relative">
                      <select
                        id="bootstrapRateLimit"
                        value={bootstrapRateLimit}
                        onChange={(e) => setBootstrapRateLimit(e.target.value)}
                        className="neon-input pl-10 appearance-none bg-white/5"
                        disabled={loading}
                      >
                        <option value="60/minute">60/minute</option>
                        <option value="100/minute">100/minute</option>
                        <option value="300/minute">300/minute</option>
                        <option value="1000/minute">1000/minute</option>
                      </select>
                    </motion.div>
                  </motion.div>

                  <motion.div>
                    <label htmlFor="bootstrapExpires" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Expires In (days, 0 = never)
                    </label>
                    <motion.div className="relative">
                      <input
                        id="bootstrapExpires"
                        type="number"
                        value={bootstrapExpires}
                        onChange={(e) => setBootstrapExpires(parseInt(e.target.value) || 0)}
                        className="neon-input pl-10"
                        min="0"
                        max="365"
                        disabled={loading}
                      />
                    </motion.div>
                  </motion.div>

                  <NeonButton
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    variant="primary"
                    leftIcon={<Sparkles className="w-5 h-5" />}
                    className="w-full"
                    size="lg"
                  >
                    Generate First API Key
                  </NeonButton>

                  <motion.p className="text-center text-xs text-[var(--text-muted)]">
                    Only works if no API keys exist in the database.
                  </motion.p>
                </motion.form>
              )}

              {/* Generated Key Display */}
              {generatedKey && (
                <motion.div
                  key="generated"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-4"
                >
                  <motion.div
                    className="flex items-center gap-3 p-4 rounded-xl border border-green-500/30"
                    style={{ background: 'rgba(34,255,136,0.1)' }}
                    whileHover={{ y: -2, boxShadow: '0 8px 20px -5px rgba(34,255,136,0.2)' }}
                  >
                    <motion.div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(34,255,136,0.2)' }}
                      animate={pulse ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-green-400">API Key Generated Successfully!</p>
                      <p className="text-sm text-green-400/80">Copy it now — it won't be shown again</p>
                    </div>
                  </motion.div>

                  <motion.div className="relative">
                    <div className="bg-[var(--bg-tertiary)] border border-white/10 rounded-xl p-4 font-mono text-sm text-cyan-300 break-all">
                      {generatedKey}
                    </div>
                    <NeonButton
                      onClick={copyKey}
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-3"
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                    >
                      {copySuccess ? 'Copied!' : 'Copy Key'}
                    </NeonButton>
                  </motion.div>

                  <div className="flex gap-3">
                    <NeonButton
                      onClick={() => { navigate('/'); }}
                      variant="primary"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="flex-1"
                      size="lg"
                    >
                      Continue to Dashboard
                    </NeonButton>
                    <NeonButton
                      onClick={() => { setGeneratedKey(null); setMode('login'); }}
                      variant="secondary"
                      className="flex-1"
                      size="lg"
                    >
                      Generate Another
                    </NeonButton>
                  </div>

                  <motion.p className="text-center text-xs text-[var(--text-muted)]">
                    Save this key securely. Create more keys in Settings after login.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <motion.p className="text-sm text-[var(--text-muted)]">
                OSINT Platform — Social Media & Web Intelligence
              </motion.p>
              <motion.p className="text-xs text-[var(--text-muted)] mt-1">
                <span className="font-mono text-cyan-400">asyncpg</span> •
                <span className="font-mono text-purple-400">FastAPI</span> •
                <span className="font-mono text-cyan-400">React</span> •
                <span className="font-mono text-pink-400">Framer Motion</span>
              </motion.p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Live Status Indicators */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
          <motion.span
            className="w-2 h-2 rounded-full bg-green-400"
            animate={{ boxShadow: ['0 0 4px #22ff88', '0 0 12px #22ff88', '0 0 4px #22ff88'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-mono text-cyan-400">LIVE</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
          <span className="text-xs font-mono text-[var(--text-muted)]">v1.0.0</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
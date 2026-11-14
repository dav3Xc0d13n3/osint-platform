import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/auth'
import { Search, Key, Loader2, Eye, EyeOff, Shield, Sparkles, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'

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

  const handleLogin = async (e: React.FormEvent) => {
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
      toast.success('First API key generated! Copy it now — it won\'t be shown again.')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Bootstrap failed')
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
      className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950 px-4 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.12, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary-500/5 via-transparent to-purple-500/5"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="card p-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 mb-4 shadow-lg shadow-primary-500/25"
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-8 h-8 text-white" />
              </motion.div>
              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-dark-900 via-dark-700 to-purple-700 bg-clip-text text-transparent dark:from-white dark:via-dark-200 dark:to-purple-300"
                whileHover={{ letterSpacing: '0.05em' }}
              >
                OSINT Platform
              </motion.h1>
              <motion.p
                className="text-dark-500 dark:text-dark-400 mt-2 text-lg"
                variants={itemVariants}
                transition={{ delay: 0.1 }}
              >
                {mode === 'login' ? 'Enter your API key to continue' : 'Create your first API key to get started'}
              </motion.p>
            </motion.div>

            {/* Mode Toggle */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.15 }}
              className="mb-6 flex items-center gap-2 bg-dark-100 dark:bg-dark-800 rounded-xl p-1"
            >
              <motion.button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-white dark:bg-dark-700 shadow-sm text-dark-900 dark:text-white'
                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
              </motion.button>
              <motion.button
                onClick={() => { setMode('bootstrap'); setGeneratedKey(null); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'bootstrap'
                    ? 'bg-white dark:bg-dark-700 shadow-sm text-dark-900 dark:text-white'
                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
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
                    <label htmlFor="apiKey" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      API Key
                    </label>
                    <motion.div className="relative">
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
                      <motion.button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300"
                        aria-label={showKey ? 'Hide key' : 'Show key'}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.button>
                    </motion.div>
                    <p className="mt-2 text-xs text-dark-500 dark:text-dark-400">
                      Your API key starts with <code className="font-mono bg-dark-100 dark:bg-dark-800 px-1.5 py-0.5 rounded">osint_</code>
                    </p>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3"
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 ml-2 inline" />
                      </>
                    )}
                  </motion.button>
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
                    <label htmlFor="bootstrapName" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      Key Name
                    </label>
                    <motion.div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" aria-hidden="true" />
                      <input
                        id="bootstrapName"
                        type="text"
                        value={bootstrapName}
                        onChange={(e) => setBootstrapName(e.target.value)}
                        className="input pl-10"
                        placeholder="admin"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div>
                    <label htmlFor="bootstrapRateLimit" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      Rate Limit
                    </label>
                    <motion.div className="relative">
                      <input
                        id="bootstrapRateLimit"
                        type="text"
                        value={bootstrapRateLimit}
                        onChange={(e) => setBootstrapRateLimit(e.target.value)}
                        className="input pl-10"
                        placeholder="1000/minute"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div>
                    <label htmlFor="bootstrapExpires" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      Expires In (days, 0 = never)
                    </label>
                    <motion.div className="relative">
                      <input
                        id="bootstrapExpires"
                        type="number"
                        value={bootstrapExpires}
                        onChange={(e) => setBootstrapExpires(parseInt(e.target.value) || 0)}
                        className="input pl-10"
                        min="0"
                        max="365"
                        disabled={loading}
                      />
                    </motion.div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-700 hover:to-primary-700"
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Generating Key...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate First API Key
                      </>
                    )}
                  </motion.button>

                  <motion.p className="text-center text-xs text-dark-500 dark:text-dark-400">
                    This only works if no API keys exist in the database.
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
                    className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
                    whileHover={{ y: -2, boxShadow: '0 8px 20px -5px rgba(34, 197, 94, 0.2)' }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">API Key Generated Successfully!</p>
                      <p className="text-sm text-green-600 dark:text-green-400">Copy it now — it won't be shown again</p>
                    </div>
                  </motion.div>

                  <motion.div className="relative">
                    <div className="bg-dark-900 dark:bg-dark-950 border border-dark-200 dark:border-dark-700 rounded-xl p-4 font-mono text-sm text-green-300 break-all">
                      {generatedKey}
                    </div>
                    <motion.button
                      onClick={copyKey}
                      className="absolute right-3 top-3 px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        backgroundColor: copySuccess ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
                        color: 'white'
                      }}
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Copied!
                        </>
                      ) : (
                        'Copy to Clipboard'
                      )}
                    </motion.button>
                  </motion.div>

                  <motion.div className="flex gap-3">
                    <motion.button
                      onClick={() => { navigate('/'); }}
                      className="btn-primary flex-1 py-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2 inline" />
                    </motion.button>
                    <motion.button
                      onClick={() => { setGeneratedKey(null); setMode('login'); }}
                      className="btn-secondary flex-1 py-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Generate Another
                    </motion.button>
                  </motion.div>

                  <motion.p className="text-center text-xs text-dark-500 dark:text-dark-400">
                    Save this key securely. You can create more keys in Settings after logging in.
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
              <motion.p className="text-sm text-dark-500 dark:text-dark-400">
                OSINT Platform — Social Media & Web Intelligence
              </motion.p>
              <motion.p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
                Powered by <span className="font-mono text-primary-600 dark:text-primary-400">asyncpg</span> •{' '}
                <span className="font-mono text-purple-600 dark:text-purple-400">FastAPI</span> •{' '}
                <span className="font-mono text-cyan-600 dark:text-cyan-400">React</span>
              </motion.p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
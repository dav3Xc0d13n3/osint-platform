import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useJobsStore } from '../stores/jobs'
import { useNavigate } from 'react-router-dom'
import { Image, Loader2, Upload, Camera, Search, X, Zap, Target, Shield, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { NeonButton, GlassCard, StaggerContainer, StaggerItem } from '../components/ui'
import { itemVariants, cardVariants, containerVariants, listVariants } from '../lib/motion'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const engineOptions = [
  { id: 'google', name: 'Google Images', requiresKey: true },
  { id: 'yandex', name: 'Yandex Images', requiresKey: true },
  { id: 'tineye', name: 'TinEye', requiresKey: true },
  { id: 'bing', name: 'Bing Visual Search', requiresKey: true },
]

export default function ImageSearch() {
  const navigate = useNavigate()
  const createJob = useJobsStore((state) => state.createJob)
  const [imageUrl, setImageUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [engines, setEngines] = useState<string[]>(['google'])
  const [extractExif, setExtractExif] = useState(true)
  const [extractFaces, setExtractFaces] = useState(true)
  const [perceptualHash, setPerceptualHash] = useState(true)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error('Invalid file type. Use JPEG, PNG, WebP, or GIF', { icon: '⚠️' })
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum 10MB', { icon: '⚠️' })
      return
    }

    setFile(selectedFile)
    setImageUrl('')
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(selectedFile)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelect(droppedFile)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file && !imageUrl.trim()) {
      toast.error('Please provide an image URL or upload a file', { icon: '⚠️' })
      return
    }

    setLoading(true)
    try {
      const inputData: any = {
        engines: engines.length > 0 ? engines : undefined,
        extract_exif: extractExif,
        extract_faces: extractFaces,
        perceptual_hash: perceptualHash,
      }

      if (file) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        inputData.image_base64 = base64.split(',')[1]
      } else {
        inputData.image_url = imageUrl.trim()
      }

      const job = await createJob('image', inputData)
      if (job) {
        toast.success('Search started', { icon: '🖼️' })
        navigate(`/jobs/${job.id}`)
      }
    } catch {
      toast.error('Failed to start search', { icon: '⚠️' })
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
            style={{ background: 'linear-gradient(135deg, var(--accent-green) 0%, var(--accent-cyan) 100%)' }}
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <motion.h1 className="heading-2">Image Search</motion.h1>
            <motion.p className="text-[var(--text-secondary)] mt-1">Reverse image search with EXIF, face matching & perceptual hashing</motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-3">
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-green-400">4</div>
          <div className="text-xs text-[var(--text-muted)]">Engines</div>
        </GlassCard>
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-cyan-400">10MB</div>
          <div className="text-xs text-[var(--text-muted)]">Max Size</div>
        </GlassCard>
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-purple-400">pHash</div>
          <div className="text-xs text-[var(--text-muted)]">Hashing</div>
        </GlassCard>
        <GlassCard variant="bordered" padding="sm" className="text-center">
          <div className="text-2xl font-mono font-bold text-orange-400">EXIF</div>
          <div className="text-xs text-[var(--text-muted)]">Metadata</div>
        </GlassCard>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        variants={itemVariants}
        className="glass-card p-6 space-y-6"
      >
        {/* Image Input - URL or Upload */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-1">
            Image <span className="text-red-400">*</span>
          </label>

          {/* URL Input */}
          <motion.div className="mb-4">
            <motion.div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" aria-hidden="true" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  if (e.target.value) {
                    setFile(null)
                    setPreview(null)
                  }
                }}
                className="neon-input pl-10"
                placeholder="https://example.com/image.jpg"
                disabled={loading || !!file}
              />
            </motion.div>
          </motion.div>

          {/* Or divider */}
          <motion.div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--bg-primary)] text-[var(--text-muted)]">OR</span>
            </div>
          </motion.div>

          {/* File Upload Dropzone */}
          <motion.div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={clsx(
              'relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200',
              dragActive
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/10 hover:border-green-400/50',
              file && 'border-green-500 bg-green-500/10'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={loading || !!imageUrl}
            />

            {file && preview ? (
              <motion.div className="relative max-w-xs mx-auto">
                <motion.img
                  src={preview}
                  alt="Preview"
                  className="rounded-lg max-h-64 object-contain"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Upload className="w-14 h-14 text-[var(--text-muted)] mx-auto mb-3" />
                <motion.p className="text-[var(--text-secondary)] mb-1">Drop an image or click to browse</motion.p>
                <motion.p className="text-sm text-[var(--text-muted)]">JPEG, PNG, WebP, GIF • Max 10MB</motion.p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Search Engines */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Search Engines</label>
          <StaggerContainer className="grid grid-cols-2 gap-3" staggerChildren={0.05}>
            {engineOptions.map((engine) => (
              <StaggerItem key={engine.id}>
                <motion.label
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200',
                    engines.includes(engine.id)
                      ? 'border-green-500/50 bg-green-500/10 shadow-[0_0_20px_rgba(34,255,136,0.1)]'
                      : 'border-white/10 hover:border-green-400/30'
                  )}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    type="checkbox"
                    checked={engines.includes(engine.id)}
                    onChange={(e) => setEngines(e.target.checked ? [...engines, engine.id] : engines.filter((id) => id !== engine.id))}
                    className="w-4 h-4 text-green-500 border-white/20 rounded focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-[var(--text-primary)]">{engine.name}</span>
                    {engine.requiresKey && (
                      <span className="ml-2 text-xs text-orange-400">(requires API key)</span>
                    )}
                  </div>
                </motion.label>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </motion.div>

        {/* Options */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'exif',
              label: 'Extract EXIF',
              desc: 'GPS, camera info, timestamps',
              icon: Camera,
              color: 'cyan',
              checked: extractExif,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setExtractExif(e.target.checked),
            },
            {
              id: 'faces',
              label: 'Face Detection',
              desc: 'Find matching profiles',
              icon: Shield,
              color: 'purple',
              checked: extractFaces,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setExtractFaces(e.target.checked),
            },
            {
              id: 'phash',
              label: 'Perceptual Hash',
              desc: 'Find near-duplicate images',
              icon: Target,
              color: 'orange',
              checked: perceptualHash,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPerceptualHash(e.target.checked),
            },
          ].map((opt) => (
            <StaggerItem key={opt.id}>
              <motion.label
                className={clsx(
                  'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200',
                  opt.checked
                    ? `border-${opt.color}-500/50 bg-${opt.color}-500/10 shadow-[0_0_20px_rgba(0,240,255,0.1)]`
                    : 'border-white/10 hover:border-green-400/30'
                )}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={opt.onChange}
                  className="w-4 h-4 text-green-500 border-white/20 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <opt.icon className={`w-5 h-5 text-${opt.color}-400`} />
                    <span className="font-medium text-[var(--text-primary)]">{opt.label}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{opt.desc}</p>
                </div>
              </motion.label>
            </StaggerItem>
          ))}
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants}>
          <NeonButton
            type="submit"
            disabled={loading || (!file && !imageUrl.trim())}
            loading={loading}
            leftIcon={<Zap className="w-5 h-5" />}
            rightIcon={<Target className="w-5 h-5" />}
            className="w-full"
            size="lg"
          >
            Start Search
          </NeonButton>
        </motion.div>
      </motion.form>

      {/* Info Panel */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6 border-green-500/20"
        style={{ background: 'rgba(34,255,136,0.03)' }}
      >
        <motion.div className="flex gap-4">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent-green) 0%, var(--accent-cyan) 100%)' }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Image className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <motion.h3 className="font-medium text-green-400">Capabilities</motion.h3>
            <motion.ul className="mt-2 text-sm text-[var(--text-secondary)] space-y-1.5" variants={listVariants}>
              <motion.li variants={listItemVariants}>• EXIF metadata extraction (GPS, camera, timestamps)</motion.li>
              <motion.li variants={listItemVariants}>• Perceptual hashing (pHash/dHash) for near-duplicate detection</motion.li>
              <motion.li variants={listItemVariants}>• Face detection & embedding extraction for profile matching</motion.li>
              <motion.li variants={listItemVariants}>• Multi-engine search: Google, Yandex, TinEye, Bing</motion.li>
              <motion.li variants={listItemVariants}>• Results cached for faster repeated lookups</motion.li>
            </motion.ul>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
import { useState, useCallback, useRef } from 'react'
import { useJobsStore } from '../stores/jobs'
import { useNavigate } from 'react-router-dom'
import { Image, Loader2, Upload, Camera, Search, X, CheckCircle, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

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
      toast.error('Invalid file type. Use JPEG, PNG, WebP, or GIF')
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum 10MB')
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
      toast.error('Please provide an image URL or upload a file')
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
        // Convert to base64
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
        toast.success('Search started')
        navigate(`/jobs/${job.id}`)
      }
    } catch {
      toast.error('Failed to start search')
    } finally {
      setLoading(false)
    }
  }

  const engineOptions = [
    { id: 'google', name: 'Google Images', requiresKey: true },
    { id: 'yandex', name: 'Yandex Images', requiresKey: true },
    { id: 'tineye', name: 'TinEye', requiresKey: true },
    { id: 'bing', name: 'Bing Visual Search', requiresKey: true },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
          <Image className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          Image Search
        </h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Reverse image search with EXIF extraction, face matching & perceptual hashing</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Image Input - URL or Upload */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
            Image <span className="text-red-500">*</span>
          </label>

          {/* URL Input */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
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
                className="input pl-10"
                placeholder="https://example.com/image.jpg"
                disabled={loading || !!file}
              />
            </div>
          </div>

          {/* Or divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-200 dark:border-dark-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-900 text-dark-500 dark:text-dark-400">OR</span>
            </div>
          </div>

          {/* File Upload Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={clsx(
              'relative border-2 border-dashed rounded-xl p-6 text-center transition-colors',
              dragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-dark-300 dark:border-dark-600 hover:border-primary-400',
              file && 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={loading || !!imageUrl}
            />

            {file && preview ? (
              <div className="relative max-w-xs mx-auto">
                <img src={preview} alt="Preview" className="rounded-lg max-h-64 object-contain" />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                <p className="text-dark-600 dark:text-dark-400 mb-1">Drop an image or click to browse</p>
                <p className="text-sm text-dark-500 dark:text-dark-500">JPEG, PNG, WebP, GIF • Max 10MB</p>
              </>
            )}
          </div>
        </div>

        {/* Search Engines */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
            Search Engines
          </label>
          <div className="grid grid-cols-2 gap-3">
            {engineOptions.map((engine) => (
              <label key={engine.id} className={clsx(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                engines.includes(engine.id)
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-dark-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700'
              )}>
                <input
                  type="checkbox"
                  checked={engines.includes(engine.id)}
                  onChange={(e) => setEngines(e.target.checked ? [...engines, engine.id] : engines.filter((id) => id !== engine.id))}
                  className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-dark-900 dark:text-white">{engine.name}</span>
                  {engine.requiresKey && (
                    <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(requires API key)</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={clsx(
            'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
            extractExif ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-600'
          )}>
            <input
              type="checkbox"
              checked={extractExif}
              onChange={(e) => setExtractExif(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500"
            />
            <div>
              <Camera className="w-5 h-5 text-dark-400" />
              <span className="ml-2 font-medium text-dark-900 dark:text-white">Extract EXIF</span>
              <p className="text-xs text-dark-500 dark:text-dark-400">GPS, camera info, timestamps</p>
            </div>
          </label>

          <label className={clsx(
            'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
            extractFaces ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-600'
          )}>
            <input
              type="checkbox"
              checked={extractFaces}
              onChange={(e) => setExtractFaces(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500"
            />
            <div>
              <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">👤</span>
              </div>
              <span className="ml-2 font-medium text-dark-900 dark:text-white">Face Detection</span>
              <p className="text-xs text-dark-500 dark:text-dark-400">Find matching profiles</p>
            </div>
          </label>

          <label className={clsx(
            'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
            perceptualHash ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-600'
          )}>
            <input
              type="checkbox"
              checked={perceptualHash}
              onChange={(e) => setPerceptualHash(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500"
            />
            <div>
              <Search className="w-5 h-5 text-dark-400" />
              <span className="ml-2 font-medium text-dark-900 dark:text-white">Perceptual Hash</span>
              <p className="text-xs text-dark-500 dark:text-dark-400">Find near-duplicate images</p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || (!file && !imageUrl.trim())}
          className="btn-primary w-full py-3 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            'Start Search'
          )}
        </button>
      </form>

      {/* Info */}
      <div className="card p-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex gap-4">
          <Image className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-primary-800 dark:text-primary-300">Capabilities</h3>
            <ul className="mt-2 text-sm text-primary-700 dark:text-primary-400 space-y-1">
              <li>• EXIF metadata extraction (GPS, camera, timestamps)</li>
              <li>• Perceptual hashing (pHash/dHash) for near-duplicate detection</li>
              <li>• Face detection & embedding extraction for profile matching</li>
              <li>• Multi-engine search: Google, Yandex, TinEye, Bing</li>
              <li>• Results cached for faster repeated lookups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
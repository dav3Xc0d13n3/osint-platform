export type JobType = 'username' | 'image' | 'link'
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface PlatformResult {
  platform: string
  url: string
  exists: boolean
  status_code?: number
  response_time?: number
  error?: string
}

export interface UsernameEnumerateRequest {
  username: string
  platforms?: string[]
  timeout?: number
}

export interface UsernameEnumerateResponse {
  username: string
  total_platforms: number
  found: number
  not_found: number
  errors: number
  results: PlatformResult[]
  elapsed_time: number
}

export interface ImageSearchRequest {
  image_url?: string
  engines?: string[]
  extract_exif?: boolean
  extract_faces?: boolean
  perceptual_hash?: boolean
}

export interface ExifData {
  gps?: Record<string, any>
  camera?: Record<string, any>
  datetime?: string
  software?: string
  raw: Record<string, any>
}

export interface FaceMatch {
  platform: string
  profile_url: string
  confidence: number
  thumbnail?: string
}

export interface ImageSearchResult {
  source_url?: string
  exif?: ExifData
  perceptual_hash?: string
  face_embeddings?: number[][]
  engine_results: Record<string, any[]>
  face_matches: FaceMatch[]
}

export interface LinkAnalyzeRequest {
  url: string
  expand_shorteners?: boolean
  follow_redirects?: boolean
  extract_metadata?: boolean
  check_ssl?: boolean
  enumerate_subdomains?: boolean
  check_archives?: boolean
  threat_intel?: boolean
}

export interface RedirectHop {
  url: string
  status_code: number
  headers: Record<string, string>
  latency: number
}

export interface MetadataResult {
  title?: string
  description?: string
  image?: string
  type?: string
  site_name?: string
  twitter_card?: Record<string, any>
  json_ld: any[]
}

export interface SSLInfo {
  valid: boolean
  issuer?: string
  subject?: string
  not_before?: string
  not_after?: string
  san: string[]
  fingerprint?: string
}

export interface ThreatIntelResult {
  source: string
  malicious: boolean
  categories: string[]
  details: Record<string, any>
}

export interface LinkAnalyzeResult {
  original_url: string
  final_url: string
  redirect_chain: RedirectHop[]
  metadata?: MetadataResult
  ssl?: SSLInfo
  subdomains: string[]
  archive_snapshots: string[]
  threat_intel: ThreatIntelResult[]
}

export interface JobCreate {
  job_type: JobType
  input_data: Record<string, any>
}

export interface JobResponse {
  id: string
  job_type: JobType
  status: JobStatus
  input_data: Record<string, any>
  result_data?: Record<string, any>
  error_message?: string
  progress: number
  created_at: string
  started_at?: string
  completed_at?: string
  elapsed_time?: number
}

export interface JobStatusResponse {
  id: string
  job_type: JobType
  status: JobStatus
  input_data: Record<string, any>
  progress: number
  result_data?: Record<string, any>
  error_message?: string
  created_at: string
  started_at?: string
  completed_at?: string
  elapsed_time?: number
}

export interface APIKeyCreate {
  name: string
  rate_limit?: string
  expires_in_days?: number
}

export interface APIKeyResponse {
  id: string
  name: string
  key_prefix: string
  plain_key?: string
  is_active: boolean
  rate_limit: string
  expires_at?: string
  created_at: string
  last_used?: string
}
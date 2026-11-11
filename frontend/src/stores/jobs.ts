import { create } from 'zustand'
import api from '../services/api'
import type { JobResponse, JobType, JobStatus } from '../types'

interface JobsState {
  jobs: JobResponse[]
  currentJob: JobResponse | null
  loading: boolean
  error: string | null
  fetchJobs: (params?: { type?: JobType; status?: JobStatus; limit?: number; offset?: number }) => Promise<void>
  fetchJob: (id: string) => Promise<JobResponse | null>
  createJob: (jobType: JobType, inputData: Record<string, unknown>) => Promise<JobResponse | null>
  deleteJob: (id: string) => Promise<void>
  pollJob: (id: string, interval?: number) => Promise<void>
  clearCurrentJob: () => void
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,

  fetchJobs: async (params) => {
    set({ loading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params?.type) searchParams.set('type', params.type)
      if (params?.status) searchParams.set('status', params.status)
      if (params?.limit) searchParams.set('limit', String(params.limit))
      if (params?.offset) searchParams.set('offset', String(params.offset))

      const res = await api.get(`/jobs?${searchParams.toString()}`)
      set({ jobs: res.data, loading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to fetch jobs', loading: false })
    }
  },

  fetchJob: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get(`/jobs/${id}`)
      const job = res.data
      set({ currentJob: job, loading: false })
      return job
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to fetch job', loading: false })
      return null
    }
  },

  createJob: async (jobType, inputData) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post(`/${jobType}/${jobType === 'username' ? 'enumerate' : jobType === 'image' ? 'search' : 'analyze'}`, inputData)
      const job = res.data
      set((state) => ({ jobs: [job, ...state.jobs], loading: false }))
      return job
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to create job', loading: false })
      return null
    }
  },

  deleteJob: async (id) => {
    try {
      await api.delete(`/jobs/${id}`)
      set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }))
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to delete job' })
    }
  },

  pollJob: async (id, interval = 2000) => {
    const maxAttempts = 150 // 5 minutes
    let attempts = 0

    const poll = async () => {
      if (attempts >= maxAttempts) return
      attempts++

      const job = await get().fetchJob(id)
      if (!job) return

      if (job.status === 'completed' || job.status === 'failed') {
        // Refresh job list
        get().fetchJobs()
        return
      }

      setTimeout(poll, interval)
    }

    await poll()
  },

  clearCurrentJob: () => set({ currentJob: null }),
}))
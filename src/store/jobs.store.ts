import { create } from 'zustand'
import { jobsApi, type JobDetails, type JobSummary } from '@/api/jobs.api'

export class RequestState {
  constructor(
    public loading = false,
    public error: string | null = null,
  ) {}
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type JobsState = {
  jobs: JobSummary[]
  nextCursor: string | null
  activeJobId: string | null
  details: JobDetails | null
  listRequest: RequestState
  createRequest: RequestState
  detailsRequest: RequestState
  cancelRequest: RequestState
  fetchJobs: () => Promise<void>
  loadMore: () => Promise<void>
  createJob: (urls: string[]) => Promise<string | null>
  selectJob: (id: string) => void
  fetchDetails: () => Promise<void>
  cancelJob: () => Promise<boolean>
}

const idle = () => new RequestState()
const pending = () => new RequestState(true)
const failed = (error: unknown) =>
  new RequestState(
    false,
    error instanceof Error ? error.message : 'Неизвестная ошибка',
  )

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  nextCursor: null,
  activeJobId: null,
  details: null,
  listRequest: idle(),
  createRequest: idle(),
  detailsRequest: idle(),
  cancelRequest: idle(),

  fetchJobs: async () => {
    set({ listRequest: pending() })
    try {
      const page = await jobsApi.list()
      set({ jobs: page.items, nextCursor: page.nextCursor, listRequest: idle() })
    } catch (error) {
      set({ listRequest: failed(error) })
    }
  },

  loadMore: async () => {
    const { jobs, nextCursor, listRequest } = get()
    if (!nextCursor || listRequest.loading) return
    set({ listRequest: pending() })
    try {
      const page = await jobsApi.list(20, nextCursor)
      const known = new Set(jobs.map(({ id }) => id))
      set({
        jobs: [...jobs, ...page.items.filter(({ id }) => !known.has(id))],
        nextCursor: page.nextCursor,
        listRequest: idle(),
      })
    } catch (error) {
      set({ listRequest: failed(error) })
    }
  },

  createJob: async (urls) => {
    set({ createRequest: pending() })
    try {
      const { jobId } = await jobsApi.create(urls)
      set({ activeJobId: jobId, details: null, createRequest: idle() })
      get().fetchJobs()
      return jobId
    } catch (error) {
      set({ createRequest: failed(error) })
      return null
    }
  },

  selectJob: (activeJobId) => {
    set({ activeJobId, details: null, detailsRequest: idle() })
  },

  fetchDetails: async () => {
    const id = get().activeJobId
    if (!id) return
    set({ detailsRequest: pending() })
    try {
      const details = await jobsApi.details(id)
      if (get().activeJobId === id) set({ details, detailsRequest: idle() })
    } catch (error) {
      if (get().activeJobId === id) set({ detailsRequest: failed(error) })
    }
  },

  cancelJob: async () => {
    const id = get().activeJobId
    if (!id) return false
    set({ cancelRequest: pending() })
    try {
      await jobsApi.cancel(id)
      set({ cancelRequest: idle() })
      return true
    } catch (error) {
      set({ cancelRequest: failed(error) })
      return false
    }
  },
}))

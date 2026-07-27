import { create } from 'zustand'
import {
  jobsApi,
  type JobDetails,
  type JobSummary,
} from '@/api/jobs.api'
export class RequestState {
  constructor(public loading = false, public error: string | null = null) {}
}

// Zustand достаточно легкий и простой стейт менедежер с flux архитектурой. Если проект будет более крупный, то уже нужно перейти на Redux Toolkit

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
const pending = () => new RequestState(true)
const failed = (error: unknown) =>
  new RequestState(false, error instanceof Error ? error.message : 'Unknown error')
export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  nextCursor: null,
  activeJobId: null,
  details: null,
  listRequest: new RequestState(), createRequest: new RequestState(),
  detailsRequest: new RequestState(), cancelRequest: new RequestState(),
  fetchJobs: async () => {
    set({ listRequest: pending() })
    try {
      const page = await jobsApi.list()
      set({
        jobs: page.items,
        nextCursor: page.nextCursor,
        listRequest: new RequestState(),
      })
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
      const ids = new Set(jobs.map((job) => job.id))
      set({
        jobs: [...jobs, ...page.items.filter((job) => !ids.has(job.id))],
        nextCursor: page.nextCursor,
        listRequest: new RequestState(),
      })
    } catch (error) {
      set({ listRequest: failed(error) })
    }
  },
  createJob: async (urls) => {
    set({ createRequest: pending() })
    try {
      const { jobId } = await jobsApi.create(urls)
      set({
        activeJobId: jobId,
        details: null,
        createRequest: new RequestState(),
      })
      return jobId
    } catch (error) {
      set({ createRequest: failed(error) })
      return null
    }
  },
  selectJob: (id) => {
    set({
      activeJobId: id,
      details: null,
      detailsRequest: new RequestState(),
    })
  },
  fetchDetails: async () => {
    const id = get().activeJobId
    if (!id) return
    set({ detailsRequest: pending() })
    try {
      const details = await jobsApi.details(id)
      if (get().activeJobId === id) {
        set({ details, detailsRequest: new RequestState() })
      }
    } catch (error) {
      set({ detailsRequest: failed(error) })
    }
  },
  cancelJob: async () => {
    const id = get().activeJobId
    if (!id) return false
    set({ cancelRequest: pending() })
    try {
      await jobsApi.cancel(id)
      set({ cancelRequest: new RequestState() })
      return true
    } catch (error) {
      set({ cancelRequest: failed(error) })
      return false
    }
  },
}))

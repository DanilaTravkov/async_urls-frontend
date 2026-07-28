export enum JobStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Failed = 'failed',
}
export enum UrlStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Success = 'success',
  Error = 'error',
  Cancelled = 'cancelled',
}
export class CreateJobRequest {
  constructor(public urls: string[]) {}
}
export class CreateJobResponse {
  jobId!: string
}
export class JobStats {
  success!: number
  error!: number
}
export class JobSummary {
  id!: string
  createdAt!: string
  status!: JobStatus
  urlCount!: number
  stats!: JobStats
}
export class JobsPage {
  items!: JobSummary[]
  nextCursor!: string | null
}
export class UrlResult {
  url!: string
  status!: UrlStatus
  httpStatus!: number | null
  error!: string | null
  startedAt!: string | null
  finishedAt!: string | null
  durationMs!: number | null
}
export class JobDetails {
  id!: string
  status!: JobStatus
  items!: UrlResult[]
}
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const instance = <T extends object>(Type: new () => T, value: T) =>
  Object.assign(new Type(), value)

export class JobsApi {
  constructor(
    private readonly baseUrl = '/api',
  ) {}
  create(urls: string[]) {
    return this.request('/jobs', CreateJobResponse, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(new CreateJobRequest(urls)),
    })
  }

  async list(limit = 20, cursor?: string) {
    const query = new URLSearchParams({ limit: String(limit) })
    if (cursor) query.set('cursor', cursor)
    const page = await this.request(`/jobs?${query}`, JobsPage)
    page.items = page.items.map((job) => {
      const summary = instance(JobSummary, job)
      summary.stats = instance(JobStats, job.stats)
      return summary
    })
    return page
  }

  async details(id: string) {
    const details = await this.request(`/jobs/${id}`, JobDetails)
    details.items = details.items.map((item) => instance(UrlResult, item))
    return details
  }

  async cancel(id: string) {
    const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw await this.toError(response)
  }

  private async request<T extends object>(
    path: string,
    Type: new () => T,
    init?: RequestInit,
  ) {
    const response = await fetch(`${this.baseUrl}${path}`, init)
    if (!response.ok) throw await this.toError(response)
    return instance(Type, (await response.json()) as T)
  }

  private async toError(response: Response) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[]
    } | null
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message ?? `HTTP ${String(response.status)}`
    return new ApiError(response.status, message)
  }
}

export const jobsApi = new JobsApi()

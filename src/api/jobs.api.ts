// Почему классы а не интерфейсы? Та же логика, что и на бекенде - интерфейсы исчезают при транспиляции, а классы остаются и к ним можно обратиться в рантайме.

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
export class CreateJobRequest { constructor(public urls: string[]) {} }
export class CreateJobResponse { constructor(public jobId: string) {} }
export class JobStats {
  constructor(public success: number, public error: number) {}
}
export class JobSummary {
  constructor(
    public id: string,
    public createdAt: string,
    public status: JobStatus,
    public urlCount: number,
    public stats: JobStats,
  ) {}
  static from(value: JobSummary): JobSummary {
    return new JobSummary(
      value.id,
      value.createdAt,
      value.status,
      value.urlCount,
      new JobStats(value.stats.success, value.stats.error),
    )
  }
}
export class JobsPage {
  constructor(
    public items: JobSummary[],
    public nextCursor: string | null,
  ) {}
  static from(value: JobsPage): JobsPage {
    return new JobsPage(
      value.items.map((item) => JobSummary.from(item)),
      value.nextCursor,
    )
  }
}
export class UrlResult {
  constructor(
    public url: string,
    public status: UrlStatus,
    public httpStatus: number | null,
    public error: string | null,
    public startedAt: string | null,
    public finishedAt: string | null,
    public durationMs: number | null,
  ) {}
  static from(value: UrlResult): UrlResult {
    return new UrlResult(
      value.url,
      value.status,
      value.httpStatus,
      value.error,
      value.startedAt,
      value.finishedAt,
      value.durationMs,
    )
  }
}
export class JobDetails {
  constructor(
    public id: string,
    public status: JobStatus,
    public items: UrlResult[],
  ) {}
  static from(value: JobDetails): JobDetails {
    return new JobDetails(
      value.id,
      value.status,
      value.items.map((item) => UrlResult.from(item)),
    )
  }
}

// Не использую здесь axios или Tanstack Query потому что API всего одно - для задач (jobs), для такого задания хватает и обычного fetch

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}
export class JobsApi {
  constructor(
    private readonly baseUrl =
      (import.meta.env as Record<string, string | undefined>).VITE_API_URL ??
      '/api',
  ) {}
  create(urls: string[]): Promise<CreateJobResponse> {
    return this.json(
      '/jobs',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(new CreateJobRequest(urls)),
      },
      (value) => new CreateJobResponse(value.jobId),
    )
  }
  list(limit = 20, cursor?: string): Promise<JobsPage> {
    const query = new URLSearchParams({ limit: limit.toString() })
    if (cursor) query.set('cursor', cursor)
    return this.json(`/jobs?${query.toString()}`, {}, (value) =>
      JobsPage.from(value),
    )
  }
  details(id: string): Promise<JobDetails> {
    return this.json(`/jobs/${id}`, {}, (value) => JobDetails.from(value))
  }
  async cancel(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw await this.error(response)
  }
  private async json<T>(
    path: string,
    init: RequestInit,
    transform: (value: T) => T,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init)
    if (!response.ok) throw await this.error(response)
    return transform((await response.json()) as T)
  }
  private async error(response: Response): Promise<ApiError> {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[]
    } | null
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message ?? `HTTP ${response.status.toString()}`
    return new ApiError(response.status, message)
  }
}
export const jobsApi = new JobsApi()

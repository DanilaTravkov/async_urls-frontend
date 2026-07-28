import { useEffect } from 'react'
import { JobStatus } from '@/api/jobs.api'
import { useJobsStore } from '@/store/jobs.store'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { isJobTerminal } from '@/shared/lib/jobs'
import { useNavigate } from 'react-router-dom'

const statusLabels: Record<JobStatus, string> = {
  [JobStatus.Pending]: 'Ожидает',
  [JobStatus.InProgress]: 'Выполняется',
  [JobStatus.Completed]: 'Завершено',
  [JobStatus.Cancelled]: 'Отменено',
  [JobStatus.Failed]: 'Ошибка',
}

const LIST_POLLING_INTERVAL = 3000

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function JobsList() {
  const jobs = useJobsStore((state) => state.jobs)
  const nextCursor = useJobsStore((state) => state.nextCursor)
  const activeJobId = useJobsStore((state) => state.activeJobId)
  const request = useJobsStore((state) => state.listRequest)
  const fetchJobs = useJobsStore((state) => state.fetchJobs)
  const loadMore = useJobsStore((state) => state.loadMore)
  const selectJob = useJobsStore((state) => state.selectJob)

  const navigate = useNavigate()

  const hasRunningJobs = jobs.some(
    (job) => !isJobTerminal(job.status)
  )

  useEffect(() => {
    void fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    if (!hasRunningJobs) return

    let cancelled = false
    let timeoutId: number | undefined

    async function refresh() {
      await fetchJobs()

      if (cancelled) return

      timeoutId = window.setTimeout(() => {
        void refresh()
      }, LIST_POLLING_INTERVAL)
    }

    timeoutId = window.setTimeout(() => {
      void refresh()
    }, LIST_POLLING_INTERVAL)

    return () => {
      cancelled = true

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [fetchJobs, hasRunningJobs])

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>Последние задания</CardTitle>
        {
          !request.loading && !request.error && jobs.length !== 0 && (
            <CardDescription>
              Выберите задание для просмотра подробной информации
            </CardDescription>
          )
        }
      </CardHeader>

      <CardContent className="space-y-3">
        {request.loading && jobs.length === 0 && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}

        {request.error && jobs.length === 0 && (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-destructive">
              {request.error}
            </p>

            <Button
              variant="outline"
              onClick={() => {
                void fetchJobs()
              }}
            >
              Повторить
            </Button>
          </div>
        )}

        {!request.loading && !request.error && jobs.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Заданий пока нет
          </p>
        )}

        <div className="max-h-[30rem] space-y-2 overflow-y-auto pr-1">
          {jobs.map((job) => (
            <button
              key={job.id}
              type="button"
              className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                activeJobId === job.id ? 'border-primary bg-muted/50' : ''
              }`}
              onClick={() => {
                selectJob(job.id)
                void navigate(`/jobs/${job.id}`)
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="truncate font-medium"
                  title={job.id}
                >
                  Задание #{job.id.slice(0, 8)}
                </span>

                <Badge
                  className="shrink-0"
                  variant={
                    job.status === JobStatus.Failed
                      ? 'destructive'
                      : job.status === JobStatus.Completed
                        ? 'outline'
                        : 'secondary'
                  }
                >
                  {statusLabels[job.status]}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span className="text-muted-foreground">
                  {dateFormatter.format(new Date(job.createdAt))}
                </span>

                <span>URL: {job.urlCount}</span>

                <span className="text-emerald-600">
                  Успешно: {job.stats.success}
                </span>

                {job.stats.error > 0 && (
                  <span className="text-destructive">
                    С ошибкой: {job.stats.error}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {nextCursor && (
          <Button
            variant="outline"
            disabled={request.loading}
            onClick={() => {
              void loadMore()
            }}
          >
            {request.loading ? 'Загрузка...' : 'Показать ещё'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

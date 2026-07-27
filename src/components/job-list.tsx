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

const statusLabels: Record<JobStatus, string> = {
  [JobStatus.Pending]: 'Ожидает',
  [JobStatus.InProgress]: 'Выполняется',
  [JobStatus.Completed]: 'Завершено',
  [JobStatus.Cancelled]: 'Отменено',
  [JobStatus.Failed]: 'Ошибка',
}

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

  useEffect(() => {
    void fetchJobs()
  }, [fetchJobs])

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>Последние задания</CardTitle>
        <CardDescription>
          Выберите задание для просмотра подробной информации
        </CardDescription>
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

        {jobs.map((job) => (
          <button
            key={job.id}
            type="button"
            className={`w-full rounded-xl border p-4 text-left transition-colors hover:bg-muted/50 ${
              activeJobId === job.id ? 'border-primary bg-muted/50' : ''
            }`}
            onClick={() => {
              selectJob(job.id)
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Badge
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

            <p className="mt-2 text-sm text-muted-foreground">
              {dateFormatter.format(new Date(job.createdAt))}
            </p>

            <p className="mt-3 text-sm">
              URL: {job.urlCount} · Успешно: {job.stats.success} · С ошибкой:{' '}
              {job.stats.error}
            </p>
          </button>
        ))}

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
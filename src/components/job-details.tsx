import { JobStatus, UrlStatus } from '@/api/jobs.api'
import { useJobsStore } from '@/store/jobs.store'
import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Progress } from '@/shared/components/ui/progress'
import { Skeleton } from '@/shared/components/ui/skeleton'

const jobLabels: Record<JobStatus, string> = {
  [JobStatus.Pending]: 'Ожидает',
  [JobStatus.InProgress]: 'Выполняется',
  [JobStatus.Completed]: 'Завершено',
  [JobStatus.Cancelled]: 'Отменено',
  [JobStatus.Failed]: 'Ошибка',
}

const urlLabels: Record<UrlStatus, string> = {
  [UrlStatus.Pending]: 'Ожидает',
  [UrlStatus.InProgress]: 'Проверяется',
  [UrlStatus.Success]: 'Успешно',
  [UrlStatus.Error]: 'Ошибка',
  [UrlStatus.Cancelled]: 'Отменено',
}

const completedStatuses = new Set([
  UrlStatus.Success,
  UrlStatus.Error,
  UrlStatus.Cancelled,
])

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'medium',
})

export function JobDetails() {
  const details = useJobsStore((state) => state.details)
  const request = useJobsStore((state) => state.detailsRequest)

  if (request.loading && !details) {
    return <Skeleton className="mt-8 h-64 w-full" />
  }

  if (!details) {
    return (
      <p role={request.error ? 'alert' : undefined} className="mt-8 text-sm">
        {request.error ?? 'Информация о задании не найдена'}
      </p>
    )
  }

  const completed = details.items.filter((item) =>
    completedStatuses.has(item.status),
  ).length

  const percentage =
    details.items.length === 0
      ? 0
      : Math.round((completed / details.items.length) * 100)

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex flex-wrap justify-between gap-3">
          <CardTitle className="break-all font-mono">
            {details.id}
          </CardTitle>

          <Badge>{jobLabels[details.status]}</Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Обработано {completed} из {details.items.length}
        </p>

        <Progress value={percentage} aria-label="Прогресс задания" />
      </CardHeader>

      <CardContent className="space-y-3">
        {request.error && (
          <p role="alert" className="text-sm text-destructive">
            {request.error}
          </p>
        )}

        {details.items.map((item, index) => (
          <article
            key={`${item.url}-${String(index)}`}
            className="rounded-xl border p-4"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <p className="break-all font-medium">{item.url}</p>

              <Badge
                variant={
                  item.status === UrlStatus.Error
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {urlLabels[item.status]}
              </Badge>
            </div>

            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              {item.httpStatus !== null && (
                <p>HTTP-код: {item.httpStatus}</p>
              )}

              {item.error && (
                <p className="text-destructive">{item.error}</p>
              )}

              {item.startedAt && (
                <p>
                  Начало: {dateFormatter.format(new Date(item.startedAt))}
                </p>
              )}

              {item.finishedAt && (
                <p>
                  Окончание: {dateFormatter.format(new Date(item.finishedAt))}
                </p>
              )}

              {item.durationMs !== null && (
                <p>Длительность: {item.durationMs} мс</p>
              )}
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  )
}
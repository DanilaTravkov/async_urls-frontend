import { useState, type SubmitEvent } from 'react'
import { LoaderCircle } from 'lucide-react'
import { z } from 'zod'
import { useJobsStore } from '@/store/jobs.store'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Textarea } from '@/shared/components/ui/textarea'

const urlsSchema = z
  .string()
  .transform((value) =>
    value
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean),
  )
  .pipe(
    z.array(
        z.httpUrl({
          error: 'Каждая строка должна содержать корректный HTTP или HTTPS URL',
        }),
      )
      .min(1, {
        error: 'Добавьте хотя бы один URL',
      }),
  )

export function JobCreateForm() {
  const [value, setValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const createJob = useJobsStore((state) => state.createJob)
  const request = useJobsStore((state) => state.createRequest)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = urlsSchema.safeParse(value)

    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ?? 'Проверьте введённые URL',
      )
      return
    }

    setValidationError(null)
    const jobId = await createJob(result.data)

    if (jobId) setValue('')
  }

  const error = validationError ?? request.error

  return (
    <Card className="mt-10 max-w-3xl">
      <CardHeader>
        <CardTitle>Новое задание</CardTitle>
        <CardDescription>
          Укажите каждый URL с новой строки
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <label className="sr-only" htmlFor="job-urls">
            URL для проверки
          </label>

          <Textarea
            id="job-urls"
            value={value}
            rows={8}
            placeholder={'https://example.com\nhttps://nestjs.com'}
            disabled={request.loading}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setValue(event.target.value)
              setValidationError(null)
            }}
          />

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={request.loading}>
            {request.loading && (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            )}
            {request.loading ? 'Запуск...' : 'Запустить проверку'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

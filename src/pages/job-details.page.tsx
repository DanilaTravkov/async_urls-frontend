import { Link, useParams } from 'react-router-dom'
import { AppHeader } from '@/components/app-header'
import { JobDetails } from '@/components/job-details'
import { useJobPolling } from '@/hooks/use-job-polling'

export function JobDetailsPage() {
  const { id } = useParams<{ id: string }>()

  useJobPolling(id ?? null)

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          to="/"
        >
          ← Вернуться к заданиям
        </Link>

        <JobDetails />
      </main>
    </div>
  )
}
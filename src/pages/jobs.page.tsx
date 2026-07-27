import { Activity } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { FeatureCard } from '@/components/feature-card'
import { JobCreateForm } from '@/components/job-create-form'
import { JobsList } from '@/components/job-list'

const sections = [
  {
    title: 'Текущий прогресс',
    description: 'Детали активного задания',
    icon: Activity,
  },
]

export function JobsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="max-w-3xl">
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Проверяйте список адресов в одном задании
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Создавайте задания, выбирайте последнее и следите за обработкой URL.
          </p>
        </section>

        <JobCreateForm />
        <JobsList />

        <section
          aria-label="Разделы приложения"
          className="mt-10 grid gap-4 md:grid-cols-2"
        >
          {sections.map((section) => (
            <FeatureCard key={section.title} {...section} />
          ))}
        </section>
      </main>
    </div>
  )
}

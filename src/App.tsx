import { Activity, ListChecks, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const sections = [
  {
    title: 'Новое задание',
    description: 'Форма добавления URL появится на следующем этапе.',
    icon: Plus,
  },
  {
    title: 'История заданий',
    description: 'Здесь будет отображаться список последних проверок.',
    icon: ListChecks,
  },
  {
    title: 'Текущий прогресс',
    description: 'Детали активного задания будут обновляться автоматически.',
    icon: Activity,
  },
]

function App() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity aria-hidden="true" className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Async URL Checker</p>
            <h1 className="text-lg font-semibold tracking-tight">
              Сервис асинхронной проверки URL
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="max-w-3xl">
          <Badge variant="secondary">Frontend foundation</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Проверяйте список адресов в одном задании
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Интерфейс подготовлен для создания заданий, просмотра истории и
            отслеживания обработки URL в реальном времени.
          </p>
        </section>

        <section
          aria-label="Разделы приложения"
          className="mt-10 grid gap-4 md:grid-cols-3"
        >
          {sections.map(({ title, description, icon: Icon }) => (
            <Card key={title}>
              <CardHeader>
                <Icon
                  aria-hidden="true"
                  className="mb-3 size-5 text-muted-foreground"
                />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App

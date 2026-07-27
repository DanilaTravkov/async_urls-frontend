import { Activity } from 'lucide-react'

export function AppHeader() {
  return (
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
  )
}

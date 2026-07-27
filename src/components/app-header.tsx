import { Activity } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5">
        <Activity aria-hidden="true" className="size-6" />
        <div>
          <p className="text-sm text-muted-foreground">Async URL Checker</p>
          <h1 className="text-lg font-semibold">Сервис асинхронной проверки URL</h1>
        </div>
      </div>
    </header>
  )
}

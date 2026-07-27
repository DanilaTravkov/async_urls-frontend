import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the application shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Сервис асинхронной проверки URL',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Разделы приложения' }),
    ).toBeInTheDocument()
  })
})

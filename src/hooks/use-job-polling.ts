import { useEffect } from 'react'
import { useJobsStore } from '@/store/jobs.store'
import { isJobTerminal } from '@/shared/lib/jobs'

const POLLING_INTERVAL_MS = 2000

export function useJobPolling(id: string | null) {
  const selectJob = useJobsStore((state) => state.selectJob)
  const fetchDetails = useJobsStore((state) => state.fetchDetails)

  useEffect(() => {
    if (!id) return

    let cancelled = false
    let timeoutId: number | undefined

    async function poll() {
      await fetchDetails()

      if (cancelled) return

      const state = useJobsStore.getState()
      const details = state.details

      if (state.activeJobId !== id) return

      if (details?.id === id && isJobTerminal(details.status)) {
        return
      }

      timeoutId = window.setTimeout(() => {
        void poll()
      }, POLLING_INTERVAL_MS)
    }

    selectJob(id)
    void poll()

    return () => {
      cancelled = true

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [id, fetchDetails, selectJob])
}
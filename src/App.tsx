import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { JobDetailsPage } from '@/pages/job-details.page'
import { JobsPage } from '@/pages/jobs.page'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar    from './components/Layout/Sidebar.jsx'
import Dashboard  from './pages/Dashboard.jsx'
import Partners   from './pages/Partners.jsx'
import Contracts  from './pages/Contracts.jsx'
import Analytics  from './pages/Analytics.jsx'
import Risk       from './pages/Risk.jsx'

export default function App() {
  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/"            element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/partners"    element={<Partners />} />
          <Route path="/contracts"   element={<Contracts />} />
          <Route path="/analytics"   element={<Analytics />} />
          <Route path="/risk"        element={<Risk />} />
        </Routes>
      </main>
    </div>
  )
}

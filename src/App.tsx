import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Equipos from './pages/Equipos'
import Clientes from './pages/Clientes'
import Contratos from './pages/Contratos'
import Alertas from './pages/Alertas'
import Mantenimiento from './pages/Mantenimiento'

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/contratos" element={<Contratos />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/mantenimiento" element={<Mantenimiento />} />
        </Routes>
      </main>
    </div>
  )
}

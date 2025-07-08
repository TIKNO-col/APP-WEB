import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './components/Auth'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Clientes from './pages/Clientes'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Obtener la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const Dashboard = () => (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 pl-64">
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Navigate to="/clientes" replace />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/productos" element={<div className="p-6"><h2 className="text-2xl font-semibold">Productos</h2></div>} />
            <Route path="/ventas" element={<div className="p-6"><h2 className="text-2xl font-semibold">Ventas</h2></div>} />
            <Route path="/informes" element={<div className="p-6"><h2 className="text-2xl font-semibold">Informes</h2></div>} />
            <Route path="/usuarios" element={<div className="p-6"><h2 className="text-2xl font-semibold">Usuarios</h2></div>} />
          </Routes>
        </main>
      </div>
    </div>
  )

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !session ? (
              <Auth />
            ) : (
              <Navigate to="/clientes" replace />
            )
          }
        />
        <Route
          path="/*"
          element={
            session ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Clientes from './pages/Clientes';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 pl-64">
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Navigate to="/clientes" replace />} />
              <Route path="/clientes" element={<Clientes />} />
              {/* Otras rutas se agregarán aquí */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

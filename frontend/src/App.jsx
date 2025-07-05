import { useState } from 'react'
import './App.css'
import Usuarios from './components/Usuarios'
import './components/Usuarios.css'

function App() {
  return (
    <div className="app-container">
      <h1>APP WEB - Gestión de Usuarios</h1>
      <Usuarios />
    </div>
  )
}

export default App

import { useState } from 'react'
import loginDecoration from '../assets/login-decoration.svg'
import logo from '../assets/Logo.png'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [nombre, setNombre] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || 'Error al iniciar sesión')

      // Guardar tokens en localStorage
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)

      // Forzar la recarga del estado de autenticación
      window.location.href = '/clientes'
    } catch (error) {
      console.error('Error durante el login:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/auth/registro/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
          nombre,
          rol: 'usuario',
          zona_acceso: 'general'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Error en el registro')
      }

      setSuccess('Registro completado exitosamente. Ahora puedes iniciar sesión.')
      setIsRegistering(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Fondo con degradado */}
      <div className="absolute inset-0 flex">
        <div className="w-[35%] bg-[#111827]"></div>
        <div className="flex-1 bg-white"></div>
      </div>
      <div className="relative w-[35%] flex items-center justify-center">
        <div className="w-full max-w-md rounded-xl bg-[#FFFFFF] p-8 shadow-lg">
          <div className="w-full space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img src={logo} alt="VentasApp Logo" className="h-12 w-auto" />
                <h1 className="text-4xl font-bold text-[#111827]">TIKNO Market</h1>
              </div>
              <h2 className="text-center text-2xl font-semibold text-[#111827]">
                {isRegistering ? 'Crear cuenta nueva' : 'Bienvenido de nuevo'}
              </h2>
              <p className="text-center text-sm text-[#6B7280]">
                {isRegistering ? 'Completa tus datos para registrarte' : 'Ingresa tus credenciales para continuar'}
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={isRegistering ? handleSignUp : handleLogin}>
              {isRegistering && (
                <>
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-[#6B7280]">
                      Nombre completo
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-[#E5E7EB] px-4 py-2 text-[#111827] placeholder-[#6B7280] focus:border-[#3B82F6] focus:ring-[#3B82F6] sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-[#6B7280]">
                      Nombre de usuario
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-[#E5E7EB] px-4 py-2 text-[#111827] placeholder-[#6B7280] focus:border-[#3B82F6] focus:ring-[#3B82F6] sm:text-sm"
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#6B7280]">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[#E5E7EB] px-4 py-2 text-[#111827] placeholder-[#6B7280] focus:border-[#3B82F6] focus:ring-[#3B82F6] sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#6B7280]">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[#E5E7EB] px-4 py-2 text-[#111827] placeholder-[#6B7280] focus:border-[#3B82F6] focus:ring-[#3B82F6] sm:text-sm"
                />
              </div>

              {success && (
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">{success}</h3>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#3B82F6] px-6 py-3 text-base font-semibold text-[#FFFFFF] transition-all duration-150 hover:bg-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#93C5FD] disabled:opacity-70"
                >
                  {loading ? 'Procesando...' : isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering)
                    setError(null)
                    setSuccess(null)
                    setUsername('')
                  }}
                  className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors duration-150"
                >
                  {isRegistering
                    ? '¿Ya tienes una cuenta? Inicia sesión'
                    : '¿No tienes una cuenta? Regístrate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Lado derecho - Decoración */}
      <div className="relative w-[65%] flex items-center justify-center pl-32">
        <div className="relative bg-[#E5E7EB] rounded-full p-20 shadow-2xl">
            <motion.img
              src={logo}
              alt="VentasApp Logo"
              className="w-48"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              scale: { type: "spring", damping: 5, stiffness: 100, bounce: 0.5 }
            }}
          />
        </div>
      </div>
    </div>
  )
}
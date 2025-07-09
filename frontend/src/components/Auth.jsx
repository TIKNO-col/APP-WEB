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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <img src={logo} alt="VentasApp Logo" className="h-10 w-auto" />
              <h1 className="text-3xl font-bold text-gray-900 -ml-1">TIKNO Market</h1>
            </div>
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="mt-2 text-sm text-gray-600">
              {isRegistering ? 'Regístrate para comenzar' : 'Inicia sesión en tu cuenta'}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={isRegistering ? handleSignUp : handleLogin}>
            {isRegistering && (
              <>
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                    Nombre completo
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nombre de usuario
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-black sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-black sm:text-sm"
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
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                {loading ? 'Procesando...' : isRegistering ? 'Registrarse' : 'Iniciar sesión'}
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
                className="text-sm text-gray-600 hover:text-black"
              >
                {isRegistering
                  ? '¿Ya tienes una cuenta? Inicia sesión'
                  : '¿No tienes una cuenta? Regístrate'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lado derecho - Decoración */}
      <div className="relative hidden w-1/2 bg-gray-50 lg:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={loginDecoration} alt="Decoración" className="absolute max-w-full" />
          <motion.img
            src={logo}
            alt="VentasApp Logo"
            className="relative z-10 w-48"
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
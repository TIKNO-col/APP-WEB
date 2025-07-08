import { useState } from 'react'
import { supabase } from '../supabase'
import loginDecoration from '../assets/login-decoration.svg'
import logo from '../assets/Logo.png'
import { motion } from 'framer-motion'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
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
      // Registrar el usuario con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: nombre,
          },
        },
      })

      if (authError) throw authError

      if (authData?.user) {
        // Insertar información adicional en la tabla usuarios
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert([{
            email,
            nombre,
            password_hash: password, // Esto es temporal, idealmente el hash debería manejarse en el backend
            rol: 'admin',
            zona_acceso: 'general'
          }])

        if (profileError) throw profileError
        setSuccess('Registro completado exitosamente. Iniciando sesión...')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Lado izquierdo - Formulario */}
      <div className="flex w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <img src={logo} alt="VentasApp Logo" className="h-10 w-auto" />
              <h1 className="text-3xl font-bold text-gray-900 -ml-1">TIKNO Market</h1>
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
              {isRegistering ? 'Crear cuenta' : 'Bienvenido de nuevo'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isRegistering ? 'Regístrate para comenzar' : 'Inicia sesión en tu cuenta'}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={isRegistering ? handleSignUp : handleLogin}>
            {isRegistering && (
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
                className="group relative flex w-full justify-center rounded-lg border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
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
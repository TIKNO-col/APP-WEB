import React, { useState, useEffect } from 'react';

const UsuarioModal = ({ usuario, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nombre: '',
    rol: 'user',
    zona_acceso: 'general',
    is_active: true
  });

  useEffect(() => {
    if (usuario && (mode === 'edit' || mode === 'view')) {
      setFormData({
        username: usuario.username || '',
        email: usuario.email || '',
        password: '',
        nombre: usuario.nombre || '',
        rol: usuario.rol || 'user',
        zona_acceso: usuario.zona_acceso || 'general',
        is_active: usuario.is_active
      });
    }
  }, [usuario, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'view') return;

    const submitData = { ...formData };
    if (mode === 'edit' && !submitData.password) {
      delete submitData.password;
    }

    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'create' ? 'Crear Usuario' :
             mode === 'edit' ? 'Editar Usuario' :
             'Detalles del Usuario'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={mode === 'view'}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={mode === 'view'}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {mode !== 'view' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {mode === 'create' ? 'Contraseña' : 'Nueva Contraseña (dejar en blanco para mantener)'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={mode === 'create'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={mode === 'view'}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="user">Usuario</option>
              <option value="staff">Staff</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Zona de Acceso</label>
            <select
              name="zona_acceso"
              value={formData.zona_acceso}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="restringida">Restringida</option>
              <option value="administrativa">Administrativa</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Usuario Activo</label>
          </div>

          {mode !== 'view' && (
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {mode === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          )}

          {mode === 'view' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UsuarioModal;
import { useState } from 'react';
import { UserPlus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const mockUsuarios = [
  {
    id: 1,
    nombre: 'Carlos Ruiz',
    email: 'carlos.ruiz@example.com',
    rol: 'Administrador',
    estado: 'Activo'
  },
  {
    id: 2,
    nombre: 'Ana López',
    email: 'ana.lopez@example.com',
    rol: 'Empleado',
    estado: 'Activo'
  },
  {
    id: 3,
    nombre: 'Miguel Ángel',
    email: 'miguel.angel@example.com',
    rol: 'Soporte',
    estado: 'Activo'
  },
  {
    id: 4,
    nombre: 'Sofía Gómez',
    email: 'sofia.gomez@example.com',
    rol: 'Empleado',
    estado: 'Inactivo'
  },
  {
    id: 5,
    nombre: 'Javier Torres',
    email: 'javier.torres@example.com',
    rol: 'Soporte',
    estado: 'Activo'
  }
];

const roles = ['Administrador', 'Empleado', 'Soporte'];

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState(mockUsuarios);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    rol: 'Empleado',
    estado: 'Activo'
  });

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setUsuarioEditando(usuario);
      setNuevoUsuario(usuario);
    } else {
      setUsuarioEditando(null);
      setNuevoUsuario({
        nombre: '',
        email: '',
        rol: 'Empleado',
        estado: 'Activo'
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    setNuevoUsuario({
      nombre: '',
      email: '',
      rol: 'Empleado',
      estado: 'Activo'
    });
  };

  const guardarUsuario = () => {
    if (usuarioEditando) {
      setUsuarios(usuarios.map(u =>
        u.id === usuarioEditando.id ? { ...nuevoUsuario, id: usuarioEditando.id } : u
      ));
    } else {
      setUsuarios([...usuarios, { ...nuevoUsuario, id: usuarios.length + 1 }]);
    }
    cerrarModal();
  };

  const eliminarUsuario = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  const cambiarEstado = (id) => {
    setUsuarios(usuarios.map(u =>
      u.id === id ? { ...u, estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo' } : u
    ));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Administrar Usuarios</h2>
        <p className="mt-1 text-sm text-gray-600">
          Gestiona los usuarios de la aplicacion, incluyendo inicio de sesión, registro, roles y acceso restringido.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {usuariosFiltrados.map((usuario) => (
              <tr key={usuario.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-500">{usuario.email}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                    {usuario.rol}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    onClick={() => cambiarEstado(usuario.id)}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${usuario.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {usuario.estado === 'Activo' ? (
                      <CheckCircle className="mr-1 h-4 w-4" />
                    ) : (
                      <XCircle className="mr-1 h-4 w-4" />
                    )}
                    {usuario.estado}
                  </button>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => abrirModal(usuario)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => abrirModal()}
          className="flex items-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Usuario
        </button>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <div className="mt-2">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={nuevoUsuario.nombre}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={nuevoUsuario.email}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={nuevoUsuario.rol}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
                    >
                      {roles.map((rol) => (
                        <option key={rol} value={rol}>{rol}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={nuevoUsuario.estado}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, estado: e.target.value })}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-3 sm:text-sm"
                  onClick={guardarUsuario}
                >
                  {usuarioEditando ? 'Guardar cambios' : 'Crear usuario'}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                {usuarioEditando && (
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:col-start-2 sm:mt-0 sm:text-sm"
                    onClick={() => {
                      eliminarUsuario(usuarioEditando.id);
                      cerrarModal();
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage;
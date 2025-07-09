import React, { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '../services/auth';
import { Eye, PencilLine, Trash2, Plus, Search, X } from 'lucide-react';
import UsuarioModal from './UsuarioModal';

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      console.log('Iniciando fetchUsuarios...');
      
      // Primero obtener el perfil del usuario actual
      const perfilResponse = await makeAuthenticatedRequest('/usuarios/perfil/', {
        method: 'GET',
      });
      const perfilData = await perfilResponse.json();
      console.log('Perfil del usuario:', perfilData);

      setCurrentUser(perfilData);
      setIsAdmin(perfilData.rol === 'admin');
      
      const response = await makeAuthenticatedRequest('/usuarios/', {
        method: 'GET',
      });

      console.log('Response status:', response.status);
      const data = await response.json();

      if (response.ok) {
        console.log('Datos recibidos:', data);
        setUsuarios(data);
        setError(null);
      } else {
        throw new Error(data.detail || 'Error al obtener los usuarios');
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      setError(error.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [showModal]);

  const handleView = (usuario) => {
    setSelectedUsuario(usuario);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (usuario) => {
    // Solo permitir edición si es admin o si es el propio usuario
    if (isAdmin || usuario.id === currentUser.id) {
      setSelectedUsuario(usuario);
      setModalMode('edit');
      setShowModal(true);
    } else {
      alert('No tienes permiso para editar este usuario');
    }
  };

  const handleCreate = () => {
    setSelectedUsuario(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = async (usuario) => {
    // Solo permitir eliminación si es admin
    if (!isAdmin) {
      alert('No tienes permiso para eliminar usuarios');
      return;
    }

    if (usuario.id === currentUser.id) {
      alert('No puedes eliminar tu propio usuario');
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${usuario.nombre}?`)) {
      try {
        const response = await makeAuthenticatedRequest(`/usuarios/${usuario.id}/`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setUsuarios(usuarios.filter(u => u.id !== usuario.id));
          alert('Usuario eliminado exitosamente');
          fetchUsuarios(); // Recargar la lista después de eliminar
        } else {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || 'Error al eliminar el usuario');
        }
      } catch (error) {
        console.error('Error deleting usuario:', error);
        alert(error.message);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUsuario(null);
  };

  const handleModalSave = async (usuarioData) => {
    try {
      let response;
      if (modalMode === 'create') {
        response = await makeAuthenticatedRequest('/auth/registro/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(usuarioData)
        });
      } else if (modalMode === 'edit') {
        response = await makeAuthenticatedRequest(`/usuarios/${selectedUsuario.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(usuarioData)
        });
      }

      const data = await response.json();

      if (response.ok) {
        if (modalMode === 'create') {
          setUsuarios([data, ...usuarios]);
          alert('Usuario creado exitosamente');
        } else {
          setUsuarios(usuarios.map(usuario => 
            usuario.id === selectedUsuario.id ? data : usuario
          ));
          alert('Usuario actualizado exitosamente');
        }
        setError(null);
        handleModalClose();
      } else {
        let errorMessage = 'Error al procesar la solicitud';
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.email) {
          errorMessage = `Error en el email: ${data.email.join(', ')}`;
        } else if (data.username) {
          errorMessage = `Error en el nombre de usuario: ${data.username.join(', ')}`;
        } else if (data.password) {
          errorMessage = `Error en la contraseña: ${data.password.join(', ')}`;
        } else if (data.nombre) {
          errorMessage = `Error en el nombre: ${data.nombre.join(', ')}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving usuario:', error);
      alert(error.message || 'Error al guardar el usuario');
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.rol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Lista de Usuarios</h2>
          <button
            onClick={handleCreate}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <Plus className="mr-2" size={16} />
            Nuevo Usuario
          </button>
        </div>
        
        <div className="mt-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Completo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zona Acceso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsuarios.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
                </td>
              </tr>
            ) : (
              filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {usuario.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usuario.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usuario.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.rol === 'admin' ? 'bg-red-100 text-red-800' :
                      usuario.rol === 'staff' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usuario.zona_acceso}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(usuario)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Ver detalles"
                    >
                      <Eye className="inline-block w-5 h-5" />
                    </button>
                    {(isAdmin || usuario.id === currentUser?.id) && (
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="text-orange-500 hover:text-orange-700 mr-3"
                        title="Editar usuario"
                      >
                        <PencilLine className="inline-block w-5 h-5" />
                      </button>
                    )}
                    {isAdmin && usuario.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(usuario)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="inline-block w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UsuarioModal
          usuario={selectedUsuario}
          mode={modalMode}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default UsuarioList;
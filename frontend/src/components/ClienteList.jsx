import React, { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '../services/auth';
import ClienteForm from './ClienteForm';
import { Eye, PencilLine, Trash2 } from 'lucide-react';

const ClienteList = () => {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [viewingCliente, setViewingCliente] = useState(null);

  const fetchClientes = async () => {
    try {
      console.log('Iniciando fetchClientes...');
      const response = await makeAuthenticatedRequest('/clientes/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        setClientes(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error en la respuesta:', response.status, errorData);
        throw new Error(errorData.detail || `Error al cargar los clientes: ${response.status}`);
      }
    } catch (error) {
      console.error('Error en fetchClientes:', error);
      setError(error.message || 'Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleDelete = async (cedula) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
      try {
        const response = await makeAuthenticatedRequest(`/clientes/${cedula}/`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setClientes(clientes.filter(cliente => cliente.cedula !== cedula));
          setError(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Error al eliminar el cliente');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        setError(error.message);
      }
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setViewingCliente(null);
    setShowForm(true);
  };

  const handleView = (cliente) => {
    setViewingCliente(cliente);
    setEditingCliente(null);
    setShowForm(false);
  };

  const handleClienteAdded = (newCliente) => {
    if (editingCliente) {
      setClientes(clientes.map(cliente =>
        cliente.cedula === newCliente.cedula ? newCliente : cliente
      ));
      setEditingCliente(null);
    } else {
      setClientes([...clientes, newCliente]);
    }
    setShowForm(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-gray-600">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button
          onClick={() => {
            setEditingCliente(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Nuevo Cliente
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <ClienteForm
            onClienteAdded={handleClienteAdded}
            initialData={editingCliente}
            isEditing={!!editingCliente}
            onCancel={() => {
              setShowForm(false);
              setEditingCliente(null);
            }}
          />
        </div>
      )}

      {viewingCliente && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Detalles del Cliente</h3>
            <button
              onClick={() => setViewingCliente(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Cédula</p>
              <p className="text-gray-900">{viewingCliente.cedula}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Nombre</p>
              <p className="text-gray-900">{viewingCliente.nombre}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{viewingCliente.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Teléfono</p>
              <p className="text-gray-900">{viewingCliente.telefono}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ciudad</p>
              <p className="text-gray-900">{viewingCliente.ciudad}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
              <p className="text-gray-900">{new Date(viewingCliente.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No hay clientes registrados
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.cedula}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.cedula}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.telefono}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.ciudad}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(cliente)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Ver detalles"
                    >
                      <Eye className="inline-block w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="text-orange-500 hover:text-orange-700 mr-3"
                      title="Editar cliente"
                    >
                      <PencilLine className="inline-block w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.cedula)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="inline-block w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClienteList;
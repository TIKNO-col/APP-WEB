import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

const API_BASE_URL = 'http://localhost:8000/api';

// Función para obtener el token de autenticación
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Función para hacer peticiones autenticadas
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  console.log('Token obtenido:', token ? 'Token presente' : 'Sin token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  
  console.log('Haciendo petición a:', url);
  console.log('Headers:', headers);

  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  console.log('Respuesta recibida:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.log('Error response body:', errorText);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const jsonData = await response.json();
  console.log('JSON parseado:', jsonData);
  return jsonData;
};

const VentasPage = () => {
  const [carrito, setCarrito] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cedula, setCedula] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procesandoVenta, setProcesandoVenta] = useState(false);
  const [cantidadesProductos, setCantidadesProductos] = useState({});

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const fetchProductos = async () => {
    try {
      console.log('Intentando cargar productos desde:', `${API_BASE_URL}/productos/`);
      const data = await fetchWithAuth(`${API_BASE_URL}/productos/`);
      console.log('Datos recibidos:', data);
      setProductos(data || []);
      setError(null);
    } catch (error) {
      console.error('Error detallado fetching productos:', error);
      setError(`Error al cargar productos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/categorias/`);
      setCategorias(['Todas', ...data.map(cat => cat.nombre)]);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const filteredProductos = productos.filter(producto => {
    const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = categoriaSeleccionada === 'Todas' || 
                          (producto.categoria_nombre && producto.categoria_nombre === categoriaSeleccionada);
    return matchSearch && matchCategoria;
  });

  const buscarCliente = async (cedulaBuscar) => {
    if (!cedulaBuscar.trim()) {
      setClienteSeleccionado(null);
      return;
    }

    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/clientes/${cedulaBuscar}/`);
      setClienteSeleccionado(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching cliente:', error);
      setClienteSeleccionado(null);
      setError('Cliente no encontrado');
    }
  };

  const agregarAlCarrito = (producto, cantidad = 1) => {
    const existeEnCarrito = carrito.find(item => item.id === producto.id);
    
    if (existeEnCarrito) {
      // Si ya existe, aumentar cantidad
      actualizarCantidad(producto.id, existeEnCarrito.cantidad + cantidad);
    } else {
      // Si no existe, agregarlo con la cantidad especificada
      setCarrito([...carrito, { ...producto, cantidad: cantidad }]);
    }
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }

    setCarrito(carrito.map(item => {
      if (item.id === id) {
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    const impuesto = subtotal * 0.16; // 16% de impuesto
    const total = subtotal + impuesto;
    return { subtotal, impuesto, total };
  };

  const procesarVenta = async () => {
    if (!clienteSeleccionado) {
      setError('Por favor, selecciona un cliente');
      return;
    }
    if (carrito.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    setProcesandoVenta(true);
    setError(null);

    try {
      const totales = calcularTotal();
      
      const ventaData = {
        cliente: clienteSeleccionado.cedula,
        subtotal: totales.subtotal.toFixed(2),
        impuesto: totales.impuesto.toFixed(2),
        total: totales.total.toFixed(2),
        items: carrito.map(item => ({
          producto: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        }))
      };

      const response = await fetchWithAuth(`${API_BASE_URL}/ventas/`, {
        method: 'POST',
        body: JSON.stringify(ventaData)
      });

      // Limpiar el carrito y cliente después de una venta exitosa
      setCarrito([]);
      setClienteSeleccionado(null);
      setCedula('');
      
      alert(`Venta procesada exitosamente. ID: ${response.id}`);
      
      // Actualizar la lista de productos para reflejar el nuevo stock
      fetchProductos();
      
    } catch (error) {
      console.error('Error procesando venta:', error);
      setError('Error al procesar la venta: ' + error.message);
    } finally {
      setProcesandoVenta(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Cargando productos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Nueva Venta</h2>
      
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
    </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Sección de Cliente */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Cédula de Cliente</h3>
          <input
            type="text"
            placeholder="Ingresar cédula"
            className="h-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            onBlur={() => buscarCliente(cedula)}
          />
          {clienteSeleccionado && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-900">{clienteSeleccionado.nombre}</p>
              <p className="text-xs text-blue-700">{clienteSeleccionado.email}</p>
            </div>
          )}
        </div>

        {/* Sección de Productos */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Productos</h3>
          
          {/* Filtros */}
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          {/* Lista de Productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProductos.map(producto => (
               <div key={producto.id} className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                 <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                 <p className="text-sm text-gray-600 mt-1">{producto.descripcion}</p>
                 <div className="flex items-center justify-between mt-2">
                   <span className="text-sm text-gray-500">Stock: {producto.stock}</span>
                   <span className="text-sm text-gray-500">{producto.categoria_nombre}</span>
                 </div>
                 <div className="mt-3">
                   <span className="text-lg font-bold text-green-600">${parseFloat(producto.precio).toFixed(2)}</span>
                 </div>
                 <div className="flex items-center gap-2 mt-3">
                   <input
                     type="number"
                     min="1"
                     max={producto.stock}
                     value={cantidadesProductos[producto.id] || 1}
                     onChange={(e) => setCantidadesProductos({
                       ...cantidadesProductos,
                       [producto.id]: Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1))
                     })}
                     className="w-16 text-center text-sm border border-gray-300 rounded px-2 py-1"
                     disabled={producto.stock <= 0}
                   />
                   <button
                     onClick={() => {
                       const cantidad = cantidadesProductos[producto.id] || 1;
                       agregarAlCarrito(producto, cantidad);
                       // Resetear la cantidad después de agregar
                       setCantidadesProductos({
                         ...cantidadesProductos,
                         [producto.id]: 1
                       });
                     }}
                     disabled={producto.stock <= 0}
                     className={`flex-1 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                       producto.stock <= 0
                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                         : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                     }`}
                   >
                     {producto.stock <= 0 ? 'Sin stock' : 'Agregar'}
                   </button>
                 </div>
               </div>
             ))}
          </div>
          
          {filteredProductos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron productos
            </div>
          )}
        </div>

        {/* Carrito */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Carrito de Compras</h3>
          
          {carrito.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">El carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-3">
              {carrito.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.nombre}</h4>
                    <p className="text-sm text-gray-600">${parseFloat(item.precio).toFixed(2)} c/u</p>
                    <p className="text-xs text-gray-500">Stock disponible: {item.stock}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                      className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.cantidad}
                      onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value) || 1)}
                      className="w-16 text-center text-sm border border-gray-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                      disabled={item.cantidad >= item.stock}
                      className={`rounded-full p-1 ${
                        item.cantidad >= item.stock
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="rounded-full p-1 text-red-400 hover:text-red-600 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-medium text-gray-900">${(parseFloat(item.precio) * item.cantidad).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              {/* Totales */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${calcularTotal().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuesto (16%):</span>
                  <span>${calcularTotal().impuesto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>${calcularTotal().total.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={procesarVenta}
                disabled={procesandoVenta || !clienteSeleccionado}
                className={`w-full rounded-lg px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  procesandoVenta || !clienteSeleccionado
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {procesandoVenta ? 'Procesando...' : 'Procesar Venta'}
              </button>
            </div>
          )}
        </div>

      </div>
          </div>
          
  )
}

export default VentasPage;
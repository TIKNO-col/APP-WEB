import { useState } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

const mockProductos = [
  { id: '#001', nombre: 'Laptop Pro 15', categoria: 'Electronicos', precio: 1200, imagen: 'https://placehold.co/200x200' },
  { id: '#002', nombre: 'Smartphone X20', categoria: 'Electronicos', precio: 800, imagen: 'https://placehold.co/200x200' },
  { id: '#003', nombre: 'Tablet 10"', categoria: 'Electronicos', precio: 299.99, imagen: 'https://placehold.co/200x200' },
  { id: '#004', nombre: 'Smart TV 55"', categoria: 'Electronicos', precio: 699.99, imagen: 'https://placehold.co/200x200' },
  { id: '#005', nombre: 'Camiseta Casual', categoria: 'Ropa', precio: 29.99, imagen: 'https://placehold.co/200x200' },
  { id: '#006', nombre: 'Pantalón Jeans', categoria: 'Ropa', precio: 59.99, imagen: 'https://placehold.co/200x200' },
  { id: '#007', nombre: 'Vestido Elegante', categoria: 'Ropa', precio: 89.99, imagen: 'https://placehold.co/200x200' },
  { id: '#008', nombre: 'Lámpara LED', categoria: 'Hogar', precio: 45.99, imagen: 'https://placehold.co/200x200' },
  { id: '#009', nombre: 'Mesa de Centro', categoria: 'Hogar', precio: 149.99, imagen: 'https://placehold.co/200x200' },
  { id: '#010', nombre: 'Silla Ergonómica', categoria: 'Hogar', precio: 199.99, imagen: 'https://placehold.co/200x200' },
];

const mockClientes = [
  { cedula: '1234567890', nombre: 'Sofía Mendoza' },
  { cedula: '0987654321', nombre: 'Diego Herrera' },
];

const categorias = ['Electronicos', 'Ropa', 'Hogar'];

const VentasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [cedula, setCedula] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [carrito, setCarrito] = useState([]);

  const filteredProductos = mockProductos.filter(producto => {
    const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = categoriaSeleccionada === 'Todas' || producto.categoria === categoriaSeleccionada;
    return matchSearch && matchCategoria;
  });

  const buscarCliente = (cedula) => {
    const cliente = mockClientes.find(c => c.cedula === cedula);
    setClienteSeleccionado(cliente || null);
  };

  const agregarAlCarrito = (producto) => {
    setCarrito([{ ...producto, cantidad: 1 }]);
  };

  const actualizarCantidad = (id, cambio) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + cambio;
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    const impuesto = subtotal * 0.16; // 12% de impuesto
    const total = subtotal + impuesto;
    return { subtotal, impuesto, total };
  };

  const procesarVenta = () => {
    if (!clienteSeleccionado) {
      alert('Por favor, selecciona un cliente');
      return;
    }
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    // Aquí iría la lógica para procesar la venta
    console.log('Procesando venta:', { cliente: clienteSeleccionado, items: carrito, totales: calcularTotal() });
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Nueva Venta</h2>
      
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
            </div>
          )}
        </div>

        {/* Sección de Productos */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Seleccionar Producto</h3>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setCategoriaSeleccionada(categoria)}
                  className={`border-b-2 px-1 py-4 text-sm font-medium ${categoriaSeleccionada === categoria ? 'border-black text-black' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                >
                  {categoria}
                </button>
              ))}
            </nav>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {filteredProductos.map((producto) => (
              <div
                key={producto.id}
                className="flex flex-col space-y-2"
                onClick={() => agregarAlCarrito(producto)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full aspect-square rounded-lg object-cover"
                />
                <h3 className="text-sm font-medium text-gray-900">{producto.nombre}</h3>
                 <p className="text-sm font-semibold text-gray-900">${producto.precio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sección de Cantidad y Total */}
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Cantidad</h3>
            <input
              type="number"
              placeholder="Ingresar cantidad"
              className="w-3/4 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={carrito[0]?.cantidad || ''}
              onChange={(e) => carrito[0] && actualizarCantidad(carrito[0].id, parseInt(e.target.value) - carrito[0].cantidad)}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Total</h3>
            <p className="text-2xl font-semibold">${calcularTotal().total.toFixed(2)}</p>
          </div>
        </div>

            </div>
                      <button
            onClick={procesarVenta}
            className="float-right rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 mt-8"
          >
            Guardar Venta
          </button>
          </div>
          
  )
}

export default VentasPage;
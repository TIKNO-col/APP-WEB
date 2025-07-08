import { useState } from 'react';
import ProductoModal from './ProductoModal';
import { Search, MoreVertical, AlertTriangle } from 'lucide-react';

const mockProductos = [
  { id: '#001', producto: 'Producto A', categoria: 'Electrónica', stock: 100, precio: 20 },
  { id: '#002', producto: 'Producto B', categoria: 'Ropa', stock: 50, precio: 30 },
  { id: '#003', producto: 'Producto C', categoria: 'Alimentos', stock: 200, precio: 5 },
  { id: '#004', producto: 'Producto D', categoria: 'Hogar', stock: 75, precio: 15 },
  { id: '#005', producto: 'Producto E', categoria: 'Deportes', stock: 120, precio: 25 },
  { id: '#006', producto: 'Producto F', categoria: 'Juguetes', stock: 80, precio: 10 },
  { id: '#007', producto: 'Producto G', categoria: 'Libros', stock: 150, precio: 8 },
  { id: '#008', producto: 'Producto H', categoria: 'Mascotas', stock: 60, precio: 12 },
  { id: '#009', producto: 'Producto I', categoria: 'Salud', stock: 90, precio: 18 },
  { id: '#010', producto: 'Producto J', categoria: 'Belleza', stock: 110, precio: 22 },
];

const categorias = [
  'Todas',
  'Electrónica',
  'Ropa',
  'Alimentos',
  'Hogar',
  'Deportes',
  'Juguetes',
  'Libros',
  'Mascotas',
  'Salud',
  'Belleza'
];

const ProductosTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productos] = useState(mockProductos);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [mostrarStockBajo, setMostrarStockBajo] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const filteredProductos = productos.filter(producto => {
    const matchSearch = Object.values(producto).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchCategoria = categoriaSeleccionada === 'Todas' || producto.categoria === categoriaSeleccionada;
    const matchPrecioMin = !precioMin || producto.precio >= Number(precioMin);
    const matchPrecioMax = !precioMax || producto.precio <= Number(precioMax);
    const matchStockBajo = !mostrarStockBajo || producto.stock < 50;

    return matchSearch && matchCategoria && matchPrecioMin && matchPrecioMax && (mostrarStockBajo ? matchStockBajo : true);
  });

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Producto</th>
              <th scope="col" className="px-6 py-3">Categoría</th>
              <th scope="col" className="px-6 py-3">Stock</th>
              <th scope="col" className="px-6 py-3">Precio</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.map((producto) => (
              <tr key={producto.id} className="border-b bg-white hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{producto.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{producto.producto}</td>
                <td className="px-6 py-4">{producto.categoria}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {producto.stock < 50 && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className={producto.stock < 50 ? 'text-yellow-500' : ''}>
                      {producto.stock}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">${producto.precio.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setProductoSeleccionado(producto);
                      setModalAbierto(true);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProductoModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        producto={productoSeleccionado}
      />
    </div>
  );
};

export default ProductosTable;
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProductoModal from '../components/ProductoModal';
import ProductosTable from '../components/ProductosTable';
import { supabase } from '../supabase';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categoria:categorias(id, nombre)
        `)
        .order('nombre');

      if (error) throw error;
      setProductos(data);
    } catch (error) {
      console.error('Error fetching productos:', error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (producto) => {
    setSelectedProducto(producto);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        const { error } = await supabase
          .from('productos')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await fetchProductos();
      } catch (error) {
        console.error('Error deleting producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProducto(null);
    fetchProductos();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <ProductosTable
        productos={productos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <ProductoModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        producto={selectedProducto}
      />
    </div>
  );
};

export default Productos;
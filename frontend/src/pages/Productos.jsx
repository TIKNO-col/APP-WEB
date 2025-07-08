import ProductosTable from '../components/ProductosTable';

const Productos = () => {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Productos</h2>
        <button
          onClick={() => setModalAbierto(true)}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-black hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100"
        >
          Nuevo Producto
        </button>
      </div>
      <ProductosTable />
    </div>
  );
};

export default Productos;
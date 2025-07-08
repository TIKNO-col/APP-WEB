import ClientesTable from '../components/ClientesTable';

const Clientes = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Clientes</h2>
        <p className="mt-1 text-sm text-gray-600">
          Gestiona la información de tus clientes
        </p>
      </div>
      <ClientesTable />
    </div>
  );
};

export default Clientes;
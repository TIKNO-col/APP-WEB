import { useState } from 'react';
import { Search, Edit2, Trash2, Eye } from 'lucide-react';

const mockClientes = [
  { id: 1, nombre: 'Sofía Mendoza', email: 'sofia.mendoza@email.com', cedula: '1234567890', telefono: '555-123-4567', ciudad: 'Bogotá' },
  { id: 2, nombre: 'Diego Herrera', email: 'diego.herrera@email.com', cedula: '0987654321', telefono: '555-987-6543', ciudad: 'Medellín' },
  { id: 3, nombre: 'Luciana Torres', email: 'luciana.torres@email.com', cedula: '1122334455', telefono: '555-246-8013', ciudad: 'Cali' },
  { id: 4, nombre: 'Alejandro Silva', email: 'alejandro.silva@email.com', cedula: '5544332211', telefono: '555-369-1470', ciudad: 'Barranquilla' },
  { id: 5, nombre: 'Martina Castro', email: 'martina.castro@email.com', cedula: '6677889900', telefono: '555-789-0123', ciudad: 'Cartagena' },
];

const ClientesTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes] = useState(mockClientes);

  const filteredClientes = clientes.filter(cliente =>
    Object.values(cliente).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300">
          Nuevo Cliente
        </button>
      </div>

      <div className="relative overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Cédula</th>
              <th scope="col" className="px-6 py-3">Teléfono</th>
              <th scope="col" className="px-6 py-3">Ciudad</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.map((cliente) => (
              <tr key={cliente.id} className="border-b bg-white hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{cliente.nombre}</td>
                <td className="px-6 py-4">{cliente.email}</td>
                <td className="px-6 py-4">{cliente.cedula}</td>
                <td className="px-6 py-4">{cliente.telefono}</td>
                <td className="px-6 py-4">{cliente.ciudad}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientesTable;
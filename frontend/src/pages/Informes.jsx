import { useState } from 'react';
import { Download } from 'lucide-react';

const mockVentas = [
  {
    id: '#001',
    fecha: '2024-01-15',
    cliente: 'Sofía Mendoza',
    producto: 'Laptop Pro 15',
    cantidad: 1,
    precio: 1200,
    total: 1200
  },
  {
    id: '#002',
    fecha: '2024-01-16',
    cliente: 'Diego Herrera',
    producto: 'Smartphone X20',
    cantidad: 2,
    precio: 800,
    total: 1600
  },
  {
    id: '#003',
    fecha: '2024-01-17',
    cliente: 'Luciana Torres',
    producto: 'Tablet 10"',
    cantidad: 1,
    precio: 299.99,
    total: 299.99
  }
];

const InformesPage = () => {
  const [tipoInforme, setTipoInforme] = useState('fecha');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [productoBusqueda, setProductoBusqueda] = useState('');

  const clientes = [...new Set(mockVentas.map(venta => venta.cliente))];
  const productos = [...new Set(mockVentas.map(venta => venta.producto))];

  const filtrarVentas = () => {
    switch (tipoInforme) {
      case 'fecha':
        return mockVentas.filter(venta => {
          const cumpleFechaInicio = !fechaInicio || venta.fecha >= fechaInicio;
          const cumpleFechaFin = !fechaFin || venta.fecha <= fechaFin;
          return cumpleFechaInicio && cumpleFechaFin;
        });
      case 'cliente':
        return mockVentas.filter(venta =>
          venta.cliente.toLowerCase().includes(clienteBusqueda.toLowerCase())
        );
      case 'producto':
        return mockVentas.filter(venta =>
          venta.producto.toLowerCase().includes(productoBusqueda.toLowerCase())
        );
      default:
        return mockVentas;
    }
  };

  const ventasFiltradas = filtrarVentas();

  const calcularTotales = () => {
    return ventasFiltradas.reduce(
      (acc, venta) => {
        acc.cantidadTotal += venta.cantidad;
        acc.montoTotal += venta.total;
        return acc;
      },
      { cantidadTotal: 0, montoTotal: 0 }
    );
  };

  const { cantidadTotal, montoTotal } = calcularTotales();

  const generarReporte = () => {
    console.log('Generando reporte:', { tipoInforme, ventasFiltradas });
  };

  const descargarPDF = () => {
    console.log('Descargando PDF:', ventasFiltradas);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Informes</h1>
        <p className="mt-2 text-sm text-gray-600">Gestiona y genera reportes de ventas por fecha, cliente o producto</p>
      </div>

      {/* Navbar de pestañas */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['fecha', 'cliente', 'producto'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setTipoInforme(tipo)}
              className={`${tipoInforme === tipo ? 'border-black text-black' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium capitalize`}
            >
              Por {tipo}
            </button>
          ))}
        </nav>
      </div>

      {/* Filtros según el tipo de informe */}
      <div className="mb-6 space-y-4">
        {tipoInforme === 'fecha' && (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Fecha fin</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={generarReporte}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Generar reporte
            </button>
          </div>
        )}

        {tipoInforme === 'cliente' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Buscar cliente</label>
              <input
                type="text"
                className="mt-1 block w-3/4 rounded-lg border border-gray-300 px-3 py-2"
                value={clienteBusqueda}
                onChange={(e) => setClienteBusqueda(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            <button
              onClick={generarReporte}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Generar reporte
            </button>
          </div>
        )}

        {tipoInforme === 'producto' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Buscar producto</label>
              <input
                type="text"
                className="mt-1 block w-3/4 rounded-lg border border-gray-300 px-3 py-2"
                value={productoBusqueda}
                onChange={(e) => setProductoBusqueda(e.target.value)}
                placeholder="Nombre del producto"
              />
            </div>
            <button
              onClick={generarReporte}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Generar reporte
            </button>
          </div>
        )}
      </div>

      {/* Vista previa del reporte */}
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Vista previa del reporte</h3>
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">Fecha</th>
                  <th scope="col" className="px-6 py-3">Cliente</th>
                  <th scope="col" className="px-6 py-3">Producto</th>
                  <th scope="col" className="px-6 py-3">Cantidad</th>
                  <th scope="col" className="px-6 py-3">Precio</th>
                  <th scope="col" className="px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((venta) => (
                  <tr key={venta.id} className="border-b bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{venta.id}</td>
                    <td className="px-6 py-4">{venta.fecha}</td>
                    <td className="px-6 py-4">{venta.cliente}</td>
                    <td className="px-6 py-4">{venta.producto}</td>
                    <td className="px-6 py-4">{venta.cantidad}</td>
                    <td className="px-6 py-4">${venta.precio.toFixed(2)}</td>
                    <td className="px-6 py-4">${venta.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botón Descargar PDF */}
      <div className="flex justify-end">
        <button
          onClick={descargarPDF}
          className="flex items-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </button>
      </div>
    </div>
  );
};

export default InformesPage;
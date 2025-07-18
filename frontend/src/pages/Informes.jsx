import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { makeAuthenticatedRequest } from '../services/auth';

const InformesPage = () => {
  const [tipoInforme, setTipoInforme] = useState('fecha');
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [productoBusqueda, setProductoBusqueda] = useState('');

  // Cargar datos desde la API
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar ventas
      const ventasResponse = await makeAuthenticatedRequest('/ventas/');
      if (ventasResponse.ok) {
        const ventasData = await ventasResponse.json();
        const ventasFormateadas = ventasData.map(venta => {
          // Formatear fecha de manera segura
          let fechaFormateada = 'Fecha no disponible';
          try {
            if (venta.fecha) {
              const fecha = new Date(venta.fecha);
              if (!isNaN(fecha.getTime())) {
                fechaFormateada = fecha.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                });
              }
            }
          } catch (error) {
            console.warn('Error formateando fecha:', venta.fecha, error);
          }
          
          return {
            id: venta.id,
            fecha: fechaFormateada,
            cliente: venta.cliente_nombre || 'Cliente no especificado',
            total: parseFloat(venta.total),
            items: venta.items || []
          };
        });
        setVentas(ventasFormateadas);
      }
      
      // Cargar clientes
      const clientesResponse = await makeAuthenticatedRequest('/clientes/');
      if (clientesResponse.ok) {
        const clientesData = await clientesResponse.json();
        setClientes(clientesData);
      }
      
      // Cargar productos
      const productosResponse = await makeAuthenticatedRequest('/productos/');
      if (productosResponse.ok) {
        const productosData = await productosResponse.json();
        setProductos(productosData);
      }
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarVentas = () => {
    let ventasFiltradas = [];
    
    switch (tipoInforme) {
      case 'fecha':
        ventasFiltradas = ventas.filter(venta => {
          if (!fechaInicio && !fechaFin) return true;
          
          // Si la fecha no está disponible, excluir de los resultados
          if (venta.fecha === 'Fecha no disponible') return false;
          
          // Convertir la fecha de venta a formato YYYY-MM-DD para comparación
          let fechaVenta;
          try {
            // Si venta.fecha ya está en formato DD/MM/YYYY, convertirlo
            if (venta.fecha.includes('/')) {
              const [dia, mes, año] = venta.fecha.split('/');
              fechaVenta = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            } else {
              // Si ya está en formato ISO, extraer solo la fecha
              fechaVenta = venta.fecha.split('T')[0];
            }
          } catch (error) {
            console.warn('Error procesando fecha:', venta.fecha, error);
            return false;
          }
          
          const cumpleFechaInicio = !fechaInicio || fechaVenta >= fechaInicio;
          const cumpleFechaFin = !fechaFin || fechaVenta <= fechaFin;
          return cumpleFechaInicio && cumpleFechaFin;
        });
        break;
      case 'cliente':
        ventasFiltradas = ventas.filter(venta =>
          venta.cliente.toLowerCase().includes(clienteBusqueda.toLowerCase())
        );
        break;
      case 'producto':
        // Para productos, necesitamos expandir los items de cada venta
        ventasFiltradas = [];
        ventas.forEach(venta => {
          venta.items.forEach(item => {
            const producto = productos.find(p => p.id === item.producto);
            if (producto && producto.nombre.toLowerCase().includes(productoBusqueda.toLowerCase())) {
              ventasFiltradas.push({
                id: venta.id,
                fecha: venta.fecha,
                cliente: venta.cliente,
                producto: producto.nombre,
                cantidad: item.cantidad,
                precio: parseFloat(item.precio_unitario),
                total: parseFloat(item.subtotal)
              });
            }
          });
        });
        break;
      default:
        ventasFiltradas = ventas;
    }
    
    return ventasFiltradas;
  };

  const ventasFiltradas = filtrarVentas();

  const calcularTotales = () => {
    if (tipoInforme === 'producto') {
      return ventasFiltradas.reduce(
        (acc, item) => {
          acc.cantidadTotal += item.cantidad || 0;
          acc.montoTotal += item.total || 0;
          return acc;
        },
        { cantidadTotal: 0, montoTotal: 0 }
      );
    } else {
      return ventasFiltradas.reduce(
        (acc, venta) => {
          acc.cantidadTotal += 1; // Número de ventas
          acc.montoTotal += venta.total || 0;
          return acc;
        },
        { cantidadTotal: 0, montoTotal: 0 }
      );
    }
  };

  const { cantidadTotal, montoTotal } = calcularTotales();

  const generarReporte = () => {
    cargarDatos(); // Recargar datos para asegurar que estén actualizados
  };

  const descargarPDF = () => {
    // Crear contenido CSV para descarga
    let csvContent = '';
    let headers = '';
    
    if (tipoInforme === 'producto') {
      headers = 'ID Venta,Fecha,Cliente,Producto,Cantidad,Precio Unitario,Total\n';
      csvContent = ventasFiltradas.map(item => 
        `${item.id},${item.fecha},"${item.cliente}","${item.producto}",${item.cantidad},${item.precio},${item.total}`
      ).join('\n');
    } else {
      headers = 'ID,Fecha,Cliente,Total\n';
      csvContent = ventasFiltradas.map(venta => 
        `${venta.id},${venta.fecha},"${venta.cliente}",${venta.total}`
      ).join('\n');
    }
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${tipoInforme}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Resumen de totales */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="text-sm font-medium text-blue-900">
            {tipoInforme === 'producto' ? 'Cantidad Total' : 'Número de Ventas'}
          </h4>
          <p className="text-2xl font-bold text-blue-600">{cantidadTotal}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <h4 className="text-sm font-medium text-green-900">Monto Total</h4>
          <p className="text-2xl font-bold text-green-600">${montoTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Vista previa del reporte */}
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Vista previa del reporte</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando datos...</div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">ID</th>
                    <th scope="col" className="px-6 py-3">Fecha</th>
                    <th scope="col" className="px-6 py-3">Cliente</th>
                    {tipoInforme === 'producto' && (
                      <>
                        <th scope="col" className="px-6 py-3">Producto</th>
                        <th scope="col" className="px-6 py-3">Cantidad</th>
                        <th scope="col" className="px-6 py-3">Precio</th>
                      </>
                    )}
                    <th scope="col" className="px-6 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={tipoInforme === 'producto' ? 7 : 4} className="px-6 py-8 text-center text-gray-500">
                        No se encontraron resultados
                      </td>
                    </tr>
                  ) : (
                    ventasFiltradas.map((item, index) => (
                      <tr key={`${item.id}-${index}`} className="border-b bg-white hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                        <td className="px-6 py-4">{item.fecha}</td>
                        <td className="px-6 py-4">{item.cliente}</td>
                        {tipoInforme === 'producto' && (
                          <>
                            <td className="px-6 py-4">{item.producto}</td>
                            <td className="px-6 py-4">{item.cantidad}</td>
                            <td className="px-6 py-4">${item.precio?.toFixed(2) || '0.00'}</td>
                          </>
                        )}
                        <td className="px-6 py-4">${item.total?.toFixed(2) || '0.00'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Botón Descargar CSV */}
      <div className="flex justify-end">
        <button
          onClick={descargarPDF}
          disabled={ventasFiltradas.length === 0 || loading}
          className="flex items-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar CSV ({ventasFiltradas.length} registros)
        </button>
      </div>
    </div>
  );
};

export default InformesPage;
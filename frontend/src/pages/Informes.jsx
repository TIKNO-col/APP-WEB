import { useState, useEffect } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { makeAuthenticatedRequest } from '../services/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCOP } from '../utils/formatters';

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
            cliente_cedula: venta.cliente_cedula,
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
        // Expandir items para filtro por fecha sin filtro por producto
        ventasFiltradas = [];
        ventas.forEach(venta => {
          // Verificar filtro de fecha
          let cumpleFiltroFecha = true;
          if (fechaInicio || fechaFin) {
            if (venta.fecha === 'Fecha no disponible') {
              cumpleFiltroFecha = false;
            } else {
              try {
                let fechaVenta;
                if (venta.fecha.includes('/')) {
                  const [dia, mes, año] = venta.fecha.split('/');
                  fechaVenta = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                } else {
                  fechaVenta = venta.fecha.split('T')[0];
                }
                const cumpleFechaInicio = !fechaInicio || fechaVenta >= fechaInicio;
                const cumpleFechaFin = !fechaFin || fechaVenta <= fechaFin;
                cumpleFiltroFecha = cumpleFechaInicio && cumpleFechaFin;
              } catch (error) {
                cumpleFiltroFecha = false;
              }
            }
          }
          
          if (cumpleFiltroFecha && venta.items && venta.items.length > 0) {
            venta.items.forEach(item => {
              const producto = productos.find(p => p.id === item.producto_id);
              
              const subtotal = item.cantidad * parseFloat(item.precio_unitario);
              const impuesto = subtotal * 0.19; // 19% IVA Colombia
              const totalConImpuesto = subtotal + impuesto;
              ventasFiltradas.push({
                id: venta.id,
                fecha: venta.fecha,
                cliente: venta.cliente,
                producto: item.producto_nombre || (producto ? producto.nombre : 'Producto no encontrado'),
                cantidad: item.cantidad,
                precio: parseFloat(item.precio_unitario),
                subtotal: subtotal,
                impuesto: impuesto,
                total: totalConImpuesto
              });
            });
          }
        });
        break;
        
      case 'cliente':
        // Expandir items para filtro por cliente sin filtro por producto
        ventasFiltradas = [];
        ventas.forEach(venta => {
          // Verificar filtro de cliente (por nombre o por ID/cédula)
          const cumpleFiltroCliente = !clienteBusqueda || 
            venta.cliente.toLowerCase().includes(clienteBusqueda.toLowerCase()) ||
            (venta.cliente_cedula && venta.cliente_cedula.toString().includes(clienteBusqueda));
          
          if (cumpleFiltroCliente && venta.items && venta.items.length > 0) {
            venta.items.forEach(item => {
              const producto = productos.find(p => p.id === item.producto_id);
              
              const subtotal = item.cantidad * parseFloat(item.precio_unitario);
              ventasFiltradas.push({
                id: venta.id,
                fecha: venta.fecha,
                cliente: venta.cliente,
                producto: item.producto_nombre || (producto ? producto.nombre : 'Producto no encontrado'),
                cantidad: item.cantidad,
                precio: parseFloat(item.precio_unitario),
                total: subtotal
              });
            });
          }
        });
        break;
        
      case 'producto':
        // Para productos, necesitamos expandir los items de cada venta
        ventasFiltradas = [];
        ventas.forEach(venta => {
          if (venta.items && venta.items.length > 0) {
            venta.items.forEach(item => {
              // Buscar el producto por ID
              const producto = productos.find(p => p.id === item.producto_id);
              
              // Si no hay búsqueda específica o el producto coincide con la búsqueda (solo por nombre)
              if (!productoBusqueda || 
                  (producto && producto.nombre.toLowerCase().includes(productoBusqueda.toLowerCase())) ||
                  (item.producto_nombre && item.producto_nombre.toLowerCase().includes(productoBusqueda.toLowerCase()))) {
                
                // Calcular el subtotal (cantidad * precio_unitario)
                const subtotal = item.cantidad * parseFloat(item.precio_unitario);
                const impuesto = subtotal * 0.19; // 19% IVA Colombia
                const totalConImpuesto = subtotal + impuesto;
                
                ventasFiltradas.push({
                  id: venta.id,
                  fecha: venta.fecha,
                  cliente: venta.cliente,
                  producto: item.producto_nombre || (producto ? producto.nombre : 'Producto no encontrado'),
                  cantidad: item.cantidad,
                  precio: parseFloat(item.precio_unitario),
                  subtotal: subtotal,
                  impuesto: impuesto,
                  total: totalConImpuesto
                });
              }
            });
          }
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
      // Para reporte por producto, contar número de items (no sumar cantidades)
      const montoTotal = ventasFiltradas.reduce((acc, item) => acc + (item.total || 0), 0);
      return {
        cantidadTotal: ventasFiltradas.length,
        montoTotal: montoTotal
      };
    } else {
      // Para reportes por fecha y cliente, contar ventas únicas
      const ventasUnicas = new Set(ventasFiltradas.map(item => item.id));
      const montoTotal = ventasFiltradas.reduce((acc, item) => acc + (item.total || 0), 0);
      return {
        cantidadTotal: ventasUnicas.size,
        montoTotal: montoTotal
      };
    }
  };

  const { cantidadTotal, montoTotal } = calcularTotales();

  const generarReporte = () => {
    cargarDatos(); // Recargar datos para asegurar que estén actualizados
  };

  const descargarPDF = () => {
    try {
      console.log('Iniciando generación de PDF...');
      const doc = new jsPDF();
      const { cantidadTotal, montoTotal } = calcularTotales();
      
      console.log('Datos calculados:', { cantidadTotal, montoTotal, ventasFiltradas: ventasFiltradas.length });
      
      // Configurar el título del documento
      const titulo = `Reporte por ${tipoInforme.charAt(0).toUpperCase() + tipoInforme.slice(1)}`;
      doc.setFontSize(18);
      doc.text(titulo, 14, 22);
      
      // Agregar fecha de generación
      doc.setFontSize(11);
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, 32);
      
      // Agregar resumen
      const tipoConteo = tipoInforme === 'producto' ? 'Número de Items' : 'Número de Ventas';
      doc.text(`${tipoConteo}: ${cantidadTotal}`, 14, 42);
      doc.text(`Monto Total: ${formatCOP(montoTotal)}`, 14, 52);
      
      // Verificar si hay datos para la tabla
      if (ventasFiltradas.length === 0) {
        doc.text('No hay datos para mostrar', 14, 70);
        doc.save(`reporte_${tipoInforme}_${new Date().toISOString().split('T')[0]}.pdf`);
        return;
      }
      
      // Configurar las columnas de la tabla
      const columns = [
        { header: 'ID', dataKey: 'id' },
        { header: 'Fecha', dataKey: 'fecha' },
        { header: 'Cliente', dataKey: 'cliente' },
        { header: 'Producto', dataKey: 'producto' },
        { header: 'Cantidad', dataKey: 'cantidad' },
        { header: 'Precio', dataKey: 'precio' },
        { header: 'Subtotal', dataKey: 'subtotal' },
        { header: 'IVA (19%)', dataKey: 'impuesto' },
        { header: 'Total', dataKey: 'total' }
      ];
      
      // Preparar los datos para la tabla
      const data = ventasFiltradas.map(item => ({
        id: item.id || '',
        fecha: item.fecha || '',
        cliente: item.cliente || '',
        producto: item.producto || '',
        cantidad: item.cantidad || 0,
        precio: formatCOP(item.precio),
        subtotal: formatCOP(item.subtotal),
        impuesto: formatCOP(item.impuesto),
        total: formatCOP(item.total)
      }));
      
      console.log('Datos preparados para la tabla:', data.slice(0, 2)); // Mostrar solo los primeros 2 para debug
      
      // Generar la tabla
       autoTable(doc, {
         columns: columns,
         body: data,
         startY: 60,
         styles: {
           fontSize: 8,
           cellPadding: 3
         },
         headStyles: {
           fillColor: [71, 85, 105], // Color gris oscuro
           textColor: 255,
           fontStyle: 'bold'
         },
         alternateRowStyles: {
           fillColor: [249, 250, 251] // Color gris claro alternado
         },
         margin: { top: 60 }
       });
      
      console.log('PDF generado exitosamente');
      
      // Descargar el PDF
      doc.save(`reporte_${tipoInforme}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, revisa la consola para más detalles.');
    }
  };

  const eliminarVenta = async (ventaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(`/ventas/${ventaId}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Recargar los datos después de eliminar
        await cargarDatos();
        alert('Venta eliminada exitosamente');
      } else {
        // Obtener el mensaje de error específico del servidor
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Error ${response.status}: ${response.statusText}`;
        
        if (response.status === 403) {
          alert('No tienes permisos para eliminar ventas. Solo los administradores y staff pueden realizar esta acción.');
        } else {
          alert(`Error al eliminar la venta: ${errorMessage}`);
        }
        
        console.error('Error response:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      alert('Error de conexión al eliminar la venta. Por favor, verifica tu conexión e inténtalo de nuevo.');
    }
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
                placeholder="Nombre del cliente o cédula/ID"
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
            {tipoInforme === 'producto' ? 'Número de Items' : 'Número de Ventas'}
          </h4>
          <p className="text-2xl font-bold text-blue-600">{cantidadTotal}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <h4 className="text-sm font-medium text-green-900">Monto Total</h4>
          <p className="text-2xl font-bold text-green-600">{formatCOP(montoTotal)}</p>
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
                    <th scope="col" className="px-6 py-3">Producto</th>
                    <th scope="col" className="px-6 py-3">Cantidad</th>
                    <th scope="col" className="px-6 py-3">Precio</th>
                    <th scope="col" className="px-6 py-3">Subtotal</th>
                    <th scope="col" className="px-6 py-3">IVA (19%)</th>
                    <th scope="col" className="px-6 py-3">Total</th>
                    <th scope="col" className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                        No se encontraron resultados
                      </td>
                    </tr>
                  ) : (
                    ventasFiltradas.map((item, index) => (
                      <tr key={item.id || `venta-${index}`} className="border-b bg-white hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                        <td className="px-6 py-4">{item.fecha}</td>
                        <td className="px-6 py-4">{item.cliente}</td>
                        <td className="px-6 py-4">{item.producto}</td>
                        <td className="px-6 py-4">{item.cantidad}</td>
                        <td className="px-6 py-4">{formatCOP(item.precio)}</td>
                        <td className="px-6 py-4">{formatCOP(item.subtotal)}</td>
                        <td className="px-6 py-4">{formatCOP(item.impuesto)}</td>
                        <td className="px-6 py-4">{formatCOP(item.total)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => eliminarVenta(item.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Eliminar venta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Botón Descargar PDF */}
      <div className="flex justify-end">
        <button
          onClick={descargarPDF}
          disabled={ventasFiltradas.length === 0 || loading}
          className="flex items-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF ({ventasFiltradas.length} registros)
        </button>
      </div>
    </div>
  );
};

export default InformesPage;
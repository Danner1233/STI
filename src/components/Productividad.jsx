import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Clock, Calendar, Filter, Trash2 } from 'lucide-react';

const Productividad = ({ 
  productividad, 
  onActualizarEstado, 
  onActualizarRR,
  onEliminarOT
}) => {
  
  const [filtroFecha, setFiltroFecha] = useState('todos'); // 'todos', 'hoy', 'ayer', 'semana', 'mes', 'personalizado'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // ========== FUNCIÓN DE FILTRADO ==========
  const obtenerProductividadFiltrada = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    switch (filtroFecha) {
      case 'hoy': {
        return productividad.filter(ot => {
          const fechaOT = new Date(ot.fechaEnvio);
          fechaOT.setHours(0, 0, 0, 0);
          return fechaOT.getTime() === hoy.getTime();
        });
      }

      case 'ayer': {
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        return productividad.filter(ot => {
          const fechaOT = new Date(ot.fechaEnvio);
          fechaOT.setHours(0, 0, 0, 0);
          return fechaOT.getTime() === ayer.getTime();
        });
      }

      case 'semana': {
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
        return productividad.filter(ot => new Date(ot.fechaEnvio) >= inicioSemana);
      }

      case 'mes': {
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        return productividad.filter(ot => new Date(ot.fechaEnvio) >= inicioMes);
      }

      case 'personalizado': {
        if (!fechaInicio || !fechaFin) return productividad;
        
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);

        return productividad.filter(ot => {
          const fechaOT = new Date(ot.fechaEnvio);
          return fechaOT >= inicio && fechaOT <= fin;
        });
      }

      default:
        return productividad;
    }
  };

  const productividadFiltrada = obtenerProductividadFiltrada();

  // ========== FUNCIÓN DE EXPORTACIÓN (INTERNA) ==========
  const exportarExcel = () => {
    const datosAExportar = productividadFiltrada; // Usar datos filtrados

    if (datosAExportar.length === 0) {
      alert('⚠️ No hay datos para exportar con los filtros actuales');
      return;
    }

    const quitarTildes = (str) => {
      if (!str) return "";
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\u0020-\u007E]/g, "");
    };

    // Separar OTs por estado
    const completadas = datosAExportar.filter(ot => 
      ot.estado === "Enviado" || ot.estado === "Completado"
    );
    
    const pendientes = datosAExportar.filter(ot => 
      ot.estado === "Pendiente"
    );
    
    const canceladas = datosAExportar.filter(ot => 
      ot.estado === "Cancelado"
    );

    // Función para formatear datos
    const formatearOT = (ot) => ({
      "Numero OT": quitarTildes(ot.numeroOT || ""),
      "RR": quitarTildes(ot.rr || ""),
      "Cliente": quitarTildes(ot.cliente || ""),
      "Ciudad": quitarTildes(ot.ciudad || ""),
      "Direccion": quitarTildes(ot.direccion || ""),
      "Fecha Agendada": ot.fecha || "",
      "Fecha Envio": new Date(ot.fechaEnvio).toLocaleDateString("es-CO"),
      "Estado": quitarTildes(ot.estado || ""),
      "Tipo Servicio": quitarTildes(ot.tipoServicio || ""),
      "Consensus": ot.consensus ? "SI" : "NO",
    });

    // Ordenar pendientes por fecha agendada (más cercanas primero = mayor prioridad)
    const pendientesOrdenadas = [...pendientes].sort((a, b) => {
      const fechaA = new Date(a.fecha || "9999-12-31");
      const fechaB = new Date(b.fecha || "9999-12-31");
      return fechaA - fechaB;
    });

    // Ordenar completadas por fecha de envío (más recientes primero)
    const completadasOrdenadas = [...completadas].sort((a, b) => {
      const fechaA = new Date(a.fechaEnvio);
      const fechaB = new Date(b.fechaEnvio);
      return fechaB - fechaA;
    });

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // HOJA 1: Pendientes (con prioridad)
    if (pendientesOrdenadas.length > 0) {
      const datosPendientes = pendientesOrdenadas.map((ot, index) => ({
        "Prioridad": index + 1,
        ...formatearOT(ot),
        "Dias Restantes": (() => {
          if (!ot.fecha) return "Sin fecha";
          const hoy = new Date();
          const fechaAgendada = new Date(ot.fecha);
          const diffTime = fechaAgendada - hoy;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) return `ATRASADO (${Math.abs(diffDays)} días)`;
          if (diffDays === 0) return "HOY";
          if (diffDays === 1) return "MAÑANA";
          return `${diffDays} días`;
        })(),
      }));

      const ws1 = XLSX.utils.json_to_sheet(datosPendientes);
      
      ws1['!cols'] = [
        { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 30 },
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 20 },
      ];

      const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1'];
      headerCells.forEach(cell => {
        if (ws1[cell]) {
          ws1[cell].s = {
            fill: { fgColor: { rgb: "FFC000" } },
            font: { color: { rgb: "000000" }, bold: true },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      });

      XLSX.utils.book_append_sheet(wb, ws1, "⏰ Pendientes");
    }

    // HOJA 2: Completadas
    if (completadasOrdenadas.length > 0) {
      const datosCompletadas = completadasOrdenadas.map(formatearOT);
      const ws2 = XLSX.utils.json_to_sheet(datosCompletadas);
      
      ws2['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 30 },
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 12 },
      ];

      const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1'];
      headerCells.forEach(cell => {
        if (ws2[cell]) {
          ws2[cell].s = {
            fill: { fgColor: { rgb: "70AD47" } },
            font: { color: { rgb: "FFFFFF" }, bold: true },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      });

      XLSX.utils.book_append_sheet(wb, ws2, "✅ Completadas");
    }

    // HOJA 3: Canceladas
    if (canceladas.length > 0) {
      const datosCanceladas = canceladas.map(formatearOT);
      const ws3 = XLSX.utils.json_to_sheet(datosCanceladas);
      
      ws3['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 30 },
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 12 },
      ];

      const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1'];
      headerCells.forEach(cell => {
        if (ws3[cell]) {
          ws3[cell].s = {
            fill: { fgColor: { rgb: "E30613" } },
            font: { color: { rgb: "FFFFFF" }, bold: true },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      });

      XLSX.utils.book_append_sheet(wb, ws3, "❌ Canceladas");
    }

    // HOJA 4: Todas
    const todasOrdenadas = [...productividad].sort((a, b) => {
      const fechaA = new Date(a.fechaEnvio);
      const fechaB = new Date(b.fechaEnvio);
      return fechaB - fechaA;
    });

    const datosTodas = todasOrdenadas.map(formatearOT);
    const ws4 = XLSX.utils.json_to_sheet(datosTodas);
    
    ws4['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 30 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 12 },
    ];

    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1'];
    headerCells.forEach(cell => {
      if (ws4[cell]) {
        ws4[cell].s = {
          fill: { fgColor: { rgb: "4472C4" } },
          font: { color: { rgb: "FFFFFF" }, bold: true },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    });

    XLSX.utils.book_append_sheet(wb, ws4, "📊 Todas");

    // HOJA 5: Estadísticas
    const calcularEstadisticas = () => {
      const hoy = new Date().toDateString();
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      return {
        hoyCount: datosAExportar.filter(ot => new Date(ot.fechaEnvio).toDateString() === hoy).length,
        semanaCount: datosAExportar.filter(ot => new Date(ot.fechaEnvio) >= inicioSemana).length,
        mesCount: datosAExportar.filter(ot => new Date(ot.fechaEnvio) >= inicioMes).length,
      };
    };

    const stats = calcularEstadisticas();
    const datosEstadisticas = [
      { "Indicador": "Enviadas Hoy", "Cantidad": stats.hoyCount },
      { "Indicador": "Enviadas Esta Semana", "Cantidad": stats.semanaCount },
      { "Indicador": "Enviadas Este Mes", "Cantidad": stats.mesCount },
      { "Indicador": "", "Cantidad": "" },
      { "Indicador": "Total Pendientes", "Cantidad": pendientes.length },
      { "Indicador": "Total Completadas", "Cantidad": completadas.length },
      { "Indicador": "Total Canceladas", "Cantidad": canceladas.length },
      { "Indicador": "TOTAL REGISTROS", "Cantidad": datosAExportar.length },
    ];

    const ws5 = XLSX.utils.json_to_sheet(datosEstadisticas);
    ws5['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws5, "📈 Estadísticas");

    // HOJA 6: Resumen por Cliente
    const resumenClientes = {};
    datosAExportar.forEach((ot) => {
      const cliente = quitarTildes(ot.cliente || "Sin cliente");
      if (!resumenClientes[cliente]) {
        resumenClientes[cliente] = { total: 0, pendientes: 0, completadas: 0 };
      }
      resumenClientes[cliente].total++;
      if (ot.estado === "Pendiente") resumenClientes[cliente].pendientes++;
      if (ot.estado === "Enviado" || ot.estado === "Completado") resumenClientes[cliente].completadas++;
    });

    const datosClientes = Object.entries(resumenClientes).map(([cliente, datos]) => ({
      "Cliente": cliente,
      "Total OTs": datos.total,
      "Completadas": datos.completadas,
      "Pendientes": datos.pendientes,
    }));

    const ws6 = XLSX.utils.json_to_sheet(datosClientes);
    ws6['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws6, "👥 Por Cliente");

    // Guardar archivo con nombre descriptivo según filtro
    const fecha = new Date().toISOString().split("T")[0];
    let nombreArchivo = `Productividad_OT_${fecha}`;
    
    if (filtroFecha === 'hoy') {
      nombreArchivo = `Productividad_HOY_${fecha}`;
    } else if (filtroFecha === 'ayer') {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      nombreArchivo = `Productividad_AYER_${ayer.toISOString().split("T")[0]}`;
    } else if (filtroFecha === 'semana') {
      nombreArchivo = `Productividad_SEMANA_${fecha}`;
    } else if (filtroFecha === 'mes') {
      nombreArchivo = `Productividad_MES_${fecha}`;
    } else if (filtroFecha === 'personalizado' && fechaInicio && fechaFin) {
      nombreArchivo = `Productividad_${fechaInicio}_a_${fechaFin}`;
    }
    
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          📊 Productividad
        </h2>
        <button
          onClick={exportarExcel}
          disabled={productividadFiltrada.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
        >
          <Download size={16} />
          Exportar Excel
          {productividadFiltrada.length !== productividad.length && (
            <span className="bg-white text-green-700 px-2 py-0.5 rounded-full text-xs">
              {productividadFiltrada.length}
            </span>
          )}
        </button>
      </div>

      {/* Filtros de Fecha */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-700">Filtrar por fecha</h3>
        </div>

        {/* Botones de filtro rápido */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setFiltroFecha('todos')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filtroFecha === 'todos'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-blue-100'
            }`}
          >
            Todos ({productividad.length})
          </button>
          <button
            onClick={() => setFiltroFecha('hoy')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filtroFecha === 'hoy'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-blue-100'
            }`}
          >
            📅 Hoy
          </button>
          <button
            onClick={() => setFiltroFecha('ayer')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filtroFecha === 'ayer'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-blue-100'
            }`}
          >
            📆 Ayer
          </button>
          <button
            onClick={() => setFiltroFecha('semana')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filtroFecha === 'semana'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-blue-100'
            }`}
          >
            📊 Esta Semana
          </button>
          <button
            onClick={() => setFiltroFecha('mes')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filtroFecha === 'mes'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-blue-100'
            }`}
          >
            📈 Este Mes
          </button>
          <button
            onClick={() => setFiltroFecha('personalizado')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filtroFecha === 'personalizado'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-blue-100'
            }`}
          >
            🗓️ Rango Personalizado
          </button>
        </div>

        {/* Selector de rango personalizado */}
        {filtroFecha === 'personalizado' && (
          <div className="flex gap-3 items-center bg-white p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Desde:</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-gray-500">→</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Hasta:</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Indicador de resultados */}
        <div className="mt-3 text-sm">
          {filtroFecha !== 'todos' && (
            <div className="flex items-center gap-2 text-blue-700">
              <span className="font-semibold">
                📋 Mostrando: {productividadFiltrada.length} de {productividad.length} registros
              </span>
              {productividadFiltrada.length === 0 && (
                <span className="text-red-600 font-medium">
                  ⚠️ No hay registros en este período
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {productividadFiltrada.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {filtroFecha === 'todos' 
              ? 'No hay registros aun' 
              : '📭 No hay registros para el período seleccionado'
            }
          </p>
        ) : (
          <div className="space-y-2">
            {productividadFiltrada.slice(0, 20).map((ot) => (
              <div
                key={ot.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-800">
                        OT {ot.numeroOT}
                      </p>
                      {ot.consensus && (
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">
                          ✅ Consensus
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      {ot.cliente} - {ot.ciudad}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      <Clock size={12} className="inline mr-1" />
                      {new Date(ot.fechaEnvio).toLocaleString("es-CO")}
                    </p>
                    
                    {/* Input para RR */}
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Número RR (opcional)"
                        value={ot.rr || ""}
                        onChange={(e) => onActualizarRR(ot.id, e.target.value)}
                        className="w-48 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Mostrar destinatarios en copia si existen */}
                    {ot.copiaCC && ot.copiaCC.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-gray-500">CC:</span>
                        {ot.copiaCC.map((contacto, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
                            title={contacto.email}
                          >
                            {contacto.nombre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Controles: Estado y Eliminar */}
                  <div className="flex flex-col gap-2">
                    {/* Dropdown para cambiar estado */}
                    <select
                      value={ot.estado}
                      onChange={(e) => onActualizarEstado(ot.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded border-2 cursor-pointer ${
                        ot.estado === "Enviado" ? "bg-green-100 text-green-800 border-green-300" :
                        ot.estado === "Pendiente" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                        "bg-red-100 text-red-800 border-red-300"
                      }`}
                    >
                      <option value="Enviado">✓ Enviado</option>
                      <option value="Pendiente">⏰ Pendiente</option>
                      <option value="Cancelado">✗ Cancelado</option>
                    </select>
                    
                    {/* Botón Eliminar */}
                    {onEliminarOT && (
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar OT ${ot.numeroOT}?\n\nEsta acción no se puede deshacer.`)) {
                            onEliminarOT(ot.id);
                          }
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 hover:border-red-300 rounded text-xs font-semibold transition"
                        title="Eliminar OT"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {productividadFiltrada.length > 20 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Mostrando 20 de {productividadFiltrada.length} registros
          {filtroFecha !== 'todos' && ` (filtrados de ${productividad.length} totales)`}
        </p>
      )}
    </div>
  );
};

export default Productividad;
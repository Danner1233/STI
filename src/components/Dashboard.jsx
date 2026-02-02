import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Clock, FileText, Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const Dashboard = ({ productividad }) => {
  const [rangoFecha, setRangoFecha] = useState('mes'); // hoy, semana, mes, personalizado
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // ========== CALCULAR MÉTRICAS ==========
  const metricas = useMemo(() => {
    const ahora = new Date();
    let ots = [...productividad];

    // Filtrar por rango de fecha
    if (rangoFecha === 'hoy') {
      ots = ots.filter(ot => {
        const fecha = new Date(ot.fechaEnvio);
        return fecha.toDateString() === ahora.toDateString();
      });
    } else if (rangoFecha === 'semana') {
      const inicioSemana = new Date(ahora);
      inicioSemana.setDate(ahora.getDate() - ahora.getDay());
      inicioSemana.setHours(0, 0, 0, 0);
      ots = ots.filter(ot => new Date(ot.fechaEnvio) >= inicioSemana);
    } else if (rangoFecha === 'mes') {
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      ots = ots.filter(ot => new Date(ot.fechaEnvio) >= inicioMes);
    } else if (rangoFecha === 'personalizado' && fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59);
      ots = ots.filter(ot => {
        const fecha = new Date(ot.fechaEnvio);
        return fecha >= inicio && fecha <= fin;
      });
    }

    // Métricas básicas
    const totalOTs = ots.length;
    const otsEnviadas = ots.filter(ot => ot.estado === 'Enviado').length;
    const otsPendientes = ots.filter(ot => ot.estado === 'Pendiente').length;
    const clientesUnicos = [...new Set(ots.map(ot => ot.cliente))].length;

    // OTs por cliente
    const otsPorCliente = {};
    ots.forEach(ot => {
      otsPorCliente[ot.cliente] = (otsPorCliente[ot.cliente] || 0) + 1;
    });
    const topClientes = Object.entries(otsPorCliente)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cliente, cantidad]) => ({ cliente, cantidad }));

    // OTs por ciudad
    const otsPorCiudad = {};
    ots.forEach(ot => {
      const ciudad = ot.ciudad || 'Sin ciudad';
      otsPorCiudad[ciudad] = (otsPorCiudad[ciudad] || 0) + 1;
    });
    const topCiudades = Object.entries(otsPorCiudad)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ciudad, cantidad]) => ({ ciudad, cantidad }));

    // OTs por tipo de servicio
    const otsPorServicio = {};
    ots.forEach(ot => {
      const servicio = ot.tipoServicio || 'Sin especificar';
      otsPorServicio[servicio] = (otsPorServicio[servicio] || 0) + 1;
    });

    // OTs por día (últimos 7 días)
    const otsPorDia = {};
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(ahora);
      dia.setDate(ahora.getDate() - i);
      const diaStr = dia.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      otsPorDia[diaStr] = 0;
    }
    ots.forEach(ot => {
      const fecha = new Date(ot.fechaEnvio);
      const diaStr = fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      if (otsPorDia.hasOwnProperty(diaStr)) {
        otsPorDia[diaStr]++;
      }
    });

    // PDTs generados
    const pdtsGenerados = ots.filter(ot => ot.generarPDT === true).length;
    const pdtsNoGenerados = ots.filter(ot => ot.generarPDT === false).length;

    // Consensos
    const conConsensus = ots.filter(ot => ot.consensus === true).length;
    const sinConsensus = ots.filter(ot => ot.consensus === false).length;

    return {
      totalOTs,
      otsEnviadas,
      otsPendientes,
      clientesUnicos,
      topClientes,
      topCiudades,
      otsPorServicio,
      otsPorDia,
      pdtsGenerados,
      pdtsNoGenerados,
      conConsensus,
      sinConsensus,
      tasaExito: totalOTs > 0 ? ((otsEnviadas / totalOTs) * 100).toFixed(1) : 0,
    };
  }, [productividad, rangoFecha, fechaInicio, fechaFin]);

  // ========== EXPORTAR REPORTE ==========
  const exportarReporte = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen
    const resumen = [
      ['REPORTE DE PRODUCTIVIDAD - SISTEMA STI'],
      [''],
      ['Período:', getNombreRango()],
      ['Fecha generación:', new Date().toLocaleString('es-CO')],
      [''],
      ['MÉTRICAS GENERALES'],
      ['Total OTs:', metricas.totalOTs],
      ['OTs Enviadas:', metricas.otsEnviadas],
      ['OTs Pendientes:', metricas.otsPendientes],
      ['Clientes Únicos:', metricas.clientesUnicos],
      ['Tasa de Éxito:', `${metricas.tasaExito}%`],
      [''],
      ['PDT'],
      ['PDTs Generados:', metricas.pdtsGenerados],
      ['Sin PDT:', metricas.pdtsNoGenerados],
      [''],
      ['CONSENSUS'],
      ['Con Consensus:', metricas.conConsensus],
      ['Sin Consensus:', metricas.sinConsensus],
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Hoja 2: Top Clientes
    const clientesData = [
      ['Top 5 Clientes'],
      ['Cliente', 'Cantidad de OTs'],
      ...metricas.topClientes.map(c => [c.cliente, c.cantidad])
    ];
    const wsClientes = XLSX.utils.aoa_to_sheet(clientesData);
    XLSX.utils.book_append_sheet(wb, wsClientes, 'Top Clientes');

    // Hoja 3: Top Ciudades
    const ciudadesData = [
      ['Top 5 Ciudades'],
      ['Ciudad', 'Cantidad de OTs'],
      ...metricas.topCiudades.map(c => [c.ciudad, c.cantidad])
    ];
    const wsCiudades = XLSX.utils.aoa_to_sheet(ciudadesData);
    XLSX.utils.book_append_sheet(wb, wsCiudades, 'Top Ciudades');

    // Generar archivo
    XLSX.writeFile(wb, `Reporte_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getNombreRango = () => {
    if (rangoFecha === 'hoy') return 'Hoy';
    if (rangoFecha === 'semana') return 'Esta semana';
    if (rangoFecha === 'mes') return 'Este mes';
    if (rangoFecha === 'personalizado') return `${fechaInicio} a ${fechaFin}`;
    return 'Todos';
  };

  return (
    <div className="space-y-6">
      {/* Selector de Rango */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Período de Análisis</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setRangoFecha('hoy')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              rangoFecha === 'hoy'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setRangoFecha('semana')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              rangoFecha === 'semana'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setRangoFecha('mes')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              rangoFecha === 'mes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setRangoFecha('personalizado')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              rangoFecha === 'personalizado'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Personalizado
          </button>

          {rangoFecha === 'personalizado' && (
            <>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </>
          )}

          <button
            onClick={exportarReporte}
            className="ml-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            📥 Exportar Reporte
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total OTs */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FileText size={32} />
            <span className="text-3xl font-bold">{metricas.totalOTs}</span>
          </div>
          <h3 className="text-sm font-semibold opacity-90">Total OTs</h3>
          <p className="text-xs opacity-75 mt-1">{getNombreRango()}</p>
        </div>

        {/* OTs Enviadas */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={32} />
            <span className="text-3xl font-bold">{metricas.otsEnviadas}</span>
          </div>
          <h3 className="text-sm font-semibold opacity-90">OTs Enviadas</h3>
          <p className="text-xs opacity-75 mt-1">Tasa: {metricas.tasaExito}%</p>
        </div>

        {/* OTs Pendientes */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock size={32} />
            <span className="text-3xl font-bold">{metricas.otsPendientes}</span>
          </div>
          <h3 className="text-sm font-semibold opacity-90">OTs Pendientes</h3>
          <p className="text-xs opacity-75 mt-1">Por agendar</p>
        </div>

        {/* Clientes Únicos */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users size={32} />
            <span className="text-3xl font-bold">{metricas.clientesUnicos}</span>
          </div>
          <h3 className="text-sm font-semibold opacity-90">Clientes Únicos</h3>
          <p className="text-xs opacity-75 mt-1">Atendidos</p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Clientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Top 5 Clientes
          </h3>
          <div className="space-y-3">
            {metricas.topClientes.map((item, index) => {
              const maxValue = metricas.topClientes[0]?.cantidad || 1;
              const percentage = (item.cantidad / maxValue) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700">{item.cliente}</span>
                    <span className="text-sm font-bold text-blue-600">{item.cantidad}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Ciudades */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Top 5 Ciudades
          </h3>
          <div className="space-y-3">
            {metricas.topCiudades.map((item, index) => {
              const maxValue = metricas.topCiudades[0]?.cantidad || 1;
              const percentage = (item.cantidad / maxValue) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700">{item.ciudad}</span>
                    <span className="text-sm font-bold text-orange-600">{item.cantidad}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* OTs por Día */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          OTs por Día (Últimos 7 días)
        </h3>
        <div className="flex items-end justify-between gap-2 h-64">
          {Object.entries(metricas.otsPorDia).map(([dia, cantidad], index) => {
            const maxValue = Math.max(...Object.values(metricas.otsPorDia));
            const height = maxValue > 0 ? (cantidad / maxValue) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-full">
                  <span className="text-xs font-bold text-blue-600 mb-1">{cantidad}</span>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-700"
                    style={{ height: `${height}%`, minHeight: cantidad > 0 ? '20px' : '0' }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600">{dia}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PDT y Consensus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PDT */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 PDTs</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">PDTs Generados</span>
              <span className="text-2xl font-bold text-green-600">{metricas.pdtsGenerados}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{
                  width: `${
                    metricas.pdtsGenerados + metricas.pdtsNoGenerados > 0
                      ? (metricas.pdtsGenerados / (metricas.pdtsGenerados + metricas.pdtsNoGenerados)) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Sin PDT</span>
              <span className="text-2xl font-bold text-gray-600">{metricas.pdtsNoGenerados}</span>
            </div>
          </div>
        </div>

        {/* Consensus */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📌 Consensus</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Con Consensus</span>
              <span className="text-2xl font-bold text-blue-600">{metricas.conConsensus}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{
                  width: `${
                    metricas.conConsensus + metricas.sinConsensus > 0
                      ? (metricas.conConsensus / (metricas.conConsensus + metricas.sinConsensus)) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Sin Consensus</span>
              <span className="text-2xl font-bold text-gray-600">{metricas.sinConsensus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
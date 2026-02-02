import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Clock, Send, Settings, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const ReportesAutomaticos = ({ productividad, zohoConfig, onClose }) => {
  const [configuracion, setConfiguracion] = useState(() => {
    const saved = localStorage.getItem('reportes-automaticos-config');
    return saved
      ? JSON.parse(saved)
      : {
          activo: false,
          frecuencia: 'semanal', // diario, semanal, mensual
          dia: 'lunes', // Para semanal
          diaDelMes: 1, // Para mensual
          hora: '08:00',
          correoDestino: '',
          incluirGraficas: true,
          incluirTopClientes: true,
          incluirTopCiudades: true,
        };
  });

  const [ultimoEnvio, setUltimoEnvio] = useState(() => {
    const saved = localStorage.getItem('ultimo-envio-reporte');
    return saved ? new Date(saved) : null;
  });

  const [enviando, setEnviando] = useState(false);

  // Guardar configuración
  useEffect(() => {
    localStorage.setItem('reportes-automaticos-config', JSON.stringify(configuracion));
  }, [configuracion]);

  // ========== GENERAR REPORTE HTML ==========
  const generarReporteHTML = (rango = 'semanal') => {
    const ahora = new Date();
    let inicio, fin;

    if (rango === 'diario') {
      inicio = new Date(ahora);
      inicio.setHours(0, 0, 0, 0);
      fin = new Date(ahora);
      fin.setHours(23, 59, 59, 999);
    } else if (rango === 'semanal') {
      inicio = new Date(ahora);
      inicio.setDate(ahora.getDate() - ahora.getDay());
      inicio.setHours(0, 0, 0, 0);
      fin = new Date(ahora);
      fin.setHours(23, 59, 59, 999);
    } else if (rango === 'mensual') {
      inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    }

    // Filtrar OTs por rango
    const otsRango = productividad.filter((ot) => {
      const fecha = new Date(ot.fechaEnvio);
      return fecha >= inicio && fecha <= fin;
    });

    // Calcular métricas
    const totalOTs = otsRango.length;
    const otsEnviadas = otsRango.filter((ot) => ot.estado === 'Enviado').length;
    const otsPendientes = otsRango.filter((ot) => ot.estado === 'Pendiente').length;
    const clientesUnicos = [...new Set(otsRango.map((ot) => ot.cliente))].length;
    const tasaExito = totalOTs > 0 ? ((otsEnviadas / totalOTs) * 100).toFixed(1) : 0;

    // Top 5 Clientes
    const otsPorCliente = {};
    otsRango.forEach((ot) => {
      otsPorCliente[ot.cliente] = (otsPorCliente[ot.cliente] || 0) + 1;
    });
    const topClientes = Object.entries(otsPorCliente)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Top 5 Ciudades
    const otsPorCiudad = {};
    otsRango.forEach((ot) => {
      const ciudad = ot.ciudad || 'Sin ciudad';
      otsPorCiudad[ciudad] = (otsPorCiudad[ciudad] || 0) + 1;
    });
    const topCiudades = Object.entries(otsPorCiudad)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // PDT y Consensus
    const pdtsGenerados = otsRango.filter((ot) => ot.generarPDT === true).length;
    const conConsensus = otsRango.filter((ot) => ot.consensus === true).length;

    // Generar HTML
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📊 REPORTE ${rango.toUpperCase()}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Agendamiento STI</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">
            Período: ${inicio.toLocaleDateString('es-CO')} - ${fin.toLocaleDateString('es-CO')}
          </p>
        </div>

        <!-- Métricas Principales -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 5px;">${totalOTs}</div>
            <div style="color: #666; font-size: 14px;">Total OTs</div>
          </div>
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; color: #10b981; margin-bottom: 5px;">${otsEnviadas}</div>
            <div style="color: #666; font-size: 14px;">OTs Enviadas</div>
          </div>
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; color: #f97316; margin-bottom: 5px;">${otsPendientes}</div>
            <div style="color: #666; font-size: 14px;">OTs Pendientes</div>
          </div>
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; color: #8b5cf6; margin-bottom: 5px;">${clientesUnicos}</div>
            <div style="color: #666; font-size: 14px;">Clientes Únicos</div>
          </div>
        </div>

        <!-- Tasa de Éxito -->
        <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 15px 0; color: #333;">📈 Tasa de Éxito</h3>
          <div style="background: #e5e7eb; height: 30px; border-radius: 15px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); height: 100%; width: ${tasaExito}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
              ${tasaExito}%
            </div>
          </div>
        </div>

        ${
          configuracion.incluirTopClientes
            ? `
        <!-- Top 5 Clientes -->
        <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 15px 0; color: #333;">🏆 Top 5 Clientes</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Cliente</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">OTs</th>
              </tr>
            </thead>
            <tbody>
              ${topClientes
                .map(
                  ([cliente, cantidad], index) => `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 12px;">
                    <span style="display: inline-block; background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; margin-right: 10px;">${index + 1}</span>
                    <strong>${cliente}</strong>
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <span style="background: #dbeafe; color: #2563eb; padding: 4px 12px; border-radius: 12px; font-weight: bold;">${cantidad}</span>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
        `
            : ''
        }

        ${
          configuracion.incluirTopCiudades
            ? `
        <!-- Top 5 Ciudades -->
        <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 15px 0; color: #333;">📍 Top 5 Ciudades</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Ciudad</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">OTs</th>
              </tr>
            </thead>
            <tbody>
              ${topCiudades
                .map(
                  ([ciudad, cantidad], index) => `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 12px;">
                    <span style="display: inline-block; background: #f97316; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; margin-right: 10px;">${index + 1}</span>
                    <strong>${ciudad}</strong>
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <span style="background: #fed7aa; color: #f97316; padding: 4px 12px; border-radius: 12px; font-weight: bold;">${cantidad}</span>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
        `
            : ''
        }

        <!-- PDT y Consensus -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="margin: 0 0 10px 0; color: #333;">📋 PDTs</h4>
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">${pdtsGenerados}</div>
            <div style="color: #666; font-size: 14px;">PDTs Generados</div>
          </div>
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="margin: 0 0 10px 0; color: #333;">📌 Consensus</h4>
            <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${conConsensus}</div>
            <div style="color: #666; font-size: 14px;">Con Consensus</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #374151; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">
            Generado automáticamente por Sistema STI
          </p>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.7;">
            ${new Date().toLocaleString('es-CO')}
          </p>
        </div>
      </div>
    `;
  };

  // ========== ENVIAR REPORTE MANUAL ==========
  const enviarReporteManual = async () => {
    if (!configuracion.correoDestino) {
      alert('⚠️ Ingresa un correo de destino');
      return;
    }

    if (!zohoConfig.email || !zohoConfig.password) {
      alert('⚠️ Configura tus credenciales de Zoho primero');
      return;
    }

    setEnviando(true);

    try {
      const htmlReporte = generarReporteHTML(configuracion.frecuencia);

      const emailData = {
        toAddress: configuracion.correoDestino,
        subject: `📊 Reporte ${configuracion.frecuencia.toUpperCase()} - Sistema STI - ${new Date().toLocaleDateString('es-CO')}`,
        content: htmlReporte,
      };

      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpConfig: { email: zohoConfig.email, password: zohoConfig.password },
          emailData: emailData,
        }),
      });

      if (response.ok) {
        setUltimoEnvio(new Date());
        localStorage.setItem('ultimo-envio-reporte', new Date().toISOString());
        alert('✅ Reporte enviado exitosamente');
      } else {
        throw new Error('Error al enviar reporte');
      }
    } catch (error) {
      console.error('Error enviando reporte:', error);
      alert('❌ Error al enviar el reporte. Verifica la configuración de Zoho.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={32} />
              <div>
                <h2 className="text-2xl font-bold">📊 Reportes Automáticos</h2>
                <p className="text-sm text-blue-100">Envío programado de reportes por correo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Configuración */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings size={20} />
              Configuración de Reportes
            </h3>

            <div className="space-y-4">
              {/* Activar/Desactivar */}
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-gray-200">
                <div>
                  <h4 className="font-semibold text-gray-800">Estado del Reporte Automático</h4>
                  <p className="text-sm text-gray-600">
                    {configuracion.activo ? 'Los reportes se enviarán automáticamente' : 'Los reportes NO se enviarán automáticamente'}
                  </p>
                </div>
                <button
                  onClick={() => setConfiguracion((prev) => ({ ...prev, activo: !prev.activo }))}
                  className={`px-6 py-3 rounded-lg font-bold transition ${
                    configuracion.activo
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  {configuracion.activo ? '✅ Activo' : '⚪ Inactivo'}
                </button>
              </div>

              {/* Correo Destino */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo de Destino *
                </label>
                <input
                  type="email"
                  value={configuracion.correoDestino}
                  onChange={(e) => setConfiguracion((prev) => ({ ...prev, correoDestino: e.target.value }))}
                  placeholder="tu-correo@ejemplo.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Frecuencia */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Frecuencia</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfiguracion((prev) => ({ ...prev, frecuencia: 'diario' }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                      configuracion.frecuencia === 'diario'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📅 Diario
                  </button>
                  <button
                    onClick={() => setConfiguracion((prev) => ({ ...prev, frecuencia: 'semanal' }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                      configuracion.frecuencia === 'semanal'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📆 Semanal
                  </button>
                  <button
                    onClick={() => setConfiguracion((prev) => ({ ...prev, frecuencia: 'mensual' }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                      configuracion.frecuencia === 'mensual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📊 Mensual
                  </button>
                </div>
              </div>

              {/* Opciones de Inclusión */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Incluir en el Reporte</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configuracion.incluirTopClientes}
                      onChange={(e) => setConfiguracion((prev) => ({ ...prev, incluirTopClientes: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Top 5 Clientes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configuracion.incluirTopCiudades}
                      onChange={(e) => setConfiguracion((prev) => ({ ...prev, incluirTopCiudades: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Top 5 Ciudades</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Vista Previa y Envío Manual */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Mail size={20} />
              Envío Manual
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Prueba el reporte enviándolo manualmente antes de activar el envío automático.
              </p>

              <button
                onClick={enviarReporteManual}
                disabled={enviando || !configuracion.correoDestino}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
                  enviando || !configuracion.correoDestino
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                }`}
              >
                <Send size={20} />
                {enviando ? 'Enviando...' : 'Enviar Reporte Ahora'}
              </button>

              {ultimoEnvio && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle size={16} />
                    Último envío: {ultimoEnvio.toLocaleString('es-CO')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="mb-2">
              <strong>💡 Nota:</strong> El envío automático requiere que el sistema esté en ejecución.
            </p>
            <p>
              Para envíos verdaderamente automáticos, considera configurar un servicio de backend con cron jobs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 border-t px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {configuracion.activo ? '✅ Reportes automáticos activados' : '⚪ Reportes automáticos desactivados'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportesAutomaticos;
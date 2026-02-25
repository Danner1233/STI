import React, { useState } from 'react';
import { Plus, Zap, CheckCircle } from 'lucide-react';

const RegistroRapido = ({ onRegistrar }) => {
  const [formRapido, setFormRapido] = useState({
    numeroOT: '',
    rr: '',
    cliente: '',
    fecha: '',
    tipoServicio: 'ENTREGA DE SERVICIO',
    consensus: false,
    observaciones: '',
  });

  const [registradoExito, setRegistradoExito] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormRapido(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ===== VALIDACIONES OBLIGATORIAS =====
    
    // 1. Validaciones básicas
    if (!formRapido.numeroOT || !formRapido.cliente) {
      alert(
        '⚠️ CAMPOS OBLIGATORIOS ⚠️\n\n' +
        'Por favor completa:\n' +
        '• Número OT\n' +
        '• Cliente'
      );
      return;
    }

    // 2. 🚨 VALIDACIÓN OBLIGATORIA DE CONSENSUS
    if (!formRapido.consensus) {
      alert(
        "🚨 CONSENSUS OBLIGATORIO 🚨\n\n" +
        "NO puedes registrar una OT sin agendar en Consensus.\n\n" +
        "📋 DEBES:\n" +
        "1. Agendar la OT en la plataforma Consensus\n" +
        "2. Marcar el checkbox '✅ Agendado en Consensus'\n" +
        "3. Intentar registrar de nuevo\n\n" +
        "⚠️ Esta validación es OBLIGATORIA y NO se puede omitir."
      );
      return;
    }

    // ===== TODAS LAS VALIDACIONES PASARON ✅ =====
    
    // Registrar en productividad
    onRegistrar(formRapido);

    // Limpiar formulario
    setFormRapido({
      numeroOT: '',
      rr: '',
      cliente: '',
      fecha: '',
      tipoServicio: 'ENTREGA DE SERVICIO',
      consensus: false,
      observaciones: '',
    });

    // Mostrar mensaje de éxito
    setRegistradoExito(true);
    setTimeout(() => setRegistradoExito(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-purple-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              ⚡ Registro Rápido de OT
            </h2>
            <p className="text-sm text-gray-600">
              Agregar a productividad sin enviar correo
            </p>
          </div>
        </div>
        
        {/* Mensaje de éxito */}
        {registradoExito && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
            <CheckCircle size={20} />
            <span className="font-semibold">✅ OT Registrada!</span>
          </div>
        )}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Primera Fila: OT y Cliente */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Número OT *
            </label>
            <input
              type="text"
              name="numeroOT"
              value={formRapido.numeroOT}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="22XXXXXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Cliente *
            </label>
            <input
              type="text"
              name="cliente"
              value={formRapido.cliente}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="CLARO, TIGO, MOVISTAR..."
              required
            />
          </div>
        </div>

        {/* Segunda Fila: RR, Fecha y Tipo */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Número RR
            </label>
            <input
              type="text"
              name="rr"
              value={formRapido.rr}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="123456"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={formRapido.fecha}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tipo de Servicio
            </label>
            <select
              name="tipoServicio"
              value={formRapido.tipoServicio}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            >
              <option>ENTREGA DE SERVICIO</option>
              <option>Instalacion</option>
              <option>Mantenimiento</option>
              <option>Reparacion</option>
              <option>Inspeccion</option>
              <option>Site Survey</option>
            </select>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            📝 Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formRapido.observaciones}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
            placeholder="Notas adicionales sobre esta OT..."
          />
        </div>

        {/* Consensus - OBLIGATORIO */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-3 border-purple-500 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🚨</span>
            <div>
              <label className="block text-sm font-bold text-purple-900">
                ✅ CONSENSUS - OBLIGATORIO
              </label>
              <p className="text-xs text-purple-700 font-semibold">
                🚨 DEBES agendar en Consensus ANTES de registrar
              </p>
            </div>
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer bg-white border-2 border-purple-400 rounded-lg p-3 hover:bg-purple-50 transition">
            <input
              type="checkbox"
              name="consensus"
              checked={formRapido.consensus}
              onChange={handleInputChange}
              className="w-6 h-6 text-purple-600 rounded cursor-pointer"
              style={{ accentColor: '#9333ea' }}
            />
            <div className="flex-1">
              <span className="text-sm font-bold text-gray-800 block">
                {formRapido.consensus ? '✅ YA AGENDÉ EN CONSENSUS' : '⚠️ Marcar cuando hayas agendado en Consensus'}
              </span>
              {!formRapido.consensus && (
                <span className="text-xs text-red-600 font-semibold">
                  ⚠️ OBLIGATORIO - No podrás registrar sin esto
                </span>
              )}
            </div>
          </label>
        </div>

        {/* Botón de Registro */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg text-base"
          >
            <Plus size={24} />
            ⚡ Registrar OT Rápido
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-xs text-blue-900 font-semibold mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span>Validación OBLIGATORIA antes de registrar:</span>
          </p>
          <ul className="text-xs text-blue-800 space-y-1 ml-6">
            <li className="flex items-center gap-2">
              <span className={formRapido.consensus ? '✅' : '⚠️'}></span>
              <span className={formRapido.consensus ? '' : 'font-bold text-red-600'}>
                Agendar en Consensus
              </span>
            </li>
          </ul>
          <p className="text-xs text-blue-700 mt-2">
            📝 La OT se agregará directamente a productividad sin enviar correo.
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegistroRapido;
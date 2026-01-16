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
    
    // Validaciones mínimas
    if (!formRapido.numeroOT || !formRapido.cliente) {
      alert('⚠️ Por favor completa al menos: OT y Cliente');
      return;
    }

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

      {/* Formulario en Grid */}
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

        {/* Tercera Fila: Consensus y Botón */}
        <div className="flex items-end gap-4">
          {/* Consensus Checkbox */}
          <div className="flex-1 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="consensus"
                checked={formRapido.consensus}
                onChange={handleInputChange}
                className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                style={{ accentColor: '#9333ea' }}
              />
              <span className="text-sm font-semibold text-yellow-800">
                {formRapido.consensus ? '✅' : '⚠️'} Agendado en Consensus
              </span>
            </label>
          </div>

          {/* Botón de Registro */}
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus size={20} />
            Registrar OT
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
          <p className="text-xs text-purple-800 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>Registro directo:</strong> Esta OT se agregará a productividad sin enviar correo. Solo completa OT y Cliente para registrar rápidamente.
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegistroRapido;
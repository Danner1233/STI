import React, { useState } from 'react';
import { Plus, Zap, CheckCircle } from 'lucide-react';
import { SERVICIOS_PDT } from '../constants/serviciosPDT';

const RegistroRapido = ({ onRegistrar }) => {
  const [formRapido, setFormRapido] = useState({
    numeroOT: '',
    rr: '',
    cliente: '',
    fecha: '',
    tipoServicio: 'ENTREGA DE SERVICIO',
    consensus: false,
    generarPDT: null, // null = no decidido, true = sí, false = no
    servicioPDT: '',
    pdtSubido: false, // ← NUEVO
    confirmoNoPDT: false, // ← NUEVO
    observaciones: '',
  });

  const [registradoExito, setRegistradoExito] = useState(false);

  // 📥 DESCARGAR PLANTILLA PDT MANUALMENTE
  const descargarPlantillaPDTManual = () => {
    if (!formRapido.servicioPDT) {
      alert('⚠️ Primero selecciona el tipo de servicio PDT');
      return;
    }

    // Buscar plantilla en IndexedDB
    const dbRequest = indexedDB.open('PDT_Storage', 1);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['plantillas'], 'readonly');
      const store = transaction.objectStore('plantillas');
      const getRequest = store.get(formRapido.servicioPDT);
      
      getRequest.onsuccess = () => {
        const plantilla = getRequest.result;
        
        if (!plantilla) {
          alert(`⚠️ No hay plantilla configurada para: ${formRapido.servicioPDT}\n\nPor favor, sube la plantilla en Gestión de PDTs`);
          return;
        }
        
        // Descargar el archivo
        const blob = new Blob([plantilla.file], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PDT_${formRapido.servicioPDT}_${formRapido.numeroOT || 'SIN_OT'}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`✅ Plantilla PDT descargada: ${formRapido.servicioPDT}`);
      };
      
      getRequest.onerror = () => {
        alert('❌ Error al buscar la plantilla PDT');
      };
    };
    
    dbRequest.onerror = () => {
      alert('❌ Error al acceder a la base de datos de PDTs');
    };
  };

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

    // 3. 🚨 VALIDACIÓN OBLIGATORIA DE PDT - DECISIÓN
    if (formRapido.generarPDT === null || formRapido.generarPDT === undefined || formRapido.generarPDT === '') {
      alert(
        "🚨 PDT OBLIGATORIO 🚨\n\n" +
        "NO puedes registrar sin indicar si necesitas PDT.\n\n" +
        "📋 DEBES:\n" +
        "1. Revisar la sección 'PDT - Plan Técnico de Despliegue'\n" +
        "2. Hacer click en 'SÍ, necesito PDT' o 'NO necesito PDT'\n" +
        "3. Intentar registrar de nuevo\n\n" +
        "⚠️ Esta validación es OBLIGATORIA y NO se puede omitir."
      );
      return;
    }

    // 4. Si dijo SÍ necesita PDT → Validar servicio seleccionado
    if (formRapido.generarPDT === true && !formRapido.servicioPDT) {
      alert(
        "⚠️ FALTA SELECCIONAR SERVICIO PDT ⚠️\n\n" +
        "Marcaste que SÍ necesita PDT, pero NO has seleccionado el tipo de servicio.\n\n" +
        "📋 DEBES:\n" +
        "1. Seleccionar el tipo de servicio en el dropdown\n" +
        "2. Intentar registrar de nuevo"
      );
      return;
    }

    // 5. Si necesita PDT → Validar que confirmó que lo tiene listo
    if (formRapido.generarPDT === true && formRapido.servicioPDT && !formRapido.pdtSubido) {
      alert(
        "🚨 PDT NO CONFIRMADO 🚨\n\n" +
        `Esta OT requiere PDT del tipo "${formRapido.servicioPDT}"\n\n` +
        "❌ NO has marcado que tienes el PDT listo\n\n" +
        "📋 DEBES:\n" +
        "1. Descargar la plantilla PDT\n" +
        "2. Llenarla completamente\n" +
        "3. Marcar el checkbox '✅ Ya tengo el PDT listo'\n" +
        "4. Intentar registrar de nuevo\n\n" +
        "⚠️ NO puedes registrar sin confirmar el PDT."
      );
      return;
    }

    // 6. Si dijo NO necesita PDT → Validar confirmación
    if (formRapido.generarPDT === false && !formRapido.confirmoNoPDT) {
      alert(
        "⚠️ CONFIRMACIÓN OBLIGATORIA ⚠️\n\n" +
        "Has indicado que esta OT NO necesita PDT.\n\n" +
        "📋 DEBES:\n" +
        "Marcar el checkbox:\n" +
        '"✅ Confirmo que esta OT NO requiere PDT"\n\n' +
        "⚠️ Esta confirmación es OBLIGATORIA."
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
      generarPDT: null,
      servicioPDT: '',
      pdtSubido: false,
      confirmoNoPDT: false,
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

        {/* PDT - OBLIGATORIO */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-3 border-red-500 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <label className="block text-sm font-bold text-red-900">
                📋 PDT - Plan Técnico de Despliegue
              </label>
              <p className="text-xs text-red-700 font-semibold">
                🚨 OBLIGATORIO: Indica si necesitas o no PDT
              </p>
            </div>
          </div>
          
          {/* Botones SI/NO */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              onClick={() => {
                setFormRapido(prev => ({ ...prev, generarPDT: true, confirmoNoPDT: false }));
              }}
              className={`py-2 px-3 rounded-lg font-bold text-sm border-2 transition ${
                formRapido.generarPDT === true
                  ? 'bg-green-600 text-white border-green-800'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
              }`}
            >
              {formRapido.generarPDT === true ? '✅' : '⚪'} SÍ necesito
            </button>
            
            <button
              type="button"
              onClick={() => {
                setFormRapido(prev => ({ ...prev, generarPDT: false, servicioPDT: '', pdtSubido: false }));
              }}
              className={`py-2 px-3 rounded-lg font-bold text-sm border-2 transition ${
                formRapido.generarPDT === false
                  ? 'bg-gray-600 text-white border-gray-800'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {formRapido.generarPDT === false ? '✅' : '⚪'} NO necesito
            </button>
          </div>
          
          {/* Dropdown y checkbox si dijo SÍ */}
          {formRapido.generarPDT === true && (
            <div className="space-y-2">
              <select
                name="servicioPDT"
                value={formRapido.servicioPDT}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-red-400 bg-white rounded-lg focus:ring-2 focus:ring-red-500 font-semibold text-sm"
              >
                <option value="">-- Selecciona servicio --</option>
                {SERVICIOS_PDT.map(servicio => (
                  <option key={servicio} value={servicio}>
                    {servicio}
                  </option>
                ))}
              </select>

              {/* 📥 BOTÓN DE DESCARGA MANUAL */}
              {formRapido.servicioPDT && (
                <button
                  type="button"
                  onClick={descargarPlantillaPDTManual}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm shadow-lg"
                >
                  📥 Descargar Plantilla PDT - {formRapido.servicioPDT}
                </button>
              )}

              {/* Checkbox: Ya tengo el PDT listo */}
              {formRapido.servicioPDT && (
                <label className="flex items-center gap-2 cursor-pointer bg-yellow-50 border border-yellow-400 rounded p-2">
                  <input
                    type="checkbox"
                    checked={formRapido.pdtSubido}
                    onChange={(e) => setFormRapido(prev => ({ ...prev, pdtSubido: e.target.checked }))}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: '#10B981' }}
                  />
                  <span className="text-xs font-bold text-gray-800">
                    {formRapido.pdtSubido ? '✅ PDT listo' : '⚠️ Marca cuando tengas el PDT listo'}
                  </span>
                </label>
              )}
            </div>
          )}

          {/* Checkbox de confirmación si dijo NO */}
          {formRapido.generarPDT === false && (
            <label className="flex items-center gap-2 cursor-pointer bg-orange-50 border border-orange-400 rounded p-2 mt-2">
              <input
                type="checkbox"
                checked={formRapido.confirmoNoPDT}
                onChange={(e) => setFormRapido(prev => ({ ...prev, confirmoNoPDT: e.target.checked }))}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: '#EF4444' }}
              />
              <span className="text-xs font-bold text-gray-800">
                {formRapido.confirmoNoPDT ? '✅ Confirmado' : '⚠️ Confirmo que NO requiere PDT'}
              </span>
            </label>
          )}
          
          {/* Mensaje */}
          <p className="text-xs mt-2 font-semibold">
            {formRapido.generarPDT === null ? '🚫 DEBES DECIDIR SI/NO' :
             formRapido.generarPDT === true && !formRapido.servicioPDT ? '⚠️ Selecciona servicio' :
             formRapido.generarPDT === true && !formRapido.pdtSubido ? '🚨 Marca que tienes el PDT listo' :
             formRapido.generarPDT === true ? '✅ PDT confirmado' :
             formRapido.generarPDT === false && !formRapido.confirmoNoPDT ? '⚠️ Confirma que no necesita' :
             '✓ Confirmado - No necesita PDT'}
          </p>
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
            <span>Validaciones OBLIGATORIAS antes de registrar:</span>
          </p>
          <ul className="text-xs text-blue-800 space-y-1 ml-6">
            <li className="flex items-center gap-2">
              <span className={formRapido.consensus ? '✅' : '⚠️'}></span>
              <span className={formRapido.consensus ? '' : 'font-bold text-red-600'}>
                Agendar en Consensus
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className={formRapido.generarPDT !== null ? '✅' : '⚠️'}></span>
              <span className={formRapido.generarPDT !== null ? '' : 'font-bold text-red-600'}>
                Indicar si necesita o no PDT
              </span>
            </li>
            {formRapido.generarPDT === true && (
              <>
                <li className="flex items-center gap-2 ml-4">
                  <span className={formRapido.servicioPDT ? '✅' : '⚠️'}></span>
                  <span className={formRapido.servicioPDT ? '' : 'font-bold text-red-600'}>
                    Seleccionar tipo de servicio PDT
                  </span>
                </li>
                <li className="flex items-center gap-2 ml-4">
                  <span className={formRapido.pdtSubido ? '✅' : '⚠️'}></span>
                  <span className={formRapido.pdtSubido ? '' : 'font-bold text-red-600'}>
                    Confirmar que tiene PDT listo
                  </span>
                </li>
              </>
            )}
            {formRapido.generarPDT === false && (
              <li className="flex items-center gap-2 ml-4">
                <span className={formRapido.confirmoNoPDT ? '✅' : '⚠️'}></span>
                <span className={formRapido.confirmoNoPDT ? '' : 'font-bold text-red-600'}>
                  Confirmar que NO requiere PDT
                </span>
              </li>
            )}
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
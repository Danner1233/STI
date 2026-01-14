import React, { useState, useEffect } from 'react';

const Autocheck = () => {
  // Estados para líderes y ciudades con localStorage
  const [lideres, setLideres] = useState(() => {
    const saved = localStorage.getItem('autocheck-lideres');
    return saved ? JSON.parse(saved) : {
      'STEPHANIE MAYOR GUAUQUE': '310 2618274',
      'RICHARD ELIAS VALET HERNANDEZ': '310 2347391',
      'KAREN ALEJANDRA RUIZ MONTOYA': '310 2017818',
      'JOHN DERYAN VARELA RAMIREZ': '312 3412669',
      'ELIEL HENRIQUE RAMIREZ BORREGO': '322 3382569'
    };
  });
  
  const [ciudadesAutocheck, setCiudadesAutocheck] = useState(() => {
    const saved = localStorage.getItem('autocheck-ciudades');
    return saved ? JSON.parse(saved) : ['BOGOTÁ', 'MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA'];
  });

  const [formAutocheck, setFormAutocheck] = useState({
    n1_nombre: 'GEORGE RUEDA',
    n1_cel: '310 3148101',
    lider: '',
    lider_cel: '',
    n3_nombre: 'JEISSON ANDRÉS VELÁSQUEZ ESTRADA',
    n3_cel: '322 3259008',
    n4_nombre: 'HAMMER FARID OCHOA',
    n4_cel: '310 2020475',
    ciudad: '',
    direccion: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    duracion: '',
    correo: 'carlos.sosa@sti.com.co',
    cel_contacto: '3136119380'
  });

  const [confirmacionGenerada, setConfirmacionGenerada] = useState('');
  const [tecnicosEditable, setTecnicosEditable] = useState(false);
  const [contactoEditable, setContactoEditable] = useState(false);

  // Guardar líderes en localStorage
  useEffect(() => {
    localStorage.setItem('autocheck-lideres', JSON.stringify(lideres));
  }, [lideres]);

  // Guardar ciudades en localStorage
  useEffect(() => {
    localStorage.setItem('autocheck-ciudades', JSON.stringify(ciudadesAutocheck));
  }, [ciudadesAutocheck]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormAutocheck(prev => ({ ...prev, [name]: value }));

    // Auto-completar celular del líder
    if (name === 'lider') {
      setFormAutocheck(prev => ({ ...prev, lider_cel: lideres[value] || '' }));
    }
  };

  // Agregar nuevo líder
  const agregarLider = (nombre, celular) => {
    const nombreUpper = nombre.toUpperCase().trim();
    if (nombreUpper && celular) {
      setLideres(prev => ({ ...prev, [nombreUpper]: celular }));
      alert('✅ Líder agregado correctamente!');
      return true;
    }
    return false;
  };

  // Agregar nueva ciudad
  const agregarCiudad = (ciudad) => {
    const ciudadUpper = ciudad.toUpperCase().trim();
    if (ciudadUpper && !ciudadesAutocheck.includes(ciudadUpper)) {
      setCiudadesAutocheck(prev => [...prev, ciudadUpper]);
      alert('✅ Ciudad agregada correctamente!');
      return true;
    }
    return false;
  };

  // Generar confirmación
  const generarConfirmacion = () => {
    const {
      n1_nombre, n1_cel, lider, lider_cel, n3_nombre, n3_cel,
      n4_nombre, n4_cel, ciudad, direccion, fecha, hora_inicio,
      hora_fin, duracion, correo, cel_contacto
    } = formAutocheck;

    // Validaciones
    if (!fecha || !hora_inicio || !hora_fin || !ciudad || !lider) {
      alert('⚠️ Por favor completa todos los campos obligatorios');
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
      alert('❌ Formato de fecha incorrecto. Use DD/MM/YYYY (Ej: 21/09/2025)');
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(hora_inicio) || !/^\d{2}:\d{2}$/.test(hora_fin)) {
      alert('❌ Formato de hora incorrecto. Use HH:MM (Ej: 08:00)');
      return;
    }

    const confirmacion = `CONFIRMACION CITA  ENTREGAS    N1: ${n1_nombre}   CELULAR ${n1_cel}  N2: ${lider}  CELULAR: ${lider_cel}  N3 ${n3_nombre}  CELULAR: ${n3_cel}  N4: ${n4_nombre}  CELULAR: ${n4_cel}  Dirección confirmada por el cliente: // ${ciudad} //  ${direccion} //  Fecha y hora de la actividad confirmada:  ${fecha} ${hora_inicio} a las ${hora_fin} X ${duracion} HRAS
 
Contacto en sitio confirmado: Pdte por confirmar     Disponibilidad: Agenda  _X_Cliente __    Correo :  ${correo}   Cualquier inconveniente con acceso al sitio, por favor contactar  a los celulares ${cel_contacto}  
 
FECHA DE INST 1:  ${fecha} ${hora_inicio} a las ${hora_fin} X ${duracion} HRAS   HORA DE  INST 1:  ${fecha} ${hora_inicio} a las ${hora_fin} X ${duracion} HRAS
 
ASOCIADA 0`;

    setConfirmacionGenerada(confirmacion);
  };

  // Copiar al portapapeles
  const copiarConfirmacion = () => {
    navigator.clipboard.writeText(confirmacionGenerada).then(() => {
      alert('✅ ¡Confirmación copiada al portapapeles!');
    }).catch(err => {
      alert('❌ Error al copiar: ' + err.message);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        ✅ Automatizador de Confirmaciones (Autocheck)
      </h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>💡 ¿Para qué sirve?</strong>
        </p>
        <p className="text-sm text-yellow-700 mt-1">
          Genera confirmaciones de cita automáticamente para entregas. Los líderes y ciudades que agregues se guardan automáticamente.
        </p>
      </div>

      {/* Sección de Técnicos */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 relative">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">👥 Técnicos</h3>
          <button
            onClick={() => setTecnicosEditable(!tecnicosEditable)}
            className={`text-sm px-3 py-1 rounded transition ${
              tecnicosEditable
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {tecnicosEditable ? '✅ Guardar' : '✏️ Editar'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              N1 - Técnico Principal (Nombre)
            </label>
            <input
              type="text"
              name="n1_nombre"
              value={formAutocheck.n1_nombre}
              onChange={handleChange}
              disabled={!tecnicosEditable}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              N1 - Celular
            </label>
            <input
              type="text"
              name="n1_cel"
              value={formAutocheck.n1_cel}
              onChange={handleChange}
              disabled={!tecnicosEditable}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              N3 - Técnico (Nombre)
            </label>
            <input
              type="text"
              name="n3_nombre"
              value={formAutocheck.n3_nombre}
              onChange={handleChange}
              disabled={!tecnicosEditable}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              N3 - Celular
            </label>
            <input
              type="text"
              name="n3_cel"
              value={formAutocheck.n3_cel}
              onChange={handleChange}
              disabled={!tecnicosEditable}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              N4 - Técnico (Nombre)
            </label>
            <input
              type="text"
              name="n4_nombre"
              value={formAutocheck.n4_nombre}
              onChange={handleChange}
              disabled={!tecnicosEditable}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              N4 - Celular
            </label>
            <input
              type="text"
              name="n4_cel"
              value={formAutocheck.n4_cel}
              onChange={handleChange}
              disabled={!tecnicosEditable}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Sección de Líder (N2) */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-3">👔 N2 - Líder</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Seleccionar Líder *
            </label>
            <select
              name="lider"
              value={formAutocheck.lider}
              onChange={handleChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="">Seleccionar líder...</option>
              {Object.keys(lideres).map(nombre => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Celular del Líder (Auto-completado)
            </label>
            <input
              type="text"
              value={formAutocheck.lider_cel}
              readOnly
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100"
            />
          </div>
        </div>

        {/* Agregar nuevo líder inline */}
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-semibold">
            ➕ Agregar Nuevo Líder
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              id="nuevoLiderNombre"
              placeholder="Nombre completo del líder"
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <input
              type="text"
              id="nuevoLiderCel"
              placeholder="Celular (Ej: 310 1234567)"
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <button
              onClick={() => {
                const nombre = document.getElementById('nuevoLiderNombre').value;
                const cel = document.getElementById('nuevoLiderCel').value;
                if (agregarLider(nombre, cel)) {
                  document.getElementById('nuevoLiderNombre').value = '';
                  document.getElementById('nuevoLiderCel').value = '';
                } else {
                  alert('⚠️ Por favor completa ambos campos');
                }
              }}
              className="col-span-2 bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded transition"
            >
              ✅ Guardar Líder
            </button>
          </div>
        </details>
      </div>

      {/* Información de la Cita */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-3">📍 Información de la Cita</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Ciudad *
            </label>
            <select
              name="ciudad"
              value={formAutocheck.ciudad}
              onChange={handleChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="">Seleccionar ciudad...</option>
              {ciudadesAutocheck.map(ciudad => (
                <option key={ciudad} value={ciudad}>{ciudad}</option>
              ))}
            </select>
            
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-semibold">
                ➕ Agregar Nueva Ciudad
              </summary>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  id="nuevaCiudad"
                  placeholder="Nombre de la ciudad"
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                />
                <button
                  onClick={() => {
                    const ciudad = document.getElementById('nuevaCiudad').value;
                    if (agregarCiudad(ciudad)) {
                      document.getElementById('nuevaCiudad').value = '';
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded transition"
                >
                  ✅
                </button>
              </div>
            </details>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Dirección Completa *
            </label>
            <input
              type="text"
              name="direccion"
              value={formAutocheck.direccion}
              onChange={handleChange}
              placeholder="Ej: CL 119 7-03 APT PI2-LC201"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Fecha (DD/MM/YYYY) *
            </label>
            <input
              type="text"
              name="fecha"
              value={formAutocheck.fecha}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5, 9);
                setFormAutocheck(prev => ({ ...prev, fecha: value }));
              }}
              placeholder="21/09/2025"
              maxLength="10"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Duración (Horas) *
            </label>
            <input
              type="number"
              name="duracion"
              value={formAutocheck.duracion}
              onChange={handleChange}
              placeholder="4"
              min="1"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Hora Inicio (HH:MM) *
            </label>
            <input
              type="text"
              name="hora_inicio"
              value={formAutocheck.hora_inicio}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) value = value.substring(0, 2) + ':' + value.substring(2, 4);
                setFormAutocheck(prev => ({ ...prev, hora_inicio: value }));
              }}
              placeholder="08:00"
              maxLength="5"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Hora Fin (HH:MM) *
            </label>
            <input
              type="text"
              name="hora_fin"
              value={formAutocheck.hora_fin}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) value = value.substring(0, 2) + ':' + value.substring(2, 4);
                setFormAutocheck(prev => ({ ...prev, hora_fin: value }));
              }}
              placeholder="13:00"
              maxLength="5"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 relative">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">📞 Información de Contacto</h3>
          <button
            onClick={() => setContactoEditable(!contactoEditable)}
            className={`text-sm px-3 py-1 rounded transition ${
              contactoEditable
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {contactoEditable ? '✅ Guardar' : '✏️ Editar'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Correo de Contacto
            </label>
            <input
              type="email"
              name="correo"
              value={formAutocheck.correo}
              onChange={handleChange}
              disabled={!contactoEditable}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Celular de Contacto en Sitio
            </label>
            <input
              type="text"
              name="cel_contacto"
              value={formAutocheck.cel_contacto}
              onChange={handleChange}
              disabled={!contactoEditable}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3">
        <button
          onClick={generarConfirmacion}
          className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg transition"
        >
          🚀 Generar Confirmación
        </button>
        
        {confirmacionGenerada && (
          <button
            onClick={copiarConfirmacion}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            📋 Copiar
          </button>
        )}
      </div>

      {/* Resultado */}
      {confirmacionGenerada && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2">✅ Confirmación Generada:</h4>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-gray-200 max-h-96 overflow-y-auto">
            {confirmacionGenerada}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Autocheck;
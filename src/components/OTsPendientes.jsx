import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle, Edit2, Trash2, Clock, User, UserCheck } from 'lucide-react';

const OTsPendientes = ({ onClose, onOTAgendada, onRegistrarEnProductividad, onActualizarProductividad }) => {
  const [ahora] = useState(() => Date.now());
  
  const [pendientes, setPendientes] = useState(() => {
    const saved = localStorage.getItem('ots-pendientes');
    return saved ? JSON.parse(saved) : [];
  });

  const [nuevaOT, setNuevaOT] = useState({
    numeroOT: '',
    cliente: '',
    ciudad: '',
    direccion: '',
    contacto: '',
    telefono: '',
    lider: '', // ← NUEVO CAMPO
    observaciones: '',
    intentos: 0
  });

  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    localStorage.setItem('ots-pendientes', JSON.stringify(pendientes));
  }, [pendientes]);

  const agregarPendiente = () => {
    if (!nuevaOT.numeroOT || !nuevaOT.cliente) {
      alert('⚠️ Número OT y Cliente son obligatorios');
      return;
    }

    // Verificar si la OT ya existe
    if (pendientes.some(ot => ot.numeroOT === nuevaOT.numeroOT)) {
      alert('⚠️ Esta OT ya está en la lista de pendientes');
      return;
    }

    // Generar timestamp DENTRO del handler de evento (seguro)
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    const pendiente = {
      ...nuevaOT,
      id: timestamp.toString(),
      fechaCreacion: new Date(timestamp).toISOString(),
      ultimoIntento: new Date(timestamp).toISOString(),
      estado: 'pendiente',
      productividadId: null
    };

    setPendientes(prev => [...prev, pendiente]);

    // 🆕 REGISTRAR EN PRODUCTIVIDAD CON ESTADO "PENDIENTE"
    if (onRegistrarEnProductividad) {
      const registroProductividad = {
        id: timestamp,
        numeroOT: nuevaOT.numeroOT,
        cliente: nuevaOT.cliente,
        ciudad: nuevaOT.ciudad || '',
        direccion: nuevaOT.direccion || '',
        contacto: nuevaOT.contacto || '',
        telefono: nuevaOT.telefono || '',
        lider: nuevaOT.lider || '',
        observaciones: nuevaOT.observaciones ? `📋 Pendiente: ${nuevaOT.observaciones}` : '📋 OT Pendiente por agendar',
        fecha: '',
        hora: '',
        correoDestino: '',
        tipoServicio: 'PENDIENTE',
        duracion: '',
        consensus: false,
        tablaPersonalizada: '',
        copiaCC: [],
        fechaEnvio: new Date(timestamp).toISOString(),
        estado: 'Pendiente',
        rr: '',
      };

      onRegistrarEnProductividad(registroProductividad);
      
      setPendientes(prev => prev.map(p => 
        p.id === pendiente.id ? { ...p, productividadId: timestamp } : p
      ));
    }

    limpiarFormulario();
    alert('✅ OT agregada a pendientes y registrada en productividad con estado "Pendiente"');
  };

  const actualizarPendiente = () => {
    if (!nuevaOT.numeroOT || !nuevaOT.cliente) {
      alert('⚠️ Número OT y Cliente son obligatorios');
      return;
    }

    // Generar timestamp DENTRO del handler de evento (seguro)
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    setPendientes(prev => prev.map(ot => 
      ot.id === editando ? { 
        ...ot, 
        ...nuevaOT, 
        fechaModificacion: new Date(timestamp).toISOString(),
        ultimoIntento: new Date(timestamp).toISOString() // ← Actualizar último intento
      } : ot
    ));

    // 🆕 ACTUALIZAR TAMBIÉN EN PRODUCTIVIDAD SI EXISTE
    const otEditada = pendientes.find(ot => ot.id === editando);
    if (otEditada && otEditada.productividadId && onActualizarProductividad) {
      onActualizarProductividad(otEditada.productividadId, {
        cliente: nuevaOT.cliente,
        ciudad: nuevaOT.ciudad,
        direccion: nuevaOT.direccion,
        contacto: nuevaOT.contacto,
        telefono: nuevaOT.telefono,
        lider: nuevaOT.lider,
        observaciones: nuevaOT.observaciones ? `📋 Pendiente: ${nuevaOT.observaciones}` : '📋 OT Pendiente por agendar',
        fechaEnvio: new Date(timestamp).toISOString(), // ← ACTUALIZAR FECHA A HOY
        actualizadoRecientemente: true // ← Marcar como actualizado
      });
    }
    
    setEditando(null);
    limpiarFormulario();
    alert('✅ OT actualizada en pendientes y productividad\n\n📅 La fecha se actualizó a HOY para reflejar esta actividad.');
  };

  const eliminarPendiente = (id) => {
    if (confirm('¿Eliminar esta OT de pendientes?\n\nNOTA: También se eliminará de productividad si fue registrada desde aquí.')) {
      const ot = pendientes.find(p => p.id === id);
      
      // 🆕 ELIMINAR DE PRODUCTIVIDAD SI FUE CREADA AQUÍ
      if (ot && ot.productividadId && onActualizarProductividad) {
        // Usar la función de actualización con null para indicar eliminación
        onActualizarProductividad(ot.productividadId, null, true);
      }

      setPendientes(prev => prev.filter(ot => ot.id !== id));
      alert('✅ OT eliminada de pendientes y productividad');
    }
  };

  const registrarIntento = (id) => {
    // Generar timestamp DENTRO del handler de evento (seguro)
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    setPendientes(prev => prev.map(ot => 
      ot.id === id ? { 
        ...ot, 
        intentos: ot.intentos + 1,
        ultimoIntento: new Date(timestamp).toISOString()
      } : ot
    ));

    // 🆕 ACTUALIZAR OBSERVACIONES Y FECHA EN PRODUCTIVIDAD
    const ot = pendientes.find(p => p.id === id);
    if (ot && ot.productividadId && onActualizarProductividad) {
      onActualizarProductividad(ot.productividadId, {
        observaciones: `📋 Pendiente: ${ot.observaciones || ''} | ${ot.intentos + 1} intentos de contacto`,
        fechaEnvio: new Date(timestamp).toISOString(), // ← ACTUALIZAR FECHA A HOY
        actualizadoRecientemente: true // ← Marcar como actualizado
      });
    }

    alert('✅ Intento de contacto registrado\n\n📅 La fecha de esta OT se actualizó a HOY.');
  };

  const marcarComoAgendada = (ot) => {
    if (confirm(`¿Marcar OT ${ot.numeroOT} como agendada?\n\n✅ Se actualizará en productividad a estado "Enviado"\n✅ Se quitará de la lista de pendientes\n\n⚠️ Este cambio es permanente.`)) {
      
      // 🆕 ACTUALIZAR ESTADO EN PRODUCTIVIDAD (NO CREAR NUEVO)
      if (ot.productividadId && onActualizarProductividad) {
        onActualizarProductividad(ot.productividadId, {
          estado: 'Enviado',
          observaciones: `✅ Agendada desde OTs Pendientes | ${ot.observaciones || ''}`,
          tipoServicio: 'ENTREGA DE SERVICIO',
        });
      } else {
        alert('⚠️ Esta OT no tiene un registro vinculado en productividad.\n\nSe quitará de pendientes pero no se actualizará en productividad.');
      }

      // Notificar al componente padre para llenar formulario si quiere
      if (onOTAgendada) {
        onOTAgendada(ot);
      }
      
      // 🆕 QUITAR DE PENDIENTES
      setPendientes(prev => prev.filter(p => p.id !== ot.id));
      alert('✅ OT actualizada en productividad y quitada de pendientes');
    }
  };

  const editarPendiente = (ot) => {
    setNuevaOT({
      numeroOT: ot.numeroOT,
      cliente: ot.cliente,
      ciudad: ot.ciudad,
      direccion: ot.direccion,
      contacto: ot.contacto,
      telefono: ot.telefono,
      lider: ot.lider || '',
      observaciones: ot.observaciones,
      intentos: ot.intentos
    });
    setEditando(ot.id);
  };

  const limpiarFormulario = () => {
    setNuevaOT({
      numeroOT: '',
      cliente: '',
      ciudad: '',
      direccion: '',
      contacto: '',
      telefono: '',
      lider: '',
      observaciones: '',
      intentos: 0
    });
    setEditando(null);
  };

  const obtenerPendientesFiltrados = () => {
    const ahoraDate = new Date(ahora);
    const hoy = new Date(ahoraDate.getFullYear(), ahoraDate.getMonth(), ahoraDate.getDate());
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const inicioDeSemana = new Date(hoy);
    inicioDeSemana.setDate(inicioDeSemana.getDate() - inicioDeSemana.getDay());

    return pendientes.filter(ot => {
      const fechaCreacion = new Date(ot.fechaCreacion);
      
      switch(filtro) {
        case 'hoy':
          return fechaCreacion >= hoy;
        case 'ayer':
          return fechaCreacion >= ayer && fechaCreacion < hoy;
        case 'semana':
          return fechaCreacion >= inicioDeSemana;
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  };

  const formatearFecha = (fecha) => {
    const ahoraDate = new Date(ahora);
    const fechaOT = new Date(fecha);
    const diffMs = ahoraDate - fechaOT;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    return fechaOT.toLocaleDateString('es-CO');
  };

  const pendientesFiltrados = obtenerPendientesFiltrados();

  const urgentCount = pendientes.filter(p => {
    const dias = Math.floor((ahora - new Date(p.fechaCreacion)) / 86400000);
    return dias >= 2;
  }).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-lg sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-7 h-7" />
                OTs Pendientes por Agendar
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                Gestiona OTs que esperan confirmación del cliente | Se registran automáticamente en productividad
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-orange-700 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Formulario */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 mb-6 border-2 border-orange-300">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              {editando ? '📝 Editar' : '➕ Agregar'} OT Pendiente
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Número OT *
                </label>
                <input
                  type="text"
                  value={nuevaOT.numeroOT}
                  onChange={(e) => setNuevaOT({...nuevaOT, numeroOT: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="22XXXXXX"
                  disabled={!!editando}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cliente *
                </label>
                <input
                  type="text"
                  value={nuevaOT.cliente}
                  onChange={(e) => setNuevaOT({...nuevaOT, cliente: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="CLARO, TIGO..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={nuevaOT.ciudad}
                  onChange={(e) => setNuevaOT({...nuevaOT, ciudad: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Bogotá, Medellín..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Contacto
                </label>
                <input
                  type="text"
                  value={nuevaOT.contacto}
                  onChange={(e) => setNuevaOT({...nuevaOT, contacto: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nombre contacto"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={nuevaOT.telefono}
                  onChange={(e) => setNuevaOT({...nuevaOT, telefono: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="300XXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <UserCheck className="w-4 h-4" />
                  Líder Asignado
                </label>
                <input
                  type="text"
                  value={nuevaOT.lider}
                  onChange={(e) => setNuevaOT({...nuevaOT, lider: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nombre del líder"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={nuevaOT.direccion}
                  onChange={(e) => setNuevaOT({...nuevaOT, direccion: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Calle XX # XX-XX"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={nuevaOT.observaciones}
                onChange={(e) => setNuevaOT({...nuevaOT, observaciones: e.target.value})}
                className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows="2"
                placeholder="Notas sobre por qué está pendiente..."
              />
            </div>

            <div className="flex gap-3 mt-4">
              {editando ? (
                <>
                  <button
                    onClick={actualizarPendiente}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    ✅ Actualizar
                  </button>
                  <button
                    onClick={limpiarFormulario}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={agregarPendiente}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  ➕ Agregar a Pendientes
                </button>
              )}
            </div>

            <div className="mt-3 bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-xs text-blue-800 font-semibold">
                💡 Al agregar, se creará automáticamente en Productividad con estado "Pendiente". Al marcar como "Agendada", se actualizará el estado sin crear duplicados.
              </p>
            </div>
          </div>

          {/* Estadísticas y Lista */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Estadísticas */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-4 border-2 border-orange-400">
                  <div className="text-xs text-orange-700 font-semibold mb-1">TOTAL PENDIENTES</div>
                  <div className="text-3xl font-bold text-orange-700">
                    {pendientes.length}
                  </div>
                  <div className="text-sm text-orange-600 font-medium">En espera</div>
                </div>

                <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-4 border-2 border-red-400">
                  <div className="text-xs text-red-700 font-semibold mb-1">URGENTES</div>
                  <div className="text-3xl font-bold text-red-700">
                    {urgentCount}
                  </div>
                  <div className="text-sm text-red-600 font-medium">+2 Días</div>
                </div>
              </div>

              {/* Filtros */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setFiltro('todas')}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                    filtro === 'todas'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todas ({pendientes.length})
                </button>
                <button
                  onClick={() => setFiltro('hoy')}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                    filtro === 'hoy'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📅 Hoy
                </button>
                <button
                  onClick={() => setFiltro('ayer')}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                    filtro === 'ayer'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📆 Ayer
                </button>
                <button
                  onClick={() => setFiltro('semana')}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                    filtro === 'semana'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📊 Semana
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="lg:col-span-9">
              {pendientesFiltrados.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {filtro === 'todas' ? 'No hay OTs pendientes' : `No hay OTs de ${filtro}`}
                  </h3>
                  <p className="text-gray-500">
                    {filtro === 'todas' 
                      ? 'Agrega OTs que están esperando confirmación del cliente'
                      : 'Cambia el filtro para ver otras OTs pendientes'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendientesFiltrados.map(ot => {
                    const dias = Math.floor((ahora - new Date(ot.fechaCreacion)) / 86400000);
                    const urgente = dias >= 2;
                    const muchoIntentos = ot.intentos >= 3;
                    
                    return (
                      <div
                        key={ot.id}
                        className={`border-2 rounded-lg p-4 transition hover:shadow-lg ${
                          urgente
                            ? 'border-red-400 bg-red-50'
                            : muchoIntentos
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-orange-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="text-lg font-bold text-gray-800">
                                OT {ot.numeroOT}
                              </h4>
                              {urgente && (
                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                  ⚠️ URGENTE
                                </span>
                              )}
                              {muchoIntentos && (
                                <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                  {ot.intentos} intentos
                                </span>
                              )}
                              {ot.lider && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" />
                                  {ot.lider}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-orange-700">
                              {ot.cliente}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatearFecha(ot.fechaCreacion)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          {ot.ciudad && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="font-medium">📍</span>
                              {ot.ciudad}
                            </div>
                          )}
                          {ot.contacto && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <User className="w-3 h-3" />
                              {ot.contacto}
                            </div>
                          )}
                          {ot.telefono && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="w-3 h-3" />
                              {ot.telefono}
                            </div>
                          )}
                          {ot.direccion && (
                            <div className="flex items-center gap-1 text-gray-600 col-span-2">
                              <span className="font-medium">📍</span>
                              {ot.direccion}
                            </div>
                          )}
                        </div>

                        {ot.observaciones && (
                          <div className="bg-gray-100 rounded p-2 mb-3">
                            <p className="text-xs text-gray-700">
                              <span className="font-semibold">Obs:</span> {ot.observaciones}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => marcarComoAgendada(ot)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Agendada
                          </button>
                          <button
                            onClick={() => registrarIntento(ot.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg font-semibold transition flex items-center gap-1"
                          >
                            <Phone className="w-4 h-4" />
                            Intentó ({ot.intentos})
                          </button>
                          <button
                            onClick={() => editarPendiente(ot)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2 px-3 rounded-lg font-semibold transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminarPendiente(ot.id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg font-semibold transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Instrucciones */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Cómo funciona ahora:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Al agregar OT pendiente → Se crea automáticamente en Productividad con estado "Pendiente"</li>
              <li>La OT se MANTIENE en pendientes hasta que la marques como "Agendada"</li>
              <li>Registra cada intento de llamada con el botón "Intentó"</li>
              <li>Cuando logres agendar, marca como "Agendada" → Se ACTUALIZA en productividad (NO crea duplicado)</li>
              <li>Al marcar "Agendada", se quita de esta lista automáticamente</li>
              <li>Las OTs urgentes (2+ días) se marcan en rojo</li>
              <li>Usa el campo "Líder" para asignar responsable y mejor seguimiento</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTsPendientes;
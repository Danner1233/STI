import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Copy, Eye, Save } from 'lucide-react';

const PlantillasCorreo = ({ onClose }) => {
  const [plantillas, setPlantillas] = useState(() => {
    const saved = localStorage.getItem('plantillas-correo');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            nombre: 'Entrega de Servicio',
            tipo: 'ENTREGA DE SERVICIO',
            asunto: 'CLARO COLOMBIA ENTREGA DE SERVICIO-{cliente}- OT {numeroOT}',
            cuerpo: `Buen dia

Señores

{cliente}

Queremos confirmarle la actividad de {tipoServicio} para la sede relacionada en el cuadro. Le solicitamos permisos de ingreso tanto administrativos como tecnicos para el ingreso a la sede en mencion.

Se requiere de un acompañamiento para realizar pruebas pertinentes.

Duracion de la actividad: {duracion}

Datos de la OT:
- OT: {numeroOT}
- Fecha: {fecha}
- Hora: {hora}
- Ciudad: {ciudad}
- Direccion: {direccion}

Consideramos oportuno recordarle que para que esta obra pueda completarse es necesario solicitar acompañamiento por parte del personal de mantenimiento de las instalaciones.

Quedamos atentos.`,
            activa: true,
          },
          {
            id: 2,
            nombre: 'Mantenimiento Preventivo',
            tipo: 'MANTENIMIENTO PREVENTIVO',
            asunto: 'CLARO COLOMBIA MANTENIMIENTO PREVENTIVO-{cliente}- OT {numeroOT}',
            cuerpo: `Buen dia

Señores

{cliente}

Queremos confirmarle la actividad de MANTENIMIENTO PREVENTIVO para la sede relacionada.

OT: {numeroOT}
Fecha: {fecha}
Hora: {hora}
Ubicacion: {ciudad} - {direccion}

Duracion estimada: {duracion}

Por favor confirmar disponibilidad de personal de acompañamiento.

Saludos,`,
            activa: true,
          },
          {
            id: 3,
            nombre: 'Instalación Nueva',
            tipo: 'INSTALACION',
            asunto: 'CLARO COLOMBIA INSTALACIÓN NUEVA-{cliente}- OT {numeroOT}',
            cuerpo: `Buen dia

Señores

{cliente}

Queremos confirmarle la instalación programada para:

OT: {numeroOT}
Fecha: {fecha}
Hora: {hora}
Sede: {ciudad} - {direccion}

Tiempo estimado: {duracion}

Requerimos:
- Acceso a la sede
- Personal de acompañamiento
- Espacio de trabajo

Quedamos atentos a su confirmación.`,
            activa: true,
          },
        ];
  });

  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  const [formPlantilla, setFormPlantilla] = useState({
    nombre: '',
    tipo: '',
    asunto: '',
    cuerpo: '',
    activa: true,
  });

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('plantillas-correo', JSON.stringify(plantillas));
  }, [plantillas]);

  // Cargar plantilla para editar
  const cargarPlantilla = (plantilla) => {
    setPlantillaSeleccionada(plantilla);
    setFormPlantilla({
      nombre: plantilla.nombre,
      tipo: plantilla.tipo,
      asunto: plantilla.asunto,
      cuerpo: plantilla.cuerpo,
      activa: plantilla.activa,
    });
    setModoEdicion(true);
  };

  // Guardar plantilla (nueva o editada)
  const guardarPlantilla = () => {
    if (!formPlantilla.nombre || !formPlantilla.tipo || !formPlantilla.asunto || !formPlantilla.cuerpo) {
      alert('⚠️ Completa todos los campos');
      return;
    }

    if (plantillaSeleccionada) {
      // Editar existente
      setPlantillas((prev) =>
        prev.map((p) =>
          p.id === plantillaSeleccionada.id
            ? { ...p, ...formPlantilla }
            : p
        )
      );
      alert('✅ Plantilla actualizada');
    } else {
      // Crear nueva
      const nueva = {
        id: Date.now(),
        ...formPlantilla,
      };
      setPlantillas((prev) => [...prev, nueva]);
      alert('✅ Plantilla creada');
    }

    limpiarFormulario();
  };

  // Eliminar plantilla
  const eliminarPlantilla = (id) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      setPlantillas((prev) => prev.filter((p) => p.id !== id));
      alert('✅ Plantilla eliminada');
    }
  };

  // Duplicar plantilla
  const duplicarPlantilla = (plantilla) => {
    const duplicada = {
      id: Date.now(),
      nombre: `${plantilla.nombre} (Copia)`,
      tipo: plantilla.tipo,
      asunto: plantilla.asunto,
      cuerpo: plantilla.cuerpo,
      activa: plantilla.activa,
    };
    setPlantillas((prev) => [...prev, duplicada]);
    alert('✅ Plantilla duplicada');
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormPlantilla({
      nombre: '',
      tipo: '',
      asunto: '',
      cuerpo: '',
      activa: true,
    });
    setPlantillaSeleccionada(null);
    setModoEdicion(false);
  };

  // Vista previa con datos de ejemplo
  const generarVistaPrevia = () => {
    const datosEjemplo = {
      numeroOT: '22488009',
      cliente: 'CLARO',
      ciudad: 'Bogotá',
      direccion: 'Calle 100 #10-20',
      fecha: 'Lunes 10 de febrero de 2026',
      hora: '09:00 AM',
      tipoServicio: formPlantilla.tipo || 'ENTREGA DE SERVICIO',
      duracion: '4-8 horas',
    };

    let asuntoPreview = formPlantilla.asunto;
    let cuerpoPreview = formPlantilla.cuerpo;

    Object.entries(datosEjemplo).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      asuntoPreview = asuntoPreview.replace(regex, value);
      cuerpoPreview = cuerpoPreview.replace(regex, value);
    });

    return { asunto: asuntoPreview, cuerpo: cuerpoPreview };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={32} />
              <div>
                <h2 className="text-2xl font-bold">📝 Plantillas de Correo</h2>
                <p className="text-sm text-purple-100">Personaliza tus correos de agendamiento</p>
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

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Plantillas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Mis Plantillas ({plantillas.length})</h3>
                <button
                  onClick={limpiarFormulario}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                >
                  <Plus size={18} />
                  Nueva
                </button>
              </div>

              <div className="space-y-3">
                {plantillas.map((plantilla) => (
                  <div
                    key={plantilla.id}
                    className={`border-2 rounded-lg p-4 transition ${
                      plantillaSeleccionada?.id === plantilla.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{plantilla.nombre}</h4>
                        <p className="text-sm text-gray-600">{plantilla.tipo}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          plantilla.activa
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {plantilla.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => cargarPlantilla(plantilla)}
                        className="flex-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-semibold transition flex items-center justify-center gap-1"
                      >
                        <Edit size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => duplicarPlantilla(plantilla)}
                        className="flex-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-semibold transition flex items-center justify-center gap-1"
                      >
                        <Copy size={14} />
                        Duplicar
                      </button>
                      <button
                        onClick={() => eliminarPlantilla(plantilla.id)}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-semibold transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Variables Disponibles */}
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2">📋 Variables Disponibles</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white rounded px-2 py-1 font-mono text-blue-700">{'{numeroOT}'}</div>
                  <div className="bg-white rounded px-2 py-1 font-mono text-blue-700">{'{cliente}'}</div>
                  <div className="bg-white rounded px-2 py-1 font-mono text-blue-700">{'{ciudad}'}</div>
                  <div className="bg-white rounded px-2 py-1 font-mono text-blue-700">{'{direccion}'}</div>
                  <div className="bg-white rounded px-2 py-1 font-mono text-blue-700">{'{fecha}'}</div>
                  <div className="bg-white rounded px-2 py-1 font-mono text-blue-700">{'{hora}'}</div>
                  <div className="bg-white rounded px-2 py-1 font-mono text-blue-700">{'{tipoServicio}'}</div>
                  <div className="bg-white rounded px-2 py-1 font-mono text-blue-700">{'{duracion}'}</div>
                </div>
              </div>
            </div>

            {/* Editor de Plantilla */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {modoEdicion ? '✏️ Editar Plantilla' : '➕ Nueva Plantilla'}
              </h3>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre de la Plantilla *
                  </label>
                  <input
                    type="text"
                    value={formPlantilla.nombre}
                    onChange={(e) => setFormPlantilla((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Entrega de Servicio"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tipo de Servicio *
                  </label>
                  <input
                    type="text"
                    value={formPlantilla.tipo}
                    onChange={(e) => setFormPlantilla((prev) => ({ ...prev, tipo: e.target.value }))}
                    placeholder="Ej: ENTREGA DE SERVICIO"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Asunto */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Asunto del Correo *
                  </label>
                  <input
                    type="text"
                    value={formPlantilla.asunto}
                    onChange={(e) => setFormPlantilla((prev) => ({ ...prev, asunto: e.target.value }))}
                    placeholder="Usa variables: {numeroOT}, {cliente}, etc."
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Cuerpo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Cuerpo del Correo *
                  </label>
                  <textarea
                    value={formPlantilla.cuerpo}
                    onChange={(e) => setFormPlantilla((prev) => ({ ...prev, cuerpo: e.target.value }))}
                    placeholder="Escribe el contenido del correo. Usa variables como {numeroOT}, {cliente}, {fecha}, etc."
                    rows="12"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-mono text-sm"
                  />
                </div>

                {/* Activa */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formPlantilla.activa}
                    onChange={(e) => setFormPlantilla((prev) => ({ ...prev, activa: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-semibold text-gray-700">Plantilla activa</label>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={guardarPlantilla}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Save size={18} />
                    {modoEdicion ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setVistaPrevia(!vistaPrevia)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                  >
                    <Eye size={18} />
                    Vista Previa
                  </button>
                  {modoEdicion && (
                    <button
                      onClick={limpiarFormulario}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {/* Vista Previa */}
                {vistaPrevia && (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-2">👁️ Vista Previa (con datos de ejemplo)</h4>
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Asunto:</p>
                        <p className="text-sm font-semibold text-gray-800">{generarVistaPrevia().asunto}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Cuerpo:</p>
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                          {generarVistaPrevia().cuerpo}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 border-t px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            💡 Las plantillas se guardan automáticamente en tu navegador
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

export default PlantillasCorreo;
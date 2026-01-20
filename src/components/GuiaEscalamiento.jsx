import React, { useState, useEffect, useRef } from 'react';
import { Plus, ExternalLink, Edit2, Trash2, Search, BookOpen, AlertCircle, CheckCircle, Link as LinkIcon } from 'lucide-react';

const GuiaEscalamiento = ({ onClose }) => {
  const [guias, setGuias] = useState(() => {
    const saved = localStorage.getItem('guias-escalamiento');
    return saved ? JSON.parse(saved) : [
      {
        id: 1737400000000, // Static ID for example guide
        titulo: 'Escalar cupo urgente en Consensus',
        categoria: 'Consensus',
        pasos: [
          'Verificar que realmente no hay cupos disponibles',
          'Contactar a coordinador de zona',
          'Si no responde, escalar a gerente regional',
          'Usar plantilla de correo de escalamiento urgente'
        ],
        links: [
          { nombre: 'Portal Consensus', url: 'http://consensusapp.com.co:5000/' },
          { nombre: 'WhatsApp Coordinador', url: 'https://wa.me/573001234567' }
        ],
        notas: 'Solo usar en casos urgentes. Debe haber justificación clara.',
        prioridad: 'alta'
      }
    ];
  });

  // Use ref to store next ID counter
  const nextIdRef = useRef(() => {
    // Initialize with current timestamp or last used ID + 1
    const saved = localStorage.getItem('guias-escalamiento');
    if (saved) {
      const parsed = JSON.parse(saved);
      const maxId = parsed.reduce((max, guia) => Math.max(max, guia.id), 0);
      return maxId + 1;
    }
    return Date.now();
  });

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'Consensus',
    pasos: [''],
    links: [{ nombre: '', url: '' }],
    notas: '',
    prioridad: 'media'
  });

  useEffect(() => {
    localStorage.setItem('guias-escalamiento', JSON.stringify(guias));
  }, [guias]);

  const handleAgregarGuia = () => {
    if (!formData.titulo.trim()) {
      alert('⚠️ El título es obligatorio');
      return;
    }

    const pasosLimpios = formData.pasos.filter(p => p.trim() !== '');
    if (pasosLimpios.length === 0) {
      alert('⚠️ Agrega al menos un paso');
      return;
    }

    // Generate ID using ref counter (allowed in event handlers)
    let nuevoId;
    if (editando) {
      nuevoId = editando.id;
    } else {
      nuevoId = nextIdRef.current;
      nextIdRef.current = nextIdRef.current + 1;
    }
    
    const nuevaGuia = {
      id: nuevoId,
      ...formData,
      pasos: pasosLimpios,
      links: formData.links.filter(l => l.nombre.trim() !== '' && l.url.trim() !== '')
    };

    if (editando) {
      setGuias(guias.map(g => g.id === editando.id ? nuevaGuia : g));
    } else {
      setGuias([nuevaGuia, ...guias]);
    }

    resetForm();
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Eliminar esta guía de escalamiento?')) {
      setGuias(guias.filter(g => g.id !== id));
    }
  };

  const handleEditar = (guia) => {
    setEditando(guia);
    setFormData({
      titulo: guia.titulo,
      categoria: guia.categoria,
      pasos: guia.pasos.length > 0 ? guia.pasos : [''],
      links: guia.links.length > 0 ? guia.links : [{ nombre: '', url: '' }],
      notas: guia.notas,
      prioridad: guia.prioridad
    });
    setMostrarForm(true);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      categoria: 'Consensus',
      pasos: [''],
      links: [{ nombre: '', url: '' }],
      notas: '',
      prioridad: 'media'
    });
    setEditando(null);
    setMostrarForm(false);
  };

  const agregarPaso = () => {
    setFormData({ ...formData, pasos: [...formData.pasos, ''] });
  };

  const actualizarPaso = (index, valor) => {
    const nuevosPasos = [...formData.pasos];
    nuevosPasos[index] = valor;
    setFormData({ ...formData, pasos: nuevosPasos });
  };

  const eliminarPaso = (index) => {
    setFormData({ ...formData, pasos: formData.pasos.filter((_, i) => i !== index) });
  };

  const agregarLink = () => {
    setFormData({ ...formData, links: [...formData.links, { nombre: '', url: '' }] });
  };

  const actualizarLink = (index, campo, valor) => {
    const nuevosLinks = [...formData.links];
    nuevosLinks[index][campo] = valor;
    setFormData({ ...formData, links: nuevosLinks });
  };

  const eliminarLink = (index) => {
    setFormData({ ...formData, links: formData.links.filter((_, i) => i !== index) });
  };

  const guiasFiltradas = guias.filter(g =>
    g.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    g.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
    g.pasos.some(p => p.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baja': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <BookOpen size={28} />
              <h2 className="text-2xl font-bold">📚 Guía de Escalamiento</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              ✕
            </button>
          </div>
          <p className="text-purple-100 text-sm">
            Procedimientos paso a paso para escalar cuando no hay cupos o necesitas ayuda urgente
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!mostrarForm ? (
            <>
              {/* Buscador y botón nuevo */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar guías por título, categoría o contenido..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={() => setMostrarForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
                >
                  <Plus size={20} />
                  Nueva Guía
                </button>
              </div>

              {/* Lista de guías */}
              {guiasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">
                    {busqueda ? 'No se encontraron guías' : 'No hay guías guardadas'}
                  </p>
                  <p className="text-sm">
                    {busqueda ? 'Intenta con otros términos' : 'Crea tu primera guía de escalamiento'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {guiasFiltradas.map((guia) => (
                    <div
                      key={guia.id}
                      className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition"
                    >
                      {/* Header de la guía */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{guia.titulo}</h3>
                            <span className={`text-xs font-semibold px-2 py-1 rounded border ${getPrioridadColor(guia.prioridad)}`}>
                              {guia.prioridad === 'alta' ? '🔴 Alta' : guia.prioridad === 'media' ? '🟡 Media' : '🟢 Baja'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            📁 {guia.categoria}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditar(guia)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleEliminar(guia.id)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Pasos */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <CheckCircle size={18} className="text-green-600" />
                          Pasos a seguir:
                        </h4>
                        <ol className="space-y-2">
                          {guia.pasos.map((paso, idx) => (
                            <li key={idx} className="flex gap-3">
                              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-gray-700 flex-1">{paso}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Links */}
                      {guia.links.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <LinkIcon size={18} className="text-blue-600" />
                            Links útiles:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {guia.links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                              >
                                <ExternalLink size={16} />
                                {link.nombre}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notas */}
                      {guia.notas && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                          <div className="flex items-start gap-2">
                            <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-amber-900 mb-1">⚠️ Notas importantes:</p>
                              <p className="text-sm text-amber-800">{guia.notas}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Formulario */
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {editando ? '✏️ Editar Guía' : '➕ Nueva Guía de Escalamiento'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition"
                >
                  ← Volver
                </button>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Escalar cupo urgente en Consensus"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Categoría y Prioridad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📁 Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Consensus">Consensus</option>
                    <option value="Zoho">Zoho</option>
                    <option value="Clientes">Clientes</option>
                    <option value="Técnicos">Técnicos</option>
                    <option value="Emergencias">Emergencias</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎯 Prioridad
                  </label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Media</option>
                    <option value="baja">🟢 Baja</option>
                  </select>
                </div>
              </div>

              {/* Pasos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ✅ Pasos a seguir *
                </label>
                {formData.pasos.map((paso, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={paso}
                      onChange={(e) => actualizarPaso(idx, e.target.value)}
                      placeholder={`Paso ${idx + 1}`}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {formData.pasos.length > 1 && (
                      <button
                        onClick={() => eliminarPaso(idx)}
                        className="text-red-600 hover:bg-red-50 px-3 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={agregarPaso}
                  className="text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  Agregar paso
                </button>
              </div>

              {/* Links */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔗 Links útiles (opcional)
                </label>
                {formData.links.map((link, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={link.nombre}
                      onChange={(e) => actualizarLink(idx, 'nombre', e.target.value)}
                      placeholder="Nombre del link"
                      className="w-1/3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => actualizarLink(idx, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <button
                      onClick={() => eliminarLink(idx)}
                      className="text-red-600 hover:bg-red-50 px-3 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={agregarLink}
                  className="text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  Agregar link
                </button>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ⚠️ Notas importantes (opcional)
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Precauciones, condiciones especiales, información adicional..."
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAgregarGuia}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  {editando ? '💾 Guardar Cambios' : '➕ Crear Guía'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuiaEscalamiento;
import React, { useState } from 'react';

const ModalSelectorCC = ({ 
  contactosGuardados, 
  copiaCC,
  onAgregar,
  onClose,
  onAbrirGestionContactos
}) => {
  const [contactosSeleccionados, setContactosSeleccionados] = useState([]);

  const toggleContacto = (contacto) => {
    const yaAgregado = copiaCC.some(c => c.email === contacto.email);
    if (yaAgregado) return;

    const isSelected = contactosSeleccionados.some(c => c.email === contacto.email);
    
    if (isSelected) {
      setContactosSeleccionados(prev => 
        prev.filter(c => c.email !== contacto.email)
      );
    } else {
      setContactosSeleccionados(prev => [...prev, contacto]);
    }
  };

  const handleAgregar = () => {
    onAgregar(contactosSeleccionados);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Seleccionar Múltiples Contactos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Selecciona todos los contactos que recibirán copia del correo
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              ✅ Seleccionados: <strong>{contactosSeleccionados.length}</strong> contactos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contactosGuardados.map((contacto, index) => {
              const isSelected = contactosSeleccionados.some(c => c.email === contacto.email);
              const yaAgregado = copiaCC.some(c => c.email === contacto.email);
              
              return (
                <div
                  key={index}
                  onClick={() => toggleContacto(contacto)}
                  className={`
                    border-2 rounded-lg p-3 cursor-pointer transition
                    ${yaAgregado 
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50' 
                      : isSelected 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-white border-gray-200 hover:border-blue-400'
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                      ${yaAgregado
                        ? 'bg-gray-300 border-gray-400'
                        : isSelected 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }
                    `}>
                      {(isSelected || yaAgregado) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {contacto.nombre}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {contacto.email}
                      </p>
                      {yaAgregado && (
                        <p className="text-xs text-green-600 mt-1">
                          Ya agregado ✓
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {contactosGuardados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                No hay contactos guardados
              </p>
              <button
                onClick={() => {
                  onClose();
                  onAbrirGestionContactos();
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Agregar Contactos
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregar}
            disabled={contactosSeleccionados.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Agregar {contactosSeleccionados.length > 0 && `(${contactosSeleccionados.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSelectorCC;

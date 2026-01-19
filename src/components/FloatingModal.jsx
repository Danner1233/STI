import React, { useState } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';

const FloatingModal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon,
  children,
  defaultWidth = 'max-w-4xl',
  defaultHeight = 'max-h-[85vh]',
  color = 'blue'
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const colorClasses = {
    blue: 'from-blue-600 to-indigo-600',
    cyan: 'from-cyan-600 to-blue-600',
    orange: 'from-orange-600 to-red-600',
    purple: 'from-purple-600 to-pink-600',
    green: 'from-green-600 to-emerald-600',
    indigo: 'from-indigo-600 to-purple-600',
    red: 'from-red-600 to-orange-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop con blur */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Flotante */}
      <div 
        className={`
          relative bg-white rounded-xl shadow-2xl
          ${isMaximized ? 'w-[95vw] h-[95vh]' : isMinimized ? 'w-80 h-auto' : `w-full ${defaultWidth} ${defaultHeight}`}
          transition-all duration-300 ease-in-out
          flex flex-col
          border-2 border-gray-200
        `}
      >
        {/* Header con gradiente */}
        <div className={`
          bg-gradient-to-r ${colorClasses[color]}
          text-white p-4 rounded-t-xl
          flex items-center justify-between
          cursor-move
          shadow-lg
        `}>
          <div className="flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          
          {/* Botones de control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              title={isMinimized ? "Expandir" : "Minimizar"}
            >
              <Minimize2 size={18} />
            </button>
            
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              title={isMaximized ? "Restaurar" : "Maximizar"}
            >
              <Maximize2 size={18} />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              title="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Contenido */}
        {!isMinimized && (
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingModal;

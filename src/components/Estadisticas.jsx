import React from 'react';
import { Calendar, TrendingUp, CheckCircle } from 'lucide-react';

const Estadisticas = ({ hoyCount, semanaCount, mesCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Hoy</p>
            <p className="text-3xl font-bold text-blue-600">
              {hoyCount}
            </p>
          </div>
          <Calendar className="text-blue-400" size={40} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Esta Semana</p>
            <p className="text-3xl font-bold text-green-600">
              {semanaCount}
            </p>
          </div>
          <TrendingUp className="text-green-400" size={40} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Este Mes</p>
            <p className="text-3xl font-bold text-purple-600">
              {mesCount}
            </p>
          </div>
          <CheckCircle className="text-purple-400" size={40} />
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;

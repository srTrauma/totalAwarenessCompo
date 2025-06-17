import React, { useState, useEffect } from 'react';

export default function SystemStatus() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (response.ok) {
        setHealthData(data);
      } else {
        setError(data.message || 'Error desconocido');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">🔧 Estado del Sistema</h1>
            <p className="text-blue-100">Total Awareness - Diagnóstico y Configuración</p>
          </div>

          <div className="p-6">
            {healthData && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Estado General</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{healthData.status === 'OK' ? '✅' : '❌'}</span>
                    <span className={`font-bold ${healthData.status === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                      {healthData.status}
                    </span>
                    <span className="text-gray-600">- {healthData.message}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">💡 Recomendaciones</h2>
                  <ul className="space-y-2">
                    {healthData.recommendations && healthData.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">🧪 Pruebas</h2>
                  <div className="space-y-2">
                    <a 
                      href="/test-forgot-password"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2 inline-block"
                    >
                      📧 Test Forgot Password
                    </a>
                    <button 
                      onClick={fetchHealthData}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      🔄 Actualizar Estado
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <a 
                href="/"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                🏠 Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

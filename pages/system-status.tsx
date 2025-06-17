import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface HealthData {
  status: string;
  message: string;
  config: {
    nodeEnv: string;
    baseUrl: string;
    emailConfigured: {
      user: boolean;
      pass: boolean;
      host: string;
      port: string;
    };
    database: {
      url: boolean;
      type: string;
    };
    cloudinary: {
      configured: boolean;
    };
    timestamp: string;
  };
  recommendations: string[];
}

export default function SystemStatus() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

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
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'OK' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    return status === 'OK' ? '✅' : '❌';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">🔧 Estado del Sistema</h1>
            <p className="text-blue-100">Total Awareness - Diagnóstico y Configuración</p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Verificando sistema...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> {error}
                <button 
                  onClick={fetchHealthData}
                  className="ml-4 text-red-600 hover:text-red-800 underline"
                >
                  Reintentar
                </button>
              </div>
            ) : healthData ? (
              <div className="space-y-6">
                {/* Estado General */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Estado General</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getStatusIcon(healthData.status)}</span>
                    <span className={`font-bold ${getStatusColor(healthData.status)}`}>
                      {healthData.status}
                    </span>
                    <span className="text-gray-600">- {healthData.message}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Última verificación: {new Date(healthData.config.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Configuración de Email */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">📧 Configuración de Email</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Usuario:</span>
                      <span className={`ml-2 ${healthData.config.emailConfigured.user ? 'text-green-600' : 'text-red-600'}`}>
                        {healthData.config.emailConfigured.user ? '✅ Configurado' : '❌ No configurado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Contraseña:</span>
                      <span className={`ml-2 ${healthData.config.emailConfigured.pass ? 'text-green-600' : 'text-red-600'}`}>
                        {healthData.config.emailConfigured.pass ? '✅ Configurada' : '❌ No configurada'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Host:</span>
                      <span className="ml-2 text-gray-600">{healthData.config.emailConfigured.host}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Puerto:</span>
                      <span className="ml-2 text-gray-600">{healthData.config.emailConfigured.port}</span>
                    </div>
                  </div>
                </div>

                {/* Base de Datos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">🗄️ Base de Datos</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Conexión:</span>
                      <span className={`ml-2 ${healthData.config.database.url ? 'text-green-600' : 'text-red-600'}`}>
                        {healthData.config.database.url ? '✅ Configurada' : '❌ No configurada'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Tipo:</span>
                      <span className="ml-2 text-gray-600">{healthData.config.database.type}</span>
                    </div>
                  </div>
                </div>

                {/* Entorno */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">🌍 Entorno</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">NODE_ENV:</span>
                      <span className="ml-2 text-gray-600">{healthData.config.nodeEnv}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">URL Base:</span>
                      <span className="ml-2 text-gray-600 break-all">{healthData.config.baseUrl || 'No configurada'}</span>
                    </div>
                  </div>
                </div>

                {/* Cloudinary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">☁️ Cloudinary</h2>
                  <span className={`${healthData.config.cloudinary.configured ? 'text-green-600' : 'text-yellow-600'}`}>
                    {healthData.config.cloudinary.configured ? '✅ Configurado' : '⚠️ No configurado (opcional)'}
                  </span>
                </div>

                {/* Recomendaciones */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">💡 Recomendaciones</h2>
                  <ul className="space-y-2">
                    {healthData.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Acciones */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">🧪 Pruebas</h2>
                  <div className="space-y-2">
                    <button 
                      onClick={() => router.push('/test-forgot-password')}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
                    >
                      📧 Test Forgot Password
                    </button>
                    <button 
                      onClick={fetchHealthData}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      🔄 Actualizar Estado
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 text-center">
              <button 
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                🏠 Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

export default function TestForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setResponse(data);

      if (!res.ok) {
        setError(data.message || 'Error desconocido');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold text-center mb-6">
                  🧪 Test Forgot Password
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="test@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Enviando...' : '📧 Enviar Reset'}
                  </button>
                </form>

                {error && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                {response && (
                  <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded">
                    <h3 className="font-semibold mb-2">📨 Respuesta del servidor:</h3>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                    
                    {response.resetUrl && (
                      <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
                        <p className="text-sm font-medium text-yellow-800 mb-2">
                          🔗 Enlace de desarrollo:
                        </p>
                        <a 
                          href={response.resetUrl}
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {response.resetUrl}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 text-sm text-gray-500">
                  <p>💡 <strong>Consejo:</strong> Abre las herramientas de desarrollo (F12) y ve a la consola para ver los logs detallados del servidor.</p>
                  <p className="mt-2">🏠 <a href="/" className="text-blue-600 hover:text-blue-800 underline">Volver al inicio</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

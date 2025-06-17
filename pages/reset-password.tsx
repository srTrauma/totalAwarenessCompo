import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { KeyIcon, EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const router = useRouter();
  const { token } = router.query;

  // Validaciones de contraseña
  const passwordValidations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: tokenToVerify,
          password: 'temp', // Solo para verificar el token
          verify: true 
        }),
      });

      setValidToken(response.status !== 400);
    } catch (error) {
      setValidToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast.error('La contraseña no cumple con los requisitos');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password,
          verify: false 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('Contraseña restablecida exitosamente');
      } else {
        toast.error(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Token inválido o expirado
  if (validToken === false) {
    return (
      <>
        <Head>
          <title>Enlace Inválido | Total Awareness</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <KeyIcon className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Enlace Inválido
            </h2>
            
            <p className="text-gray-600 mb-6">
              El enlace de recuperación es inválido o ha expirado.
            </p>
            
            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                Solicitar nuevo enlace
              </Link>
              
              <Link
                href="/Login"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-center"
              >
                Volver al Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Éxito
  if (success) {
    return (
      <>
        <Head>
          <title>Contraseña Restablecida | Total Awareness</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Contraseña Restablecida!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido restablecida exitosamente. 
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            
            <Link
              href="/Login"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Cargando verificación del token
  if (validToken === null) {
    return (
      <>
        <Head>
          <title>Verificando | Total Awareness</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando enlace...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Nueva Contraseña | Total Awareness</title>
        <meta name="description" content="Establece tu nueva contraseña" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nueva Contraseña
            </h1>
            <p className="text-gray-600">
              Crea una contraseña segura para tu cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  className="block w-full pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Validaciones de contraseña */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className={`text-xs flex items-center ${passwordValidations.length ? 'text-green-600' : 'text-red-600'}`}>
                    <CheckIcon className={`w-3 h-3 mr-1 ${passwordValidations.length ? 'opacity-100' : 'opacity-30'}`} />
                    Al menos 8 caracteres
                  </div>
                  <div className={`text-xs flex items-center ${passwordValidations.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                    <CheckIcon className={`w-3 h-3 mr-1 ${passwordValidations.uppercase ? 'opacity-100' : 'opacity-30'}`} />
                    Una letra mayúscula
                  </div>
                  <div className={`text-xs flex items-center ${passwordValidations.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                    <CheckIcon className={`w-3 h-3 mr-1 ${passwordValidations.lowercase ? 'opacity-100' : 'opacity-30'}`} />
                    Una letra minúscula
                  </div>
                  <div className={`text-xs flex items-center ${passwordValidations.number ? 'text-green-600' : 'text-red-600'}`}>
                    <CheckIcon className={`w-3 h-3 mr-1 ${passwordValidations.number ? 'opacity-100' : 'opacity-30'}`} />
                    Un número
                  </div>
                  <div className={`text-xs flex items-center ${passwordValidations.special ? 'text-green-600' : 'text-red-600'}`}>
                    <CheckIcon className={`w-3 h-3 mr-1 ${passwordValidations.special ? 'opacity-100' : 'opacity-30'}`} />
                    Un carácter especial
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  className={`block w-full pr-10 py-3 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    confirmPassword && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-600">Las contraseñas no coinciden</p>
              )}
              
              {confirmPassword && passwordsMatch && (
                <p className="mt-1 text-xs text-green-600 flex items-center">
                  <CheckIcon className="w-3 h-3 mr-1" />
                  Las contraseñas coinciden
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Restableciendo...
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/Login"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;

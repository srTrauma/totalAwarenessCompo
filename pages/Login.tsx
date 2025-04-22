import Button from "@/components/Button";
import "@/app/globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import Head from "next/head";
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  // Validar formulario
  const validateForm = () => {
    setError("");
    
    if (!username.trim()) {
      setError("El nombre de usuario es obligatorio");
      return false;
    }
    
    if (!password.trim()) {
      setError("La contraseña es obligatoria");
      return false;
    }
    
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return false;
      }
      
      if (!email.trim()) {
        setError("El email es obligatorio");
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("El formato del email no es válido");
        return false;
      }
      
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return false;
      }
    }
    
    return true;
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("¡Inicio de sesión exitoso!");
        router.push("/CompanySelection");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Error de conexión. Por favor, inténtalo de nuevo.");
    }
  }

  async function handleRegister() {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
          email,
          password,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
        setIsLogin(true);
        setPassword("");
        setUsername("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      setError("Error de conexión. Por favor, inténtalo de nuevo.");
    }
  }

  // Alternar entre formularios
  function toggleForm() {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
    if (isLogin) {
      setUsername("");
      setEmail("");
    }
  }

  useEffect(() => {
    // Si el usuario ya está logueado, redirigir a la página de selección de empresa
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      router.push("/CompanySelection");
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>{isLogin ? "Iniciar sesión" : "Registrarse"} | Total Awareness</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-sky-200 to-blue-300">
        <NavBar />

        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-12">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300 transform hover:scale-[1.02]">
            <div className="p-8">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800">
                  {isLogin ? "Iniciar sesión" : "Crear cuenta"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isLogin ? "Accede a tu cuenta" : "Únete a nosotros"}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <FaUser />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nombre de usuario"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    disabled={loading}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {!isLogin && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <FaLock />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar contraseña"
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <FaEnvelope />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico"
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        disabled={loading}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.01] focus:outline-none disabled:opacity-50"
                >
                  {loading ? "Procesando..." : isLogin ? "Iniciar sesión" : "Crear cuenta"}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
                  <button
                    onClick={toggleForm}
                    className="ml-1 text-blue-600 hover:text-blue-800 font-semibold focus:outline-none"
                  >
                    {isLogin ? "Regístrate" : "Inicia sesión"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { FaUser, FaEnvelope, FaLock, FaCamera, FaSave, FaArrowLeft } from "react-icons/fa";
import "@/app/globals.css";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Estados para el formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Estados para la foto de perfil
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/Login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setName(parsedUser.name);
    setEmail(parsedUser.email);
    fetchUserProfile(parsedUser.id);
  }, [router]);

  async function fetchUserProfile(userId: number) {
    try {
      const response = await fetch(`/api/profile?userId=${userId}`, {
        headers: {
          userid: userId.toString()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setName(data.name);
        setEmail(data.email);
      } else {
        setError("Error al cargar el perfil");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile() {
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!email.trim()) {
      setError("El email es obligatorio");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("El formato del email no es válido");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          userid: user!.id.toString()
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim()
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        
        // Actualizar localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setSuccess("Perfil actualizado correctamente");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Todos los campos de contraseña son obligatorios");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las nuevas contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/profile/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          userid: user!.id.toString()
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      if (response.ok) {
        setSuccess("Contraseña cambiada correctamente");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setSaving(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Cargando perfil... | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Mi Perfil | Total Awareness</title>
      </Head>
      
      <NavBar />
      
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 mb-6 hover:underline"
          >
            <FaArrowLeft className="mr-2" /> Volver
          </button>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información básica */}
                <div>
                  <h2 className="text-lg font-medium mb-4">Información básica</h2>
                  
                  {/* Foto de perfil */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto de perfil
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        {previewImage ? (
                          <img src={previewImage} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                          <FaUser className="text-blue-600 text-2xl" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="profile-image"
                        />
                        <label
                          htmlFor="profile-image"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <FaCamera className="mr-2" />
                          Cambiar foto
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tu nombre"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      <FaSave className="mr-2" />
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </div>

                {/* Cambiar contraseña */}
                <div>
                  <h2 className="text-lg font-medium mb-4">Cambiar contraseña</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña actual
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Contraseña actual"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nueva contraseña"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar nueva contraseña
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Confirmar nueva contraseña"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                    >
                      <FaLock className="mr-2" />
                      {saving ? "Cambiando..." : "Cambiar contraseña"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Información de cuenta */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-medium mb-4">Información de cuenta</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ID de usuario</dt>
                      <dd className="text-gray-900">{user?.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Fecha de registro</dt>
                      <dd className="text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
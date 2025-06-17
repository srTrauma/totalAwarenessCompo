import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import { FaUser, FaEnvelope, FaLock, FaSave, FaArrowLeft, FaBuilding, FaSignOutAlt, FaCrown, FaUserShield } from "react-icons/fa";


interface User {
  id: number;
  name: string;
  email: string;
  profileImage?: string;
  faqProfile?: string;
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
  const [faqProfile, setFaqProfile] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      router.push("/Login");
      return;
    }    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setName(parsedUser.name);
    setEmail(parsedUser.email);
    setFaqProfile(parsedUser.faqProfile || "");
    fetchUserProfile(parsedUser.id);
    fetchUserCompanies(parsedUser.id);
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
        // Actualizar la información del usuario
        setUser(prev => ({ 
          ...prev, 
          ...data, 
          faqProfile: data.faqProfile || prev?.faqProfile || "" 
        }));
        setFaqProfile(data.faqProfile || "");
      } else {
        setError("Error al cargar el perfil del usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserCompanies(userId: number) {
    try {
      setLoadingCompanies(true);
      const response = await fetch(`/api/companies/list?userId=${userId}`, {
        headers: {
          userid: userId.toString()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        console.error("Error al cargar empresas del usuario");
      }
    } catch (error) {
      console.error("Error al cargar empresas:", error);
    } finally {
      setLoadingCompanies(false);
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
        },        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          faqProfile: faqProfile.trim()
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
          // Actualizar sessionStorage
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        
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
    }  }

  const handleProfileImageChange = (imageUrl: string | null) => {
    setUser(prev => prev ? { ...prev, profileImage: imageUrl || undefined } : null);
  };

  async function leaveCompany(companyId: number, companyName: string) {
    if (!confirm(`¿Estás seguro de que quieres salir de la empresa "${companyName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setLoadingCompanies(true);
      const response = await fetch("/api/companies/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userid: user!.id.toString()
        },
        body: JSON.stringify({
          companyId: companyId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        
        // Recargar la lista de empresas
        await fetchUserCompanies(user!.id);
        
        // Si era la empresa seleccionada, limpiar la selección
        const selectedCompany = sessionStorage.getItem("selectedCompany");
        if (selectedCompany && Number(selectedCompany) === companyId) {
          sessionStorage.removeItem("selectedCompany");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al salir de la empresa");
      }
    } catch (error) {
      console.error("Error al salir de la empresa:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoadingCompanies(false);
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
                <div>                  <h2 className="text-lg font-medium mb-4">Información básica</h2>
                  
                  {/* Foto de perfil */}                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto de perfil
                    </label>
                    <ProfileImageUpload
                      userId={user?.id || 0}
                      currentImage={user?.profileImage}
                      onImageChange={handleProfileImageChange}
                    />
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
                    </div>                    <div>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Perfil de respuesta para FAQs
                      </label>
                      <textarea
                        value={faqProfile}
                        onChange={(e) => setFaqProfile(e.target.value)}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe cómo te gustaría que el sistema responda en tu nombre (ej: formal, amigable, técnico, etc.)"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Este perfil se usará para personalizar las respuestas automáticas del FAQ
                      </p>
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

              {/* Membresías de empresas */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <FaBuilding className="mr-2 text-blue-600" />
                  Mis Empresas
                </h2>
                
                {loadingCompanies ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : companies.length > 0 ? (
                  <div className="space-y-3">
                    {companies.map((company) => (
                      <div 
                        key={company.id} 
                        className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {company.logoUrl ? (
                            <img 
                              src={company.logoUrl} 
                              alt={`${company.name} logo`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="bg-blue-100 rounded-full p-2">
                              <FaBuilding className="text-blue-600 text-sm" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{company.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                company.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                                company.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {company.role === 'OWNER' && <FaCrown className="mr-1" />}
                                {company.role === 'ADMIN' && <FaUserShield className="mr-1" />}
                                {company.role}
                              </span>
                              {company.approved ? (
                                <span className="text-green-600">Aprobado</span>
                              ) : (
                                <span className="text-yellow-600">Pendiente</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Solo mostrar botón de salir si no es el propietario */}
                        {!company.isOwner && (
                          <button
                            onClick={() => leaveCompany(company.id, company.name)}
                            disabled={loadingCompanies}
                            className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            title="Salir de la empresa"
                          >
                            <FaSignOutAlt className="mr-2" />
                            Salir
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FaBuilding className="mx-auto text-4xl mb-2 text-gray-300" />
                    <p>No eres miembro de ninguna empresa</p>
                    <button
                      onClick={() => router.push("/companies/explore")}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Explorar empresas disponibles
                    </button>
                  </div>
                )}
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

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { FaBuilding, FaUsers, FaCalendarAlt, FaGlobe, FaLock, FaArrowLeft, FaUser } from "react-icons/fa";
import "@/app/globals.css";

interface CompanyDetail {
  id: number;
  name: string;
  description: string | null;
  public: boolean;
  owner: {
    id: number;
    name: string;
  };
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  currentUserRole: { name: string; level: number } | null;
  currentUserStatus: string | null;
  isOwner: boolean;
}

export default function CompanyDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinButtonText, setJoinButtonText] = useState("Unirse");
  const [joinButtonDisabled, setJoinButtonDisabled] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (id && user) {
      fetchCompanyDetails();
    } else if (id && !user) {
      // Si no hay usuario, solo obtener datos básicos (si es pública)
      fetchCompanyDetails(true);
    }
  }, [id, user]);

  async function fetchCompanyDetails(publicOnly = false) {
    if (!id) return;

    try {
      setLoading(true);
      const headers: HeadersInit = {};
      
      if (user) {
        headers.userid = user.id.toString();
      }

      const response = await fetch(`/api/companies/detail?companyId=${id}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setCompany(data);

        // Configurar el estado del botón de unirse
        if (data.currentUserStatus === 'pending') {
          setJoinButtonText("Solicitud pendiente");
          setJoinButtonDisabled(true);
        } else if (data.currentUserStatus === 'approved') {
          setJoinButtonText("Ya eres miembro");
          setJoinButtonDisabled(true);
        } else {
          setJoinButtonText(data.public ? "Unirse" : "Solicitar acceso");
          setJoinButtonDisabled(false);
        }

      } else {
        // Si es error 403 y no hay usuario o solo queremos datos públicos,
        // mostrar mensaje específico
        if (response.status === 403 && (publicOnly || !user)) {
          setError("Esta empresa no es pública. Inicia sesión para solicitar acceso.");
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Error al cargar detalles de la empresa");
        }
      }
    } catch (error) {
      console.error("Error al cargar detalles de la empresa:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function joinCompany() {
    if (!user) {
      router.push(`/Login?redirect=/companies/details/${id}`);
      return;
    }

    try {
      setJoinButtonDisabled(true);
      const response = await fetch("/api/companies/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "userid": user.id.toString(),
        },
        body: JSON.stringify({
          userId: user.id,
          companyId: Number(id),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        
        // Actualizar el estado del botón según la respuesta
        if (company?.public) {
          setJoinButtonText("Ya eres miembro");
        } else {
          setJoinButtonText("Solicitud pendiente");
        }
        setJoinButtonDisabled(true);

        // Refrescar los detalles de la empresa
        fetchCompanyDetails();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al unirse a la empresa");
        setJoinButtonDisabled(false);
      }
    } catch (error) {
      console.error("Error al unirse a la empresa:", error);
      alert("Error al conectar con el servidor");
      setJoinButtonDisabled(false);
    }
  }

  function goBack() {
    router.back();
  }

  function enterCompany() {
    // Guardar la empresa seleccionada en el localStorage para usar en dashboard
    localStorage.setItem("selectedCompany", String(company?.id));
    router.push("/Dashboard"); // O donde esté tu dashboard
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Cargando... | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button 
            onClick={goBack} 
            className="flex items-center text-blue-600 mb-6 hover:underline"
          >
            <FaArrowLeft className="mr-2" /> Volver
          </button>
          <div className="p-6 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            {error.includes("no es pública") && (
              <div className="mt-4">
                <button
                  onClick={() => router.push("/Login")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Iniciar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  if (!company) {
    return (
      <>
        <Head>
          <title>Empresa no encontrada | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button 
            onClick={goBack} 
            className="flex items-center text-blue-600 mb-6 hover:underline"
          >
            <FaArrowLeft className="mr-2" /> Volver
          </button>
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">Empresa no encontrada</h2>
            <p className="text-yellow-600">No se encontró la empresa solicitada o no tienes acceso a ella.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{company.name} | Total Awareness</title>
      </Head>
      
      <NavBar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={goBack} 
          className="flex items-center text-blue-600 mb-8 hover:underline"
        >
          <FaArrowLeft className="mr-2" /> Volver
        </button>
        
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="p-6">
            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-4">
                  <FaBuilding className="text-blue-600 text-3xl" />
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold text-gray-800">{company.name}</h1>
                  <div className="flex items-center mt-1">
                    {company.public ? (
                      <span className="flex items-center text-green-600">
                        <FaGlobe className="mr-1" /> Pública
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600">
                        <FaLock className="mr-1" /> Privada
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-2">
                {company.currentUserStatus === 'approved' ? (
                  <button
                    onClick={enterCompany}
                    className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Entrar
                  </button>
                ) : (
                  <button
                    onClick={joinCompany}
                    disabled={joinButtonDisabled}
                    className={`px-5 py-2 rounded-md transition-colors ${
                      joinButtonDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {joinButtonText}
                  </button>
                )}
              </div>
            </div>
            
            {/* Descripción */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Descripción</h2>
              <p className="text-gray-600">
                {company.description || "Esta empresa no tiene descripción."}
              </p>
            </div>
            
            {/* Detalles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Propietario</h3>
                <div className="flex items-center">
                  <FaUser className="text-gray-400 mr-2" />
                  <p className="text-gray-800">{company.owner.name}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Miembros</h3>
                <div className="flex items-center">
                  <FaUsers className="text-gray-400 mr-2" />
                  <p className="text-gray-800">{company.memberCount}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Creado</h3>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 mr-2" />
                  <p className="text-gray-800">{new Date(company.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {user && company.currentUserRole && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Tu rol</h3>
                  <div className="flex items-center">
                    <p className="text-gray-800">
                      {company.currentUserRole.name}
                      {company.isOwner && " (Propietario)"}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Nota para solicitudes pendientes */}
            {user && company.currentUserStatus === 'pending' && (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
                <p className="text-yellow-700">
                  Tu solicitud para unirte a esta empresa está pendiente de aprobación por parte del propietario o administrador.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
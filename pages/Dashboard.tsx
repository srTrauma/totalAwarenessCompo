import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { FaBuilding, FaUsers, FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import "@/app/globals.css";

interface CompanyDetails {
  id: number;
  name: string;
  description: string | null;
  public: boolean;
  owner: {
    id: number;
    name: string;
  };
  memberCount: number;
  currentUserRole: {
    id: number;
    name: string;
    level: number;
  } | null;
  isOwner: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Comprobar si el usuario está autenticado
    const storedUser = localStorage.getItem("user");
    const selectedCompany = localStorage.getItem("selectedCompany");
    
    if (!storedUser || !selectedCompany) {
      router.push("/Login");
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchCompanyDetails(Number(selectedCompany));
  }, [router]);

  async function fetchCompanyDetails(companyId: number) {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/detail?companyId=${companyId}`, {
        headers: {
          userid: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).id : ""
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al cargar detalles de la empresa");
        router.push("/CompanySelection");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
      router.push("/CompanySelection");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("selectedCompany");
    router.push("/Login");
  }

  function handleSwitchCompany() {
    localStorage.removeItem("selectedCompany");
    router.push("/CompanySelection");
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
          <div className="p-6 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <div className="mt-4">
              <button
                onClick={handleSwitchCompany}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Volver a selección de empresa
              </button>
            </div>
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
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">Empresa no encontrada</h2>
            <p className="text-yellow-600">No se encontró la empresa seleccionada o no tienes acceso a ella.</p>
            <div className="mt-4">
              <button
                onClick={handleSwitchCompany}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Volver a selección de empresa
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{company.name} | Dashboard | Total Awareness</title>
      </Head>
      
      <NavBar />
      
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3">
                  <FaBuilding className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                  <p className="text-sm text-gray-500">
                    {company.isOwner ? 'Propietario' : `Rol: ${company.currentUserRole?.name}`}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleSwitchCompany}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center"
                >
                  <FaBuilding className="mr-2" />
                  Cambiar empresa
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Información de la empresa</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="text-gray-900">{company.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                  <dd className="text-gray-900">{company.description || "Sin descripción"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Propietario</dt>
                  <dd className="text-gray-900">{company.owner.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Visibilidad</dt>
                  <dd className="text-gray-900">{company.public ? 'Pública' : 'Privada'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Miembros</dt>
                  <dd className="text-gray-900">{company.memberCount}</dd>
                </div>
              </dl>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Enlaces rápidos</h2>
              <div className="space-y-3">
                {(company.isOwner || (company.currentUserRole && company.currentUserRole.level <= 2)) && (
                  <>
                    <button
                      onClick={() => router.push("/companies/manage/members")}
                      className="w-full flex items-center px-4 py-3 bg-blue-50 text-blue-800 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <FaUsers className="mr-3" />
                      Gestionar miembros
                    </button>
                    <button
                      onClick={() => router.push(`/companies/edit/${company.id}`)}
                      className="w-full flex items-center px-4 py-3 bg-gray-50 text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <FaCog className="mr-3" />
                      Configuración de empresa
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Estado de tu cuenta</h2>
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FaUser className="text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Actualmente estás conectado a <strong>{company.name}</strong> con el rol de <strong>{company.currentUserRole?.name}</strong>
              </p>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-8">
            <h2 className="text-xl font-medium mb-6">Panel de Control</h2>
            <p className="text-gray-600">
              ¡Bienvenido al panel de control! Aquí encontrarás todas las herramientas y recursos necesarios para gestionar tu empresa.
            </p>
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                  <h3 className="font-medium mb-2">Próximamente</h3>
                  <p className="text-sm text-gray-600">
                    Estamos trabajando en nuevas funcionalidades para mejorar tu experiencia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { FaBuilding, FaPlus, FaSearch, FaLock, FaGlobe, FaUserShield } from "react-icons/fa";
import "@/app/globals.css";

interface Company {
  id: number;
  name: string;
  description: string | null;
  public: boolean;
  isOwner: boolean;
  role: string;
  approved: boolean;
  createdAt: string;
}

export default function CompanySelection() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyDescription, setNewCompanyDescription] = useState("");
  const [isPublicCompany, setIsPublicCompany] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchCompanies(parsedUser.id);
    } else {
      router.push("/Login");
    }
  }, [router]);

  async function fetchCompanies(userId: number) {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/list?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al cargar las empresas");
      }
    } catch (error) {
      console.error("Error al cargar las empresas:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function createCompany() {
    if (!newCompanyName.trim()) {
      setError("El nombre de la empresa es obligatorio");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/companies/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          name: newCompanyName.trim(),
          description: newCompanyDescription.trim() || null,
          isPublic: isPublicCompany
        }),
      });

      if (response.ok) {
        const newCompany = await response.json();
        // Recargar la lista de empresas
        fetchCompanies(user!.id);
        setIsCreating(false);
        setNewCompanyName("");
        setNewCompanyDescription("");
        setIsPublicCompany(false);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al crear la empresa");
      }
    } catch (error) {
      console.error("Error al crear la empresa:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  function selectCompany(companyId: number, approved: boolean) {
    if (!approved) {
      alert("Tu solicitud está pendiente de aprobación.");
      return;
    }
    
    // Guardar la empresa seleccionada en localStorage
    localStorage.setItem("selectedCompany", String(companyId));
    router.push("/Dashboard"); // Redirigir al dashboard de la empresa
  }

  function handleLogout() {
    localStorage.removeItem("user");
    router.push("/Login");
  }

  if (loading && !companies.length) {
    return (
      <>
        <Head>
          <title>Selección de Empresa | Total Awareness</title>
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
        <title>Selección de Empresa | Total Awareness</title>
      </Head>
      
      <main className="min-h-screen bg-gray-50">
        <NavBar />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tus Empresas</h1>
            <button 
              onClick={() => router.push("/companies/explore")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaSearch className="mr-2" /> Explorar empresas públicas
            </button>
          </div>
          
          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Selecciona una empresa</h2>
              
              {companies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companies.map((company) => (
                    <div 
                      key={company.id} 
                      className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                        company.approved ? 'cursor-pointer' : 'opacity-75'
                      }`}
                      onClick={() => selectCompany(company.id, company.approved)}
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full p-2 mr-3">
                              <FaBuilding className="text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-lg">{company.name}</h3>
                          </div>
                          <div>
                            {company.public ? (
                              <FaGlobe className="text-green-600" title="Pública" />
                            ) : (
                              <FaLock className="text-gray-600" title="Privada" />
                            )}
                          </div>
                        </div>
                        
                        {company.description && (
                          <p className="text-gray-600 mb-3 text-sm">
                            {company.description}
                          </p>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {company.role}
                            </span>
                            {company.isOwner && (
                              <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center">
                                <FaUserShield className="mr-1" /> Propietario
                              </span>
                            )}
                          </div>
                          
                          {!company.approved && (
                            <span className="text-yellow-600">
                              Pendiente de aprobación
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaBuilding className="mx-auto text-gray-400 text-5xl mb-4" />
                  <p className="text-gray-500 mb-4">
                    No estás asociado a ninguna empresa.
                  </p>
                  <p className="text-gray-500">
                    Crea una nueva empresa o únete a una existente.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2" /> Crear nueva empresa
                </button>
              </div>
            </div>
          </div>
          
          {/* Formulario para crear nueva empresa */}
          {isCreating && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Crear nueva empresa</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la empresa *
                    </label>
                    <input
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingresa el nombre de la empresa"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={newCompanyDescription}
                      onChange={(e) => setNewCompanyDescription(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descripción opcional"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublicCompany}
                      onChange={(e) => setIsPublicCompany(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                      Empresa pública (cualquier usuario puede unirse sin aprobación)
                    </label>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={createCompany}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Crear empresa
                    </button>
                    <button
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Botón de cerrar sesión */}
          <div className="text-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
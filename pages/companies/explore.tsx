import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { FaBuilding, FaUsers, FaCalendarAlt, FaSearch, FaGlobe, FaLock, FaArrowLeft, FaFilter } from "react-icons/fa";
import "@/app/globals.css";

interface Company {
  id: number;
  name: string;
  description: string | null;
  ownerName: string;
  memberCount: number;
  createdAt: string;
  public: boolean;
}

export default function ExploreCompanies() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    fetchAllCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies;
    
    // Aplicar filtro por tipo (público/privado)
    if (filter === "public") {
      filtered = filtered.filter(company => company.public);
    } else if (filter === "private") {
      filtered = filtered.filter(company => !company.public);
    }
    
    // Aplicar filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredCompanies(filtered);
  }, [searchTerm, companies, filter]);

  async function fetchAllCompanies() {
    try {
      setLoading(true);
      // Cambiar endpoint para obtener todas las empresas, no solo las públicas
      const response = await fetch(`/api/companies/explore`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        setFilteredCompanies(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al cargar empresas");
      }
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function joinCompany(companyId: number, isPublic: boolean) {
    if (!user) {
      router.push("/Login?redirect=/companies/explore");
      return;
    }

    try {
      const response = await fetch("/api/companies/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "userid": user.id.toString(),
        },
        body: JSON.stringify({
          userId: user.id,
          companyId: companyId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Mostrar mensaje de éxito
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al unirse a la empresa");
      }
    } catch (error) {
      console.error("Error al unirse a la empresa:", error);
      alert("Error al conectar con el servidor");
    }
  }

  function viewCompanyDetails(companyId: number) {
    router.push(`/companies/details/${companyId}`);
  }

  function goBack() {
    if (user) {
      router.push("/CompanySelection");
    } else {
      router.push("/");
    }
  }

  return (
    <>
      <Head>
        <title>Explorar Empresas | Total Awareness</title>
        <meta name="description" content="Explora y únete a empresas en Total Awareness" />
      </Head>
      
      <main className="min-h-screen bg-gray-50">
        <NavBar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <button 
              onClick={goBack}
              className="flex items-center text-blue-600 hover:underline mr-4"
            >
              <FaArrowLeft className="mr-2" /> Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Explorar Empresas</h1>
          </div>
          
          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}

          <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar empresas por nombre o descripción..."
              />
            </div>
            
            <div className="relative md:w-60">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "public" | "private")}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">Todas las empresas</option>
                <option value="public">Solo públicas</option>
                <option value="private">Solo privadas</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCompanies.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-500">
                Mostrando {filteredCompanies.length} empresas de {companies.length} totales
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company) => (
                  <div 
                    key={company.id} 
                    className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${!company.public ? 'border-l-4 border-yellow-500' : ''}`}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`rounded-full p-3 mr-3 ${company.public ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                            <FaBuilding className={`${company.public ? 'text-blue-600' : 'text-yellow-600'}`} size={20} />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 truncate max-w-[200px]">{company.name}</h3>
                        </div>
                        
                        <div>
                          {company.public ? (
                            <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              <FaGlobe className="mr-1" /> Pública
                            </span>
                          ) : (
                            <span className="flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              <FaLock className="mr-1" /> Privada
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {company.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">{company.description}</p>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <FaUsers className="mr-2" />
                        <span>{company.memberCount} miembros</span>
                        <FaCalendarAlt className="ml-4 mr-2" />
                        <span>{new Date(company.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Propietario: </span>
                        <span className="text-gray-600">{company.ownerName}</span>
                      </div>
                      
                      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between">
                        <button
                          onClick={() => viewCompanyDetails(company.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        >
                          <span>Ver detalles</span>
                        </button>
                        
                        <button
                          onClick={() => joinCompany(company.id, company.public)}
                          className={`px-4 py-2 rounded-md transition-colors text-sm ${
                            company.public 
                              ? "bg-blue-600 text-white hover:bg-blue-700" 
                              : "bg-yellow-600 text-white hover:bg-yellow-700"
                          }`}
                        >
                          {company.public ? "Unirse" : "Solicitar acceso"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <FaBuilding className="text-gray-400 text-5xl mb-4" />
              <p className="text-xl text-gray-500">
                {searchTerm
                  ? "No se encontraron empresas que coincidan con tu búsqueda"
                  : filter !== "all" 
                    ? `No hay empresas ${filter === "public" ? "públicas" : "privadas"} disponibles en este momento` 
                    : "No hay empresas disponibles en este momento"}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
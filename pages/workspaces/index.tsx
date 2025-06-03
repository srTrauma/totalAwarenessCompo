import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import WorkspaceList from "@/components/WorkspaceList";
import CompanySelector from "@/components/CompanySelector";
import { FaArrowLeft } from "react-icons/fa";


export default function WorkspacesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [company, setCompany] = useState<{ id: number; name: string; currentUserRole?: { name: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [noCompanies, setNoCompanies] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const selectedCompany = localStorage.getItem("selectedCompany");
    if (!storedUser) {
      router.push("/Login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    if (selectedCompany) {
      const companyId = Number(selectedCompany);
      setSelectedCompanyId(companyId);
      fetchCompanyDetails(companyId, parsedUser.id);
    } else {
      // No hay empresa seleccionada: buscar la empresa por defecto o la primera
      fetch(`/api/companies/list?userId=${parsedUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // Buscar id=0, si no existe, usar la primera
            const defaultCompany = data.find((c: any) => c.id === 0) || data[0];
            localStorage.setItem("selectedCompany", String(defaultCompany.id));
            setSelectedCompanyId(defaultCompany.id);
            fetchCompanyDetails(defaultCompany.id, parsedUser.id);
          } else {
            setNoCompanies(true);
            setLoading(false);
          }
        })
        .catch(() => {
          setNoCompanies(true);
          setLoading(false);
        });
    }
  }, [router]);

  const fetchCompanyDetails = async (companyId: number, userId: number) => {
    try {
      const response = await fetch(`/api/companies/detail?companyId=${companyId}`, {
        headers: {
          userid: userId.toString()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      } else {
        const error = await response.json();
        console.error('Error loading company details:', error);
        router.push("/CompanySelection");
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      router.push("/CompanySelection");
    } finally {
      setLoading(false);
    }
  };
  const handleCompanyChange = async (companyId: number) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Actualizar localStorage con la nueva empresa seleccionada
      localStorage.setItem("selectedCompany", String(companyId));
      setSelectedCompanyId(companyId);
      
      // Cargar detalles de la nueva empresa
      await fetchCompanyDetails(companyId, user.id);
    } catch (error) {
      console.error('Error al cambiar de empresa:', error);
      setLoading(false);
    }
  };
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

  if (noCompanies) {
    return (
      <>
        <Head>
          <title>Sin empresas | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4">No tienes empresas disponibles</h2>
            <p className="mb-4 text-gray-600">Crea una empresa o únete a una existente para acceder a las salas de trabajo.</p>
            <button onClick={() => router.push('/CompanySelection')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Ir a selección de empresa</button>
          </div>
        </div>
      </>
    );
  }

  if (!user || !company) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Salas de Trabajo | Total Awareness</title>
        <meta name="description" content="Gestiona tus espacios de trabajo colaborativos" />
      </Head>
      
      <NavBar />
      
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 mb-4 hover:underline"
            >
              <FaArrowLeft className="mr-2" /> Volver
            </button>            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Salas de Trabajo - {company.name}</h1>
                {user && (
                  <CompanySelector
                    userId={user.id}
                    selectedCompanyId={selectedCompanyId}
                    onCompanyChange={handleCompanyChange}
                    className="w-80"
                  />
                )}
              </div>
              <p className="text-gray-600">
                Crea y gestiona espacios colaborativos para tu equipo. 
                Las salas contienen grupos donde se organizan las tareas y proyectos.
              </p>
            </div>
          </div>

          <WorkspaceList 
            userId={user.id} 
            companyId={company.id}
            userRole={company.currentUserRole?.name.toLowerCase()}
          />
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import PostManager from "@/components/PostManager";
import CompanySelector from "@/components/CompanySelector";
import { FaArrowLeft } from "react-icons/fa";


export default function PostsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [company, setCompany] = useState<{ id: number; name: string; currentUserRole?: { name: string } } | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const selectedCompany = localStorage.getItem("selectedCompany");
    
    if (!storedUser) {
      router.push("/CompanySelection");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    if (selectedCompany) {
      const companyId = Number(selectedCompany);
      setSelectedCompanyId(companyId);
      fetchCompanyDetails(companyId, parsedUser.id);
    } else {
      // Si no hay empresa seleccionada, redirigir a selección de empresa
      router.push("/CompanySelection");
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

  const handleCompanyChange = async (newCompanyId: number) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Actualizar localStorage con la nueva empresa seleccionada
      localStorage.setItem("selectedCompany", newCompanyId.toString());
      setSelectedCompanyId(newCompanyId);
      
      // Obtener detalles de la nueva empresa
      await fetchCompanyDetails(newCompanyId, user.id);
    } catch (error) {
      console.error('Error al cambiar de empresa:', error);
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

  if (!user || !company) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Posts de Empresa | Total Awareness</title>
        <meta name="description" content="Crea y gestiona publicaciones para tu empresa" />
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
            </button>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Posts de Empresa - {company.name}</h1>
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
                Comparte noticias, ofertas de trabajo, eventos y actualizaciones importantes.
                Mantén a tu audiencia informada y comprometida con contenido relevante.
              </p>
            </div>
          </div>

          <PostManager 
            userId={user.id} 
            companyId={company.id}
            userRole={company.currentUserRole?.name || 'MEMBER'}
          />
        </div>
      </div>
    </>
  );
}

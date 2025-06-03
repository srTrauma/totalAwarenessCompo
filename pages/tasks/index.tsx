import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import TaskManagerNew from "@/components/TaskManagerNew";
import CompanySelector from "@/components/CompanySelector";
import { FaArrowLeft, FaUsers, FaLayerGroup, FaTasks, FaChevronRight } from "react-icons/fa";


interface Workspace {
  id: number;
  name: string;
  description: string | null;
  groupCount: number;
}

interface Group {
  id: number;
  name: string;
  description: string | null;
  taskCount: number;
}

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [company, setCompany] = useState<{ id: number; name: string; currentUserRole?: { name: string } } | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
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
        fetchWorkspaces(companyId, userId);
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
      
      // Resetear selecciones actuales
      setSelectedWorkspace(null);
      setSelectedGroup(null);
      setWorkspaces([]);
      setGroups([]);
      
      // Actualizar localStorage
      localStorage.setItem("selectedCompany", newCompanyId.toString());
      setSelectedCompanyId(newCompanyId);
      
      // Obtener detalles de la nueva empresa
      await fetchCompanyDetails(newCompanyId, user.id);
    } catch (error) {
      console.error('Error al cambiar de empresa:', error);
    }
  };

  const fetchWorkspaces = async (companyId: number, userId: number) => {
    try {
      const response = await fetch(`/api/workspaces?companyId=${companyId}`, {
        headers: {
          userid: userId.toString()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      } else {
        console.error('Error loading workspaces');
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const fetchGroups = async (workspaceId: number) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/groups`, {
        headers: {
          userid: user!.id.toString()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        console.error('Error loading groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setSelectedGroup(null);
    setGroups([]);
    fetchGroups(workspace.id);
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
  };

  const handleBackToWorkspaces = () => {
    setSelectedWorkspace(null);
    setSelectedGroup(null);
    setGroups([]);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
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
            <p className="mb-4 text-gray-600">Crea una empresa o únete a una existente para gestionar tareas.</p>
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
        <title>Gestión de Tareas | Total Awareness</title>
        <meta name="description" content="Organiza y gestiona todas tus tareas de manera eficiente" />
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
            
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span>{company.name}</span>
              {selectedWorkspace && (
                <>
                  <FaChevronRight className="mx-2 text-gray-400" />
                  <span>{selectedWorkspace.name}</span>
                </>
              )}
              {selectedGroup && (
                <>
                  <FaChevronRight className="mx-2 text-gray-400" />
                  <span>{selectedGroup.name}</span>
                </>
              )}
            </div>            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Tareas - {company.name}
                </h1>
                {user && (
                  <CompanySelector
                    userId={user.id}
                    selectedCompanyId={selectedCompanyId}
                    onCompanyChange={handleCompanyChange}
                    className="w-80"
                  />
                )}
              </div>              <p className="text-gray-600">
                Organiza tu trabajo, establece prioridades y da seguimiento al progreso de tus tareas.
                Las tareas se organizan por grupos dentro de las salas de trabajo.
              </p>
            </div>
          </div>

          {/* Mostrar selección de workspace si no hay uno seleccionado */}
          {!selectedWorkspace && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaUsers className="mr-2 text-blue-600" />
                Selecciona una Sala de Trabajo
              </h2>
              {workspaces.length === 0 ? (
                <div className="text-center py-8">
                  <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay salas de trabajo disponibles.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Contacta con el administrador de la empresa para crear salas de trabajo.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {workspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      onClick={() => handleWorkspaceSelect(workspace)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{workspace.name}</h3>
                      {workspace.description && (
                        <p className="text-gray-600 text-sm mb-3">{workspace.description}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <FaLayerGroup className="mr-1" />
                        <span>{workspace.groupCount} grupos</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mostrar selección de grupo si hay workspace seleccionado pero no grupo */}
          {selectedWorkspace && !selectedGroup && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FaLayerGroup className="mr-2 text-blue-600" />
                  Grupos en {selectedWorkspace.name}
                </h2>
                <button
                  onClick={handleBackToWorkspaces}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Cambiar sala de trabajo
                </button>
              </div>
              
              {groups.length === 0 ? (
                <div className="text-center py-8">
                  <FaLayerGroup className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay grupos en esta sala de trabajo.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Los grupos organizan las tareas por categorías o equipos.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => handleGroupSelect(group)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
                      {group.description && (
                        <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <FaTasks className="mr-1" />
                        <span>{group.taskCount} tareas</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mostrar TaskManager cuando hay grupo seleccionado */}
          {selectedWorkspace && selectedGroup && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FaTasks className="mr-2 text-blue-600" />
                  Tareas en {selectedGroup.name}
                </h2>
                <div className="flex space-x-4">
                  <button
                    onClick={handleBackToGroups}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Cambiar grupo
                  </button>
                  <button
                    onClick={handleBackToWorkspaces}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Cambiar sala de trabajo
                  </button>
                </div>
              </div>
                <TaskManagerNew 
                userId={user.id} 
                groupId={selectedGroup.id}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

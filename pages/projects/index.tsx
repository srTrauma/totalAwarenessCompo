// Página de listado de proyectos (migración de workspaces)
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import CompanySelector from "@/components/CompanySelector";
import { FaArrowLeft } from "react-icons/fa";

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [company, setCompany] = useState<{ id: number; name: string; currentUserRole?: { name: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [noCompanies, setNoCompanies] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [selectedProjectForGroup, setSelectedProjectForGroup] = useState<any>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Estado para miembros y tareas de grupos
  const [groupMembers, setGroupMembers] = useState<{ [groupId: number]: any[] }>({});
  const [groupTasks, setGroupTasks] = useState<{ [groupId: number]: any[] }>({});
  const [memberInputs, setMemberInputs] = useState<{ [groupId: number]: string }>({});
  const [addingMember, setAddingMember] = useState<{ [groupId: number]: boolean }>({});
  const [removingMember, setRemovingMember] = useState<{ [groupId: number]: number | null }>({});

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
      fetch(`/api/companies/list?userId=${parsedUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
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

  // Llamar a fetchProjects solo si selectedCompanyId es un número
  useEffect(() => {
    if (typeof selectedCompanyId === "number") {
      fetchProjects(selectedCompanyId);
    }
  }, [selectedCompanyId]);

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
        fetchProjects(companyId);
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

  const fetchProjects = async (companyId: number) => {
    try {
      const response = await fetch(`/api/projects?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Error fetching projects:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCompanyChange = async (companyId: number) => {
    if (!user) return;
    try {
      setLoading(true);
      localStorage.setItem("selectedCompany", String(companyId));
      setSelectedCompanyId(companyId);
      await fetchCompanyDetails(companyId, user.id);
    } catch (error) {
      console.error('Error al cambiar de empresa:', error);
      setLoading(false);
    }
  };

  // Función para crear proyecto
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCompanyId || !newProjectName.trim()) return;
    setCreatingProject(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
          companyId: selectedCompanyId,
          userId: user.id,
        }),
      });
      if (res.ok) {
        setNewProjectName("");
        setNewProjectDescription("");
        setShowProjectForm(false);
        if (typeof selectedCompanyId === "number") fetchProjects(selectedCompanyId);
      } else {
        const error = await res.json();
        alert(error.message || "Error al crear proyecto");
      }
    } catch (err) {
      alert("Error al crear proyecto");
    } finally {
      setCreatingProject(false);
    }
  };

  // Función para crear grupo
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProjectForGroup || !newGroupName.trim()) return;
    setCreatingGroup(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectForGroup.id}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json", userid: user.id.toString() },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
        }),
      });
      if (res.ok) {
        setNewGroupName("");
        setNewGroupDescription("");
        setShowGroupForm(false);
        if (typeof selectedCompanyId === "number") fetchProjects(selectedCompanyId);
      } else {
        const error = await res.json();
        alert(error.message || "Error al crear grupo");
      }
    } catch (err) {
      alert("Error al crear grupo");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Función para cargar miembros de un grupo
  const fetchGroupMembers = async (projectId: number, groupId: number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/groups/${groupId}/members`);
      if (res.ok) {
        const data = await res.json();
        setGroupMembers(prev => ({ ...prev, [groupId]: data }));
      }
    } catch {}
  };

  // Función para cargar tareas de un grupo
  const fetchGroupTasks = async (projectId: number, groupId: number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/groups/${groupId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setGroupTasks(prev => ({ ...prev, [groupId]: data }));
      }
    } catch {}
  };

  // Añadir miembro
  const handleAddMember = async (projectId: number, groupId: number) => {
    const value = memberInputs[groupId]?.trim();
    if (!value) return;
    setAddingMember(prev => ({ ...prev, [groupId]: true }));
    try {
      const res = await fetch(`/api/projects/${projectId}/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUserId: value }),
      });
      if (res.ok) {
        setMemberInputs(prev => ({ ...prev, [groupId]: "" }));
        fetchGroupMembers(projectId, groupId);
      } else {
        const error = await res.json();
        alert(error.message || "Error al añadir miembro");
      }
    } catch {
      alert("Error al añadir miembro");
    } finally {
      setAddingMember(prev => ({ ...prev, [groupId]: false }));
    }
  };

  // Eliminar miembro
  const handleRemoveMember = async (projectId: number, groupId: number, userId: number) => {
    setRemovingMember(prev => ({ ...prev, [groupId]: userId }));
    try {
      const res = await fetch(`/api/projects/${projectId}/groups/${groupId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        fetchGroupMembers(projectId, groupId);
      } else {
        const error = await res.json();
        alert(error.message || "Error al eliminar miembro");
      }
    } catch {
      alert("Error al eliminar miembro");
    } finally {
      setRemovingMember(prev => ({ ...prev, [groupId]: null }));
    }
  };

  // Cargar miembros y tareas al expandir grupo
  const handleExpandGroup = (projectId: number, groupId: number) => {
    fetchGroupMembers(projectId, groupId);
    fetchGroupTasks(projectId, groupId);
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
            <p className="mb-4 text-gray-600">Crea una empresa o únete a una existente para acceder a los proyectos.</p>
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
        <title>Proyectos | Total Awareness</title>
        <meta name="description" content="Gestiona tus proyectos colaborativos" />
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
                <h1 className="text-3xl font-bold text-gray-900">Proyectos - {company.name}</h1>
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
                Crea y gestiona proyectos colaborativos para tu equipo. Los proyectos contienen grupos donde se organizan las tareas.
              </p>
            </div>
          </div>
          <div className="flex justify-end mb-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => setShowProjectForm(true)}
            >
              + Nuevo Proyecto
            </button>
          </div>
          {showProjectForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <form onSubmit={handleCreateProject} className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Nuevo Proyecto</h3>
                <input
                  type="text"
                  className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nombre del proyecto"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  required
                />
                <textarea
                  className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Descripción (opcional)"
                  value={newProjectDescription}
                  onChange={e => setNewProjectDescription(e.target.value)}
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => setShowProjectForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={creatingProject}
                  >
                    {creatingProject ? "Creando..." : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          )}
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay proyectos disponibles.</p>
              <p className="text-sm text-gray-500 mt-2">
                Contacta con el administrador de la empresa para crear proyectos.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                  {project.description && (
                    <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{project._count?.groups ?? 0} grupos</span>
                  </div>
                  <button
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedProjectForGroup(project);
                      setShowGroupForm(true);
                    }}
                  >
                    + Nuevo Grupo
                  </button>
                  {/* Mostrar grupos del proyecto */}
                  {project.groups && project.groups.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Grupos:</h4>
                      {project.groups.map((group: any) => (
                        <div key={group.id} className="border border-gray-100 rounded p-2 mb-2 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">{group.name}</span>
                            <button
                              className="text-xs text-blue-600 hover:underline ml-2"
                              onClick={e => {
                                e.stopPropagation();
                                handleExpandGroup(project.id, group.id);
                              }}
                            >Ver detalles</button>
                          </div>
                          {/* Miembros del grupo */}
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Miembros:</span>
                            <ul className="text-xs mt-1">
                              {(groupMembers[group.id] || []).map((member: any) => (
                                <li key={member.id} className="flex items-center justify-between">
                                  <span>{member.name || member.email}</span>
                                  <button
                                    className="ml-2 text-red-500 hover:underline text-xs"
                                    disabled={removingMember[group.id] === member.id}
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleRemoveMember(project.id, group.id, member.id);
                                    }}
                                  >
                                    {removingMember[group.id] === member.id ? "Quitando..." : "Quitar"}
                                  </button>
                                </li>
                              ))}
                            </ul>
                            <form
                              className="flex mt-2"
                              onSubmit={e => {
                                e.preventDefault();
                                handleAddMember(project.id, group.id);
                              }}
                            >
                              <input
                                type="text"
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                placeholder="Email o ID de usuario"
                                value={memberInputs[group.id] || ""}
                                onChange={e => setMemberInputs(prev => ({ ...prev, [group.id]: e.target.value }))}
                              />
                              <button
                                type="submit"
                                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                disabled={addingMember[group.id]}
                              >
                                {addingMember[group.id] ? "Añadiendo..." : "Añadir"}
                              </button>
                            </form>
                          </div>
                          {/* Tareas del grupo */}
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Tareas:</span>
                            <ul className="text-xs mt-1">
                              {(groupTasks[group.id] || []).length === 0 ? (
                                <li className="text-gray-400">Sin tareas</li>
                              ) : (
                                groupTasks[group.id].map((task: any) => (
                                  <li key={task.id} className="flex items-center">
                                    <span>{task.title}</span>
                                    {task.status && (
                                      <span className="ml-2 text-gray-400">[{task.status}]</span>
                                    )}
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleCreateGroup} className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nuevo Grupo en {selectedProjectForGroup?.name}</h3>
            <input
              type="text"
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nombre del grupo"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              required
            />
            <textarea
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Descripción (opcional)"
              value={newGroupDescription}
              onChange={e => setNewGroupDescription(e.target.value)}
            />
            <div className="flex space-x-2">
              <button
                type="button"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setShowGroupForm(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={creatingGroup}
              >
                {creatingGroup ? "Creando..." : "Crear"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

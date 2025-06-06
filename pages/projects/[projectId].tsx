// Página de detalles de proyecto (migración de workspace)
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import GroupManager from "@/components/GroupManager";
import { FaArrowLeft, FaUsers, FaPlus, FaCog, FaLayerGroup, FaUserPlus, FaTrash } from "react-icons/fa";

interface Project {
  id: number;
  name: string;
  description: string | null;
  companyId: number;
  company: {
    id: number;
    name: string;
  };
  members: ProjectMember[];
  groups: Group[];
  canManage: boolean;
}

interface ProjectMember {
  id: number;
  userId: number;
  role: string;
  joinedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
  };
}

interface Group {
  id: number;
  name: string;
  description: string | null;
  taskCount: number;
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "groups">("overview");
  const [isCompanyUser, setIsCompanyUser] = useState<boolean | null>(null);
  // --- NUEVO: CRUD de miembros para admins ---
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [addingMemberId, setAddingMemberId] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      router.push("/Login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    if (projectId) {
      fetchProjectDetails(Number(projectId), parsedUser.id);
    }
  }, [projectId, router]);

  // Nueva comprobación: ¿el usuario pertenece a la empresa?
  useEffect(() => {
    if (!projectId || !user) return;
    const checkCompanyUser = async () => {
      try {
        // Obtener el proyecto para saber el companyId
        const resProject = await fetch(`/api/projects/${projectId}?userId=${user.id}`);
        if (!resProject.ok) return setIsCompanyUser(false);
        const projectData = await resProject.json();
        const companyId = projectData.companyId;
        if (!companyId) return setIsCompanyUser(false);
        const res = await fetch(`/api/companies/${companyId}/users`, {
          headers: { userid: user.id.toString() }
        });
        if (!res.ok) return setIsCompanyUser(false);
        const users = await res.json();
        setIsCompanyUser(users.some((u: any) => u.id === user.id));
      } catch {
        setIsCompanyUser(false);
      }
    };
    checkCompanyUser();
  }, [projectId, user]);

  const fetchProjectDetails = async (projectId: number, userId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        const error = await response.json();
        console.error('Error loading project details:', error);
        router.push("/projects");
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!project || !inviteEmail.trim()) return;
    try {
      setSubmitting(true);
      const response = await fetch(`/api/projects/${project.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userid': user!.id.toString()
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole
        })
      });
      if (response.ok) {
        setShowInviteModal(false);
        setInviteEmail("");
        setInviteRole("MEMBER");
        fetchProjectDetails(project.id, user!.id);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al invitar al usuario');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (membershipId: number) => {
    if (!project || !confirm('¿Estás seguro de que quieres remover a este miembro?')) return;
    try {
      const response = await fetch(`/api/projects/${project.id}/members/${membershipId}`, {
        method: 'DELETE',
        headers: {
          'userid': user!.id.toString()
        }
      });
      if (response.ok) {
        fetchProjectDetails(project.id, user!.id);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al remover al miembro');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Error al conectar con el servidor');
    }
  };

  // Determinar si el usuario es miembro del proyecto
  const isProjectMember = project?.members?.some(m => m.user.id === user?.id);
  const [joiningProject, setJoiningProject] = useState(false);

  // Unirse al proyecto (como miembro normal)
  const handleJoinProject = async () => {
    if (!projectId || !user) return;
    setJoiningProject(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', userid: user.id.toString() },
        body: JSON.stringify({ userId: user.id })
      });
      if (response.ok) {
        await fetchProjectDetails(Number(projectId), user.id);
      }
    } catch (e) {
      // Silenciar error
    } finally {
      setJoiningProject(false);
    }
  };

  // Cargar usuarios de la empresa (para admins)
  useEffect(() => {
    if (!project?.companyId || !user) return;
    const fetchCompanyUsers = async () => {
      try {
        const res = await fetch(`/api/companies/${project.companyId}/users`, {
          headers: { userid: user.id.toString() }
        });
        if (res.ok) {
          const users = await res.json();
          setCompanyUsers(users);
        }
      } catch {}
    };
    if (project.canManage) fetchCompanyUsers();
  }, [project?.companyId, user, project?.canManage]);

  // Añadir miembro al proyecto
  const handleAddMemberToProject = async (memberUserId: number) => {
    if (!projectId || !user) return;
    setAddingMemberId(memberUserId);
    try {
      const response = await fetch(`/api/projects/${projectId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', userid: user.id.toString() },
        body: JSON.stringify({ userId: memberUserId })
      });
      if (response.ok) {
        await fetchProjectDetails(Number(projectId), user.id);
        setShowAddMemberModal(false);
      }
    } catch {}
    finally {
      setAddingMemberId(null);
    }
  };

  if (isCompanyUser === false) {
    return (
      <>
        <Head>
          <title>Acceso denegado | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="p-6 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Acceso denegado</h2>
            <p className="text-red-600">No perteneces a la empresa de este proyecto.</p>
            <div className="mt-4">
              <button
                onClick={() => router.push("/projects")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Volver a proyectos
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (isCompanyUser === null || loading) {
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

  if (!project) {
    return (
      <>
        <Head>
          <title>Proyecto no encontrado | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">Proyecto no encontrado</h2>
            <p className="text-yellow-600">No se encontró el proyecto o no tienes acceso a él.</p>
            <div className="mt-4">
              <button
                onClick={() => router.push("/projects")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Volver a proyectos
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
        <title>{project.name} | Total Awareness</title>
        <meta name="description" content={`Gestiona el proyecto ${project.name}`} />
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
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <p className="text-gray-600 mt-1">{project.company.name}</p>
                </div>
                {project.canManage && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus className="mr-2" /> Invitar miembro
                    </button>
                  </div>
                )}
              </div>
              {project.description && (
                <p className="text-gray-700">{project.description}</p>
              )}
            </div>
          </div>
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`$
                    {activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Vista general
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`$
                    {activeTab === 'members'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FaUsers className="mr-2" />
                  Miembros ({project.members.length})
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`$
                    {activeTab === 'groups'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FaLayerGroup className="mr-2" />
                  Grupos ({project.groups.length})
                </button>
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaUsers className="text-blue-600 text-2xl mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Miembros</h3>
                        <p className="text-blue-600 font-bold text-xl">{project.members.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaLayerGroup className="text-green-600 text-2xl mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Grupos</h3>
                        <p className="text-green-600 font-bold text-xl">{project.groups.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaCog className="text-purple-600 text-2xl mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Tu rol</h3>
                        <p className="text-purple-600 font-bold text-xl">
                          {project.canManage ? 'Admin' : 'Miembro'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'members' && (
                <div>                 
                  {/* Botón para unirse al proyecto si es usuario de la empresa pero no miembro */}
                  {!project.canManage && !isProjectMember && (
                    <div className="mb-6 flex flex-col items-center justify-center">
                      <p className="mb-2 text-gray-700 text-center">No eres miembro de este proyecto. Únete para poder participar en los grupos y tareas.</p>
                      <button
                        onClick={handleJoinProject}
                        disabled={joiningProject}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold disabled:opacity-50"
                      >
                        {joiningProject ? 'Uniéndote...' : 'Unirse al proyecto'}
                      </button>
                    </div>
                  )}
                  {/* CRUD de miembros para admins */}
                  {project.canManage && (
                    <div className="mb-6 flex flex-col items-center justify-center">
                      <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 mb-2"
                      >
                        <FaUserPlus /> Añadir miembro
                      </button>
                    </div>
                  )}
                  {/* Modal para añadir miembro (solo admins) */}
                  {showAddMemberModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium mb-4">Agregar Miembro al Proyecto</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {companyUsers
                            .filter(userItem => !project.members.some(m => m.user.id === userItem.id))
                            .map((userItem) => (
                              <button
                                key={userItem.id}
                                onClick={() => handleAddMemberToProject(userItem.id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={addingMemberId === userItem.id}
                              >
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                                  {userItem.profileImage ? (
                                    <img src={userItem.profileImage} alt={userItem.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-sm text-blue-600">{userItem.name.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <div className="text-left">
                                  <p className="font-medium">{userItem.name}</p>
                                  <p className="text-sm text-gray-600">{userItem.email}</p>
                                </div>
                                {addingMemberId === userItem.id && (
                                  <svg className="animate-spin h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                )}
                              </button>
                            ))}
                          {companyUsers.filter(userItem => !project.members.some(m => m.user.id === userItem.id)).length === 0 && (
                            <div className="text-gray-500 text-sm">Todos los usuarios de la empresa ya están en el proyecto.</div>
                          )}
                        </div>
                        <button
                          onClick={() => setShowAddMemberModal(false)}
                          className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors w-full"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    {project.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-blue-100">
                            {member.user.profileImage ? (
                              <img 
                                src={member.user.profileImage} 
                                alt={member.user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaUsers className="text-blue-600 text-sm" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{member.user.name}</h4>
                            <p className="text-sm text-gray-500">{member.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {member.role}
                          </span>
                          {project.canManage && member.user.id !== user?.id && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'groups' && (
                <GroupManager 
                  projectId={project.id}
                  userId={user!.id}
                  userRole={project.canManage ? 'admin' : 'member'}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal de invitación */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invitar nuevo miembro</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del usuario
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MEMBER">Miembro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleInviteMember}
                disabled={submitting || !inviteEmail.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Invitando...' : 'Invitar'}
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

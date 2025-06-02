import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import GroupManager from "@/components/GroupManager";
import { FaArrowLeft, FaUsers, FaPlus, FaCog, FaLayerGroup } from "react-icons/fa";

interface Workspace {
  id: number;
  name: string;
  description: string | null;
  companyId: number;
  company: {
    id: number;
    name: string;
  };
  members: WorkspaceMember[];
  groups: Group[];
  canManage: boolean;
}

interface WorkspaceMember {
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

export default function WorkspaceDetailsPage() {
  const router = useRouter();
  const { workspaceId } = router.query;
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "groups">("overview");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/Login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (workspaceId) {
      fetchWorkspaceDetails(Number(workspaceId), parsedUser.id);
    }
  }, [workspaceId, router]);
  const fetchWorkspaceDetails = async (workspaceId: number, userId: number) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setWorkspace(data);
      } else {
        const error = await response.json();
        console.error('Error loading workspace details:', error);
        router.push("/workspaces");
      }
    } catch (error) {
      console.error('Error fetching workspace details:', error);
      router.push("/workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!workspace || !inviteEmail.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/workspaces/${workspace.id}/invite`, {
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
        // Refrescar datos del workspace
        fetchWorkspaceDetails(workspace.id, user!.id);
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
    if (!workspace || !confirm('¿Estás seguro de que quieres remover a este miembro?')) return;

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}/members/${membershipId}`, {
        method: 'DELETE',
        headers: {
          'userid': user!.id.toString()
        }
      });

      if (response.ok) {
        // Refrescar datos del workspace
        fetchWorkspaceDetails(workspace.id, user!.id);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al remover al miembro');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Error al conectar con el servidor');
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

  if (!workspace) {
    return (
      <>
        <Head>
          <title>Sala de trabajo no encontrada | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">Sala de trabajo no encontrada</h2>
            <p className="text-yellow-600">No se encontró la sala de trabajo o no tienes acceso a ella.</p>
            <div className="mt-4">
              <button
                onClick={() => router.push("/workspaces")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Volver a salas de trabajo
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
        <title>{workspace.name} | Total Awareness</title>
        <meta name="description" content={`Gestiona la sala de trabajo ${workspace.name}`} />
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
                  <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
                  <p className="text-gray-600 mt-1">{workspace.company.name}</p>
                </div>
                
                {workspace.canManage && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus className="mr-2" /> Invitar miembro
                    </button>
                    <button
                      onClick={() => router.push(`/workspaces/${workspace.id}/edit`)}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <FaCog className="mr-2" /> Configurar
                    </button>
                  </div>
                )}
              </div>
              
              {workspace.description && (
                <p className="text-gray-700">{workspace.description}</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Vista general
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`${
                    activeTab === 'members'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FaUsers className="mr-2" />
                  Miembros ({workspace.members.length})
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`${
                    activeTab === 'groups'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FaLayerGroup className="mr-2" />
                  Grupos ({workspace.groups.length})
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
                        <p className="text-blue-600 font-bold text-xl">{workspace.members.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaLayerGroup className="text-green-600 text-2xl mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Grupos</h3>
                        <p className="text-green-600 font-bold text-xl">{workspace.groups.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaCog className="text-purple-600 text-2xl mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Tu rol</h3>
                        <p className="text-purple-600 font-bold text-xl">
                          {workspace.canManage ? 'Admin' : 'Miembro'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div>
                  <div className="space-y-4">
                    {workspace.members.map((member) => (
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
                          
                          {workspace.canManage && member.user.id !== user?.id && (
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
              )}              {activeTab === 'groups' && (
                <GroupManager 
                  workspaceId={workspace.id}
                  userId={user!.id}
                  userRole={workspace.canManage ? 'admin' : 'member'}
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

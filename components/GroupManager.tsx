import { useState, useEffect } from "react";
import { FaPlus, FaUsers, FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";

interface WorkspaceGroup {
  id: number;
  name: string;
  description?: string;
  workspaceId: number;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
  _count: {
    tasks: number;
  };
}

interface GroupMember {
  id: number;
  userId: number;
  groupId: number;
  role: string;
  joinedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  profileImage?: string;
}

interface GroupManagerProps {
  workspaceId: number;
  userId: number;
  userRole: string; // owner, admin, member
}

export default function GroupManager({ workspaceId, userId, userRole }: GroupManagerProps) {
  const [groups, setGroups] = useState<WorkspaceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<number | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<User[]>([]);

  // Estados del formulario
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchWorkspaceMembers();
  }, [workspaceId]);

  async function fetchGroups() {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/groups`, {
        headers: {
          userid: userId.toString()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        setError("Error al cargar los grupos");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function fetchWorkspaceMembers() {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        headers: {
          userid: userId.toString()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaceMembers(data.map((member: any) => member.user));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) {
      setError("El nombre del grupo es obligatorio");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch(`/api/workspaces/${workspaceId}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userid: userId.toString()
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim()
        })
      });

      if (response.ok) {
        const newGroup = await response.json();
        setGroups([...groups, newGroup]);
        setNewGroupName("");
        setNewGroupDescription("");
        setShowCreateForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al crear el grupo");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteGroup(groupId: number) {
    if (!confirm("¿Estás seguro de que deseas eliminar este grupo? Esto también eliminará todas sus tareas.")) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          userid: userId.toString()
        }
      });

      if (response.ok) {
        setGroups(groups.filter(group => group.id !== groupId));
      } else {
        setError("Error al eliminar el grupo");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    }
  }

  async function handleAddMemberToGroup(groupId: number, memberUserId: number) {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userid: userId.toString()
        },
        body: JSON.stringify({
          userId: memberUserId
        })
      });

      if (response.ok) {
        fetchGroups(); // Recargar grupos para mostrar el nuevo miembro
        setShowAddMemberModal(null);
      } else {
        setError("Error al agregar miembro al grupo");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    }
  }

  const canManageGroups = userRole === "owner" || userRole === "admin" || userRole === "ADMIN" || userRole === "OWNER";

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Grupos del Proyecto</h2>
        {canManageGroups && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Crear Grupo
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">Crear Nuevo Grupo</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre del grupo"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateGroup}
                disabled={creating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {creating ? "Creando..." : "Crear"}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewGroupName("");
                  setNewGroupDescription("");
                  setError("");
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaUsers className="mx-auto text-4xl mb-4" />
            <p>No hay grupos en este workspace.</p>
            {canManageGroups && (
              <p className="text-sm">Crea el primer grupo para empezar a organizar las tareas.</p>
            )}
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{group.name}</h3>
                  {group.description && (
                    <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                  )}
                </div>
                {canManageGroups && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddMemberModal(group.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Agregar miembro"
                    >
                      <FaUserPlus />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Eliminar grupo"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{group.members.length} miembros</span>
                <span>{group._count.tasks} tareas</span>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Miembros:</h4>
                <div className="flex flex-wrap gap-2">
                  {group.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                        {member.user.profileImage ? (
                          <img 
                            src={member.user.profileImage} 
                            alt={member.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-blue-600">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm">{member.user.name}</span>
                      {member.role === "leader" && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                          Líder
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para agregar miembro */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Agregar Miembro al Grupo</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workspaceMembers
                .filter(member => !groups
                  .find(g => g.id === showAddMemberModal)?.members
                  .some(gm => gm.userId === member.id)
                )
                .map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleAddMemberToGroup(showAddMemberModal, member.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                    {member.profileImage ? (
                      <img 
                        src={member.profileImage} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-blue-600">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddMemberModal(null)}
              className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors w-full"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

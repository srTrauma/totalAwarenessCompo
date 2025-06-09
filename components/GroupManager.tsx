import { useState, useEffect } from "react";
import { FaPlus, FaUsers, FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";

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

interface ProjectGroup {
  id: number;
  name: string;
  description?: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
  taskCount: number;
  memberCount: number;
}

interface GroupManagerProps {
  projectId: number;
  userId: number;
  userRole: string; // owner, admin, member
}

export default function GroupManager({ projectId, userId, userRole }: GroupManagerProps) {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<number | null>(null);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]); // NUEVO: usuarios de la empresa
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null); // feedback eliminar

  // Estados del formulario
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // --- NUEVO: MODAL DE EDICIÓN DE GRUPO ---
  const [editingGroup, setEditingGroup] = useState<ProjectGroup | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDescription, setEditGroupDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchProjectMembers();
    fetchCompanyUsers(); // NUEVO
  }, [projectId]);

  // NUEVO: obtener usuarios de la empresa del proyecto
  async function fetchCompanyUsers() {
    try {
      // Obtener el project para saber el companyId
      const resProject = await fetch(`/api/projects/${projectId}?userId=${userId}`);
      if (!resProject.ok) return;
      const project = await resProject.json();
      const companyId = project.companyId;
      if (!companyId) return;
      const res = await fetch(`/api/companies/${companyId}/users`, {
        headers: { userid: userId.toString() }
      });
      if (res.ok) {
        const users = await res.json();
        setCompanyUsers(users);
      }
    } catch (e) {
      // Silenciar error
    }
  }

  async function fetchGroups() {
    setError(""); // Limpiar error antes de intentar cargar
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/groups`, {
        headers: {
          userid: userId.toString()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
        setError(""); // Limpiar error si la carga fue exitosa
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al cargar los grupos");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjectMembers() {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        headers: {
          userid: userId.toString()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjectMembers(data.map((member: any) => member.user));
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

      const response = await fetch(`/api/projects/${projectId}/groups`, {
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
      const response = await fetch(`/api/projects/${projectId}/groups/${groupId}`, {
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
      const response = await fetch(`/api/projects/${projectId}/groups/${groupId}/members`, {
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

  // Eliminar miembro del grupo
  async function handleRemoveMemberFromGroup(groupId: number, memberUserId: number) {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario del grupo?')) return;
    setRemovingMemberId(memberUserId);
    try {
      const response = await fetch(`/api/projects/${projectId}/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', userid: userId.toString() },
        body: JSON.stringify({ userId: memberUserId })
      });
      if (response.ok) {
        fetchGroups();
      } else {
        setError('Error al eliminar miembro del grupo');
      }
    } catch (e) {
      setError('Error al conectar con el servidor');
    } finally {
      setRemovingMemberId(null);
    }
  }

  // --- NUEVO: FUNCIONES DE EDICIÓN DE GRUPO ---
  const openEditGroupModal = (group: ProjectGroup) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditGroupDescription(group.description || "");
  };

  const handleEditGroup = async () => {
    if (!editingGroup) return;
    setSavingEdit(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/groups/${editingGroup.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          userid: userId.toString(),
        },
        body: JSON.stringify({
          name: editGroupName.trim(),
          description: editGroupDescription.trim(),
        }),
      });
      if (response.ok) {
        await fetchGroups();
        setEditingGroup(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al editar el grupo");
      }
    } catch (e) {
      setError("Error al conectar con el servidor");
    } finally {
      setSavingEdit(false);
    }
  };

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
      {/* Mostrar error solo si no hay grupos y hay error */}
      {error && groups.length === 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
            <p>No hay grupos en este proyecto.</p>
            {canManageGroups && (
              <p className="text-sm">Crea el primer grupo para empezar a organizar las tareas.</p>
            )}
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="mb-4 p-4 bg-gray-50 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="font-semibold text-lg flex items-center">
                  {group.name}
                  {canManageGroups && (
                    <button
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() => openEditGroupModal(group)}
                      title="Editar grupo"
                    >
                      <FaEdit />
                    </button>
                  )}
                </h4>                <p className="text-gray-600 text-sm">{group.description}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-xs text-gray-400">Tareas: {group.taskCount}</p>
                  <p className="text-xs text-gray-400">Miembros: {group.memberCount}</p>
                </div>                {/* Miembros del grupo */}
                <div className="flex items-center mt-2 flex-wrap gap-2">
                  <span className="text-xs text-gray-500 mr-2">
                    Miembros ({group.memberCount}):
                  </span>
                  {group.members.map((member) => (
                    <div key={member.user.id} className="flex items-center gap-1 bg-white rounded-full px-2 py-1 border border-gray-200">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                        {member.user.profileImage ? (
                          <img src={member.user.profileImage} alt={member.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-blue-600">{member.user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-700">{member.user.name}</span>
                    </div>
                  ))}
                </div>
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
          ))
        )}
      </div>

      {/* Modal para agregar miembro */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Agregar Miembro al Grupo</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {companyUsers
                .filter(user => !groups.find(g => g.id === showAddMemberModal)?.members.some(gm => gm.userId === user.id))
                .map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAddMemberToGroup(showAddMemberModal, user.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm text-blue-600">{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
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

      {/* MODAL DE EDICIÓN DE GRUPO */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Editar Grupo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={e => setEditGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={editGroupDescription}
                  onChange={e => setEditGroupDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleEditGroup}
                disabled={savingEdit || !editGroupName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {savingEdit ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setEditingGroup(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

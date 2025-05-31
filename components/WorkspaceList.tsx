import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  PlusIcon, 
  Cog6ToothIcon,
  TrashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface WorkspaceListProps {
  userId: number;
}

interface Workspace {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  members: {
    id: number;
    role: string;
    user: {
      id: number;
      name: string;
      email: string;
      profileImage?: string;
    };
  }[];
  _count: {
    tasks: number;
    members: number;
  };
}

interface WorkspaceCardProps {
  workspace: Workspace;
  userRole: string;
  onEdit: (workspace: Workspace) => void;
  onDelete: (id: number) => void;
  onJoin: (id: number) => void;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  userRole,
  onEdit,
  onDelete,
  onJoin
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{workspace.name}</h3>
          {workspace.description && (
            <p className="text-gray-600 text-sm mt-1">{workspace.description}</p>
          )}
        </div>
        
        {userRole === 'owner' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(workspace)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(workspace.id)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <UsersIcon className="w-4 h-4 mr-1" />
          <span>{workspace._count.members} miembros</span>
        </div>
        <div className="flex items-center">
          <span>{workspace._count.tasks} tareas</span>
        </div>
      </div>

      {/* Avatares de miembros */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {workspace.members.slice(0, 4).map((member) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center"
              title={member.user.name}
            >
              {member.user.profileImage ? (
                <img
                  src={member.user.profileImage}
                  alt={member.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-blue-600">
                  {member.user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {workspace._count.members > 4 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600">
                +{workspace._count.members - 4}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => onJoin(workspace.id)}
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
        >
          <UserPlusIcon className="w-4 h-4 mr-1" />
          Unirse
        </button>
      </div>
    </div>
  );
};

interface WorkspaceFormProps {
  workspace?: Workspace;
  onSubmit: (data: { name: string; description: string }) => void;
  onCancel: () => void;
}

const WorkspaceForm: React.FC<WorkspaceFormProps> = ({
  workspace,
  onSubmit,
  onCancel
}) => {
  const [name, setName] = useState(workspace?.name || '');
  const [description, setDescription] = useState(workspace?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {workspace ? 'Editar Sala' : 'Nueva Sala de Trabajo'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la sala"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {workspace ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WorkspaceList: React.FC<WorkspaceListProps> = ({ userId }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | undefined>();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast.error('Error al cargar las salas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: { name: string; description: string }) => {
    try {
      const url = editingWorkspace 
        ? `/api/workspaces/${editingWorkspace.id}`
        : '/api/workspaces';
      
      const method = editingWorkspace ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(editingWorkspace ? 'Sala actualizada' : 'Sala creada');
        setShowForm(false);
        setEditingWorkspace(undefined);
        fetchWorkspaces();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting workspace:', error);
      toast.error('Error al procesar la solicitud');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta sala?')) return;

    try {
      const response = await fetch(`/api/workspaces/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Sala eliminada');
        fetchWorkspaces();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al eliminar la sala');
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast.error('Error al eliminar la sala');
    }
  };

  const handleJoin = async (id: number) => {
    try {
      const response = await fetch(`/api/workspaces/${id}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Te has unido a la sala');
        fetchWorkspaces();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al unirse a la sala');
      }
    } catch (error) {
      console.error('Error joining workspace:', error);
      toast.error('Error al unirse a la sala');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Salas de Trabajo</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nueva Sala
        </button>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay salas de trabajo
          </h3>
          <p className="text-gray-500">
            Crea tu primera sala para comenzar a colaborar
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              userRole="owner" // Esto debería venir de la sesión del usuario
              onEdit={(ws) => {
                setEditingWorkspace(ws);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onJoin={handleJoin}
            />
          ))}
        </div>
      )}

      {showForm && (
        <WorkspaceForm
          workspace={editingWorkspace}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingWorkspace(undefined);
          }}
        />
      )}
    </div>
  );
};

export default WorkspaceList;

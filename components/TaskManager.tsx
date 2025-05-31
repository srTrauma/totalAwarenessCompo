import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon,
  PlusIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface TaskManagerProps {
  userId: number;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
  assignee: {
    id: number;
    name: string;
    profileImage?: string;
  } | null;
  creator: {
    id: number;
    name: string;
  };
  workspace: {
    id: number;
    name: string;
  } | null;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const priorityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente'
};

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada'
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow ${isOverdue ? 'border-red-300' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
          {priorityLabels[task.priority as keyof typeof priorityLabels]}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
          {statusLabels[task.status as keyof typeof statusLabels]}
        </span>
      </div>

      {task.dueDate && (
        <div className={`flex items-center text-sm mb-3 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          {isOverdue ? (
            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          ) : (
            <ClockIcon className="w-4 h-4 mr-1" />
          )}
          <span>
            {isOverdue ? 'Vencida: ' : 'Vence: '}
            {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: es })}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {task.assignee && (
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                {task.assignee.profileImage ? (
                  <img
                    src={task.assignee.profileImage}
                    alt={task.assignee.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-blue-600">
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">{task.assignee.name}</span>
            </div>
          )}
        </div>

        {task.status !== 'completed' && (
          <button
            onClick={() => onStatusChange(task.id, task.status === 'pending' ? 'in_progress' : 'completed')}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            {task.status === 'pending' ? 'Iniciar' : 'Completar'}
          </button>
        )}
      </div>

      {task.workspace && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Sala: {task.workspace.name}</span>
        </div>
      )}
    </div>
  );
};

interface TaskFormProps {
  task?: Task;
  workspaces: { id: number; name: string }[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, workspaces, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [status, setStatus] = useState(task?.status || 'pending');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  );
  const [workspaceId, setWorkspaceId] = useState(task?.workspace?.id?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      workspaceId: workspaceId ? parseInt(workspaceId) : null
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {task ? 'Editar Tarea' : 'Nueva Tarea'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Título de la tarea"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {workspaces.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sala de trabajo
              </label>
              <select
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin asignar</option>
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {task ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskManager: React.FC<TaskManagerProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
    fetchWorkspaces();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.map((ws: any) => ({ id: ws.id, name: ws.name })));
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(editingTask ? 'Tarea actualizada' : 'Tarea creada');
        setShowForm(false);
        setEditingTask(undefined);
        fetchTasks();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Error al procesar la solicitud');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Tarea eliminada');
        fetchTasks();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al eliminar la tarea');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error al eliminar la tarea');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Estado actualizado');
        fetchTasks();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

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
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nueva Tarea
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <FunnelIcon className="w-5 h-5 text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas las tareas</option>
          <option value="pending">Pendientes</option>
          <option value="in_progress">En progreso</option>
          <option value="completed">Completadas</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No hay tareas' : `No hay tareas ${statusLabels[filter as keyof typeof statusLabels]?.toLowerCase()}`}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'Crea tu primera tarea para comenzar' : 'Cambia el filtro para ver otras tareas'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(task) => {
                setEditingTask(task);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editingTask}
          workspaces={workspaces}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(undefined);
          }}
        />
      )}
    </div>
  );
};

export default TaskManager;

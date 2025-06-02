import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon,
  PlusIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PaperClipIcon,
  DocumentIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface TaskManagerProps {
  userId: number;
  groupId?: number; // Ahora las tareas pertenecen a grupos
  userRole?: string; // Para controlar permisos
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
  group: {
    id: number;
    name: string;
    workspace: {
      id: number;
      name: string;
    };
  } | null;
  attachments: TaskAttachment[];
}

interface TaskAttachment {
  id: number;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: number;
  uploadedAt: string;
  type: string;
}

interface GroupMember {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
  };
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
  onUploadFile: (taskId: number, type: string) => void;
  canManage: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange, onUploadFile, canManage }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
      isOverdue ? 'border-red-500' : 'border-blue-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
              {priorityLabels[task.priority as keyof typeof priorityLabels]}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
              {statusLabels[task.status as keyof typeof statusLabels]}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Vencida
              </span>
            )}
          </div>

          {task.attachments.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Archivos adjuntos:</p>
              <div className="space-y-1">
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 text-sm text-gray-600">
                    <DocumentIcon className="w-4 h-4" />
                    <a 
                      href={attachment.filePath} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 underline"
                    >
                      {attachment.fileName}
                    </a>
                    {attachment.type === 'completion_proof' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Prueba de completado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p><strong>Creador:</strong> {task.creator.name}</p>
            {task.assignee && (
              <p><strong>Asignado a:</strong> {task.assignee.name}</p>
            )}
            {task.group && (
              <p><strong>Grupo:</strong> {task.group.name} ({task.group.workspace.name})</p>
            )}
            {task.dueDate && (
              <p><strong>Vence:</strong> {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: es })}</p>
            )}
            <p><strong>Creada:</strong> {format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
          </div>
        </div>

        {canManage && (
          <div className="flex flex-col gap-2 ml-4">
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
              title="Editar tarea"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-red-600 hover:text-red-800 transition-colors"
              title="Eliminar tarea"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUploadFile(task.id, 'general')}
              className="p-2 text-green-600 hover:text-green-800 transition-colors"
              title="Subir archivo"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
            </button>
            {task.status !== 'completed' && (
              <button
                onClick={() => onUploadFile(task.id, 'completion_proof')}
                className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                title="Subir prueba de completado"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Botones de cambio de estado */}
      <div className="flex gap-2 mt-4">
        {task.status !== 'in_progress' && task.status !== 'completed' && (
          <button
            onClick={() => onStatusChange(task.id, 'in_progress')}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Iniciar
          </button>
        )}
        {task.status === 'in_progress' && (
          <button
            onClick={() => onStatusChange(task.id, 'completed')}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            Completar
          </button>
        )}
        {task.status !== 'cancelled' && task.status !== 'completed' && (
          <button
            onClick={() => onStatusChange(task.id, 'cancelled')}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Cancelar
          </button>
        )}
        {task.status === 'completed' && (
          <button
            onClick={() => onStatusChange(task.id, 'pending')}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
          >
            Reabrir
          </button>
        )}
      </div>
    </div>
  );
};

const TaskManager: React.FC<TaskManagerProps> = ({ userId, groupId, userRole }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<{taskId: number, type: string} | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  // Formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const canManageTasks = userRole === 'owner' || userRole === 'admin' || userRole === 'leader';

  useEffect(() => {
    fetchTasks();
    if (groupId) {
      fetchGroupMembers();
    }
  }, [groupId]);

  const fetchTasks = async () => {
    try {
      const url = groupId ? `/api/groups/${groupId}/tasks` : '/api/tasks';
      const response = await fetch(url, {
        headers: {
          userid: userId.toString()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        toast.error('Error al cargar las tareas');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async () => {
    if (!groupId) return;
    
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        headers: {
          userid: userId.toString()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroupMembers(data);
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!groupId) {
      toast.error('Debes seleccionar un grupo');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('priority', priority);
      formData.append('status', status);
      formData.append('groupId', groupId.toString());
      
      if (dueDate) {
        formData.append('dueDate', dueDate);
      }
      
      if (assigneeId) {
        formData.append('assigneeId', assigneeId);
      }

      // Agregar archivos
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          userid: userId.toString()
        },
        body: formData
      });

      if (response.ok) {
        const taskData = await response.json();
        
        if (editingTask) {
          setTasks(tasks.map(t => t.id === editingTask.id ? taskData : t));
          toast.success('Tarea actualizada correctamente');
        } else {
          setTasks([taskData, ...tasks]);
          toast.success('Tarea creada correctamente');
        }

        resetForm();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al guardar la tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
    setAssigneeId(task.assignee?.id.toString() || '');
    setAttachments([]);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          userid: userId.toString()
        }
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id));
        toast.success('Tarea eliminada correctamente');
      } else {
        toast.error('Error al eliminar la tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          userid: userId.toString()
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === id ? updatedTask : t));
        toast.success('Estado actualizado correctamente');
      } else {
        toast.error('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleUploadFile = async (taskId: number, type: string) => {
    setShowUploadModal({ taskId, type });
  };

  const submitFileUpload = async () => {
    if (!uploadFile || !showUploadModal) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('type', showUploadModal.type);

      const response = await fetch(`/api/tasks/${showUploadModal.taskId}/attachments`, {
        method: 'POST',
        headers: {
          userid: userId.toString()
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Archivo subido correctamente');
        fetchTasks(); // Recargar para mostrar el nuevo archivo
        setShowUploadModal(null);
        setUploadFile(null);
      } else {
        toast.error('Error al subir el archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('pending');
    setDueDate('');
    setAssigneeId('');
    setAttachments([]);
    setEditingTask(null);
  };

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterAssignee !== 'all') {
      if (filterAssignee === 'unassigned' && task.assignee) return false;
      if (filterAssignee !== 'unassigned' && task.assignee?.id.toString() !== filterAssignee) return false;
    }
    return true;
  });

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
        <div className="flex items-center gap-3">
          <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            {groupId ? 'Tareas del Grupo' : 'Gestión de Tareas'}
          </h2>
        </div>
        {canManageTasks && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Tarea
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Filtros:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las prioridades</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los asignados</option>
            <option value="unassigned">Sin asignar</option>
            {groupMembers.map(member => (
              <option key={member.userId} value={member.userId.toString()}>
                {member.user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClipboardDocumentListIcon className="mx-auto w-12 h-12 mb-4" />
            <p>No hay tareas que coincidan con los filtros.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onUploadFile={handleUploadFile}
              canManage={canManageTasks}
            />
          ))
        )}
      </div>

      {/* Modal de crear/editar tarea */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Título de la tarea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              <textarea
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Prioridad Baja</option>
                  <option value="medium">Prioridad Media</option>
                  <option value="high">Prioridad Alta</option>
                  <option value="urgent">Urgente</option>
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin asignar</option>
                {groupMembers.map(member => (
                  <option key={member.userId} value={member.userId.toString()}>
                    {member.user.name}
                  </option>
                ))}
              </select>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivos adjuntos
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {attachments.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {attachments.length} archivo(s) seleccionado(s)
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTask ? 'Actualizar' : 'Crear'} Tarea
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de subida de archivos */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">
              {showUploadModal.type === 'completion_proof' ? 'Subir Prueba de Completado' : 'Subir Archivo'}
            </h3>
            <div className="space-y-4">
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={submitFileUpload}
                  disabled={!uploadFile || uploading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Subiendo...' : 'Subir'}
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(null);
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;

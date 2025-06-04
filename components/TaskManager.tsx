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
  DocumentIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface TaskManagerProps {
  userId: number;
  projectId: number;
  groupId?: number;
  userRole?: string;
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
    project: {
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

interface Group {
  id: number;
  name: string;
  project?: {
    id: number;
    name: string;
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
  onCompleteWithFiles?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange, onCompleteWithFiles }) => {
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
        </div>        {task.status !== 'completed' && (
          <div className="flex space-x-2">
            {task.status === 'in_progress' && onCompleteWithFiles && (
              <button
                onClick={() => onCompleteWithFiles(task)}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <PaperClipIcon className="w-4 h-4 mr-1" />
                Completar con archivos
              </button>
            )}
            <button
              onClick={() => onStatusChange(task.id, task.status === 'pending' ? 'in_progress' : 'completed')}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              {task.status === 'pending' ? 'Iniciar' : 'Completar'}
            </button>
          </div>
        )}
      </div>      {task.group && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Grupo: {task.group.name} • Proyecto: {task.group.project?.name || 'Sin proyecto'}
          </span>
        </div>
      )}

      {/* Mostrar attachments si existen */}
      {task.attachments && Array.isArray(task.attachments) && task.attachments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <PaperClipIcon className="w-3 h-3 mr-1" />
            <span>{task.attachments.length} archivo(s) adjunto(s)</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {task.attachments.slice(0, 3).map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded truncate max-w-32"
                title={attachment.fileName}
              >
                <DocumentIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{attachment.fileName}</span>
              </a>
            ))}
            {task.attachments.length > 3 && (
              <span className="text-xs text-gray-400 px-2 py-1">
                +{task.attachments.length - 3} más
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskFormProps {
  task?: Task;
  groups: Group[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, groups, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [status, setStatus] = useState(task?.status || 'pending');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  );
  const [groupId, setGroupId] = useState(task?.group?.id?.toString() || '');
  const [attachments, setAttachments] = useState<File[]>([]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    const formData = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      groupId: groupId ? parseInt(groupId) : null,
      attachments: attachments
    };

    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
          </div>          {groups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >                <option value="">Sin asignar</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} {group.project?.name ? `(${group.project.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivos adjuntos
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
            />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                    <span className="text-sm text-gray-600 truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {task ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CompleteTaskFormProps {
  task: Task;
  onSubmit: (files: File[]) => void;
  onCancel: () => void;
}

const CompleteTaskForm: React.FC<CompleteTaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(files);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">
          Completar Tarea: {task.title}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivos de entrega
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes seleccionar múltiples archivos para adjuntar
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Archivos seleccionados:
              </label>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm text-gray-600 truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Completar Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskManager: React.FC<TaskManagerProps> = ({ userId, projectId, groupId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [filter, setFilter] = useState('all');
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completingTask, setCompletingTask] = useState<Task | undefined>();

  useEffect(() => {
    fetchTasks();
    fetchGroups();
  }, [groupId, projectId]);

  const fetchTasks = async () => {
    if (!projectId || !groupId) return;
    try {
      const url = `/api/projects/${projectId}/groups/${groupId}/tasks`;
      const response = await fetch(url, {
        headers: {
          'userid': userId.toString()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al cargar las tareas');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/groups`, {
        headers: {
          'userid': userId.toString()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al cargar los grupos');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };  const handleSubmit = async (data: any) => {
    if (!projectId || !groupId) {
      toast.error('Project ID y Group ID son requeridos');
      return;
    }
    
    try {
      const url = editingTask
        ? `/api/tasks/test-put?taskId=${editingTask.id}`
        : `/api/projects/${projectId}/groups/${groupId}/tasks`;
      const method = editingTask ? 'PUT' : 'POST';
      
      let body;
      let headers: any = {
        'userid': userId.toString()
      };

      // Si hay archivos adjuntos, usar FormData
      if (data.attachments && data.attachments.length > 0 && !editingTask) {
        const formData = new FormData();
        
        // Agregar campos de texto
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('priority', data.priority);
        formData.append('status', data.status);
        if (data.dueDate) formData.append('dueDate', data.dueDate);
        if (data.groupId) formData.append('groupId', data.groupId.toString());
        
        // Agregar archivos
        data.attachments.forEach((file: File) => {
          formData.append('attachments', file);
        });
        
        body = formData;
        // No establecer Content-Type, el navegador lo hará automáticamente con boundary
      } else {
        // Usar JSON para actualizaciones o cuando no hay archivos
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate,
          groupId: data.groupId
        });
      }

      const response = await fetch(url, {
        method,
        headers,
        body,
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
  };  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

    try {
      // Usar endpoint real de eliminación
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'userid': userId.toString()
        }
      });

      
      
      if (response.ok) {
        const result = await response.json();
        
        toast.success('Tarea eliminada correctamente');
        fetchTasks(); // Recargar tareas
      } else {
        const error = await response.json();
        
        toast.error(error.message || 'Error al eliminar la tarea');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error al eliminar la tarea');
    }
  };

  const handleCompleteWithFiles = (task: Task) => {
    setCompletingTask(task);
    setShowCompleteForm(true);
  };  const handleCompleteSubmit = async (files: File[]) => {
    if (!completingTask) return;
    
    try {
      // Primero actualizar el estado a completed
      const updateResponse = await fetch(`/api/tasks/test-put?taskId=${completingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'userid': userId.toString()
        },
        body: JSON.stringify({
          title: completingTask.title,
          description: completingTask.description || '',
          priority: completingTask.priority,
          status: 'completed',
          dueDate: completingTask.dueDate,
          groupId: completingTask.group?.id || null,
          assigneeId: completingTask.assignee?.id || null
        }),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        toast.error(error.message || 'Error al completar la tarea');
        return;
      }

      // Si hay archivos, subirlos como attachments
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('attachments', file);
        });

        const attachResponse = await fetch(`/api/tasks/${completingTask.id}/attachments`, {
          method: 'POST',
          headers: {
            'userid': userId.toString()
          },
          body: formData,
        });

        if (!attachResponse.ok) {
          const error = await attachResponse.json();
          toast.error(error.message || 'Error al subir archivos');
          return;
        }
      }

      toast.success('Tarea completada' + (files.length > 0 ? ' con archivos adjuntos' : ''));
      setShowCompleteForm(false);
      setCompletingTask(undefined);
      fetchTasks();
    } catch (error) {
      console.error('Error completing task with files:', error);
      toast.error('Error al completar la tarea');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'userid': userId.toString()
        },
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">
          {groups.length > 0 ? 'Tareas del Grupo' : 'Tareas'}
        </h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>          <button
            onClick={() => setShowForm(true)}
            disabled={!projectId || !groupId}
            className={`inline-flex items-center px-3 py-2 rounded-md transition-colors text-sm ${
              !projectId || !groupId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={!projectId || !groupId ? 'Selecciona un proyecto y grupo primero' : ''}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Nueva Tarea
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <span className="text-gray-500">Cargando tareas...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-4">
              <span className="text-gray-500">No hay tareas disponibles</span>
            </div>
          ) : (            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(task) => {
                  setEditingTask(task);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onCompleteWithFiles={handleCompleteWithFiles}
              />
            ))
          )}
        </div>
      )}      {showForm && (
        <TaskForm
          task={editingTask}
          groups={groups}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(undefined);
          }}
        />
      )}

      {showCompleteForm && completingTask && (
        <CompleteTaskForm
          task={completingTask}
          onSubmit={handleCompleteSubmit}
          onCancel={() => {
            setShowCompleteForm(false);
            setCompletingTask(undefined);
          }}
        />
      )}
    </div>
  );
};

export default TaskManager;
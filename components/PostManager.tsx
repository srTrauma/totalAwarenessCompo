import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  LinkIcon,
  PhotoIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface PostManagerProps {
  userId: number;
  companyId: number;
  userRole: string; // Agregar rol del usuario en la empresa
}

interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  linkUrl: string | null;
  type: string;
  isActive: boolean;
  createdAt: string;
  author: {
    id: number;
    name: string;
    profileImage?: string;
  };
  company: {
    id: number;
    name: string;
  };
}

const postTypeConfig = {
  general: {
    label: 'General',
    icon: DocumentTextIcon,
    color: 'bg-blue-100 text-blue-800'
  },
  job_offer: {
    label: 'Oferta de Empleo',
    icon: BriefcaseIcon,
    color: 'bg-green-100 text-green-800'
  },
  news: {
    label: 'Noticia',
    icon: MegaphoneIcon,
    color: 'bg-purple-100 text-purple-800'
  },
  event: {
    label: 'Evento',
    icon: CalendarIcon,
    color: 'bg-orange-100 text-orange-800'
  }
};

interface PostCardProps {
  post: Post;
  isOwner: boolean;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  isOwner, 
  onEdit, 
  onDelete, 
  onToggleActive 
}) => {
  const router = useRouter();
  const typeConfig = postTypeConfig[post.type as keyof typeof postTypeConfig] || postTypeConfig.general;
  const IconComponent = typeConfig.icon;

  const handleViewPost = () => {
    router.push(`/posts/${post.id}`);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow ${!post.isActive ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            {post.author.profileImage ? (
              <img
                src={post.author.profileImage}
                alt={post.author.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-blue-600">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
            <p className="text-sm text-gray-500">
              {post.company.name} • {format(new Date(post.createdAt), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={() => onToggleActive(post.id, !post.isActive)}
              className={`${post.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              title={post.isActive ? 'Desactivar' : 'Activar'}
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onEdit(post)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
          <IconComponent className="w-3 h-3 mr-1" />
          {typeConfig.label}
        </span>
      </div>

      {post.imageUrl && (
        <div className="mb-4">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}      <div className="mb-4">
        <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">{post.content}</p>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleViewPost}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
        >
          <EyeIcon className="w-4 h-4 mr-1" />
          Ver completo
        </button>

        {post.linkUrl && (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors text-sm"
          >
            <LinkIcon className="w-4 h-4 mr-1" />
            Enlace
          </a>
        )}
      </div>
    </div>
  );
};

interface PostFormProps {
  post?: Post;
  companies: { id: number; name: string }[];
  currentCompanyId?: number;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitting?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ post, companies, currentCompanyId, onSubmit, onCancel, submitting = false }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [type, setType] = useState(post?.type || 'general');
  const [linkUrl, setLinkUrl] = useState(post?.linkUrl || '');
  const [companyId, setCompanyId] = useState(
    post?.company?.id?.toString() || 
    currentCompanyId?.toString() || 
    ''
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post?.imageUrl || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede exceder 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    
    if (!content.trim()) {
      toast.error('El contenido es requerido');
      return;
    }

    if (!companyId) {
      toast.error('Debes seleccionar una empresa');
      return;
    }

    let imageUrl = post?.imageUrl || null;

    // Subir imagen si se seleccionó una nueva
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('type', 'post');

      try {
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.imageUrl;
        } else {
          toast.error('Error al subir la imagen');
          return;
        }
      } catch (error) {
        toast.error('Error al subir la imagen');
        return;
      }
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      type,
      linkUrl: linkUrl.trim() || null,
      imageUrl,
      companyId: parseInt(companyId)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {post ? 'Editar Post' : 'Nuevo Post'}
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
              placeholder="Título del post"
              required
            />
          </div>          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de publicación *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(postTypeConfig).map(([value, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        type === value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <IconComponent className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">{config.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contenido del post"
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enlace (opcional)
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen (opcional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-32 w-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Subir imagen</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {post ? 'Actualizando...' : 'Publicando...'}
                </>
              ) : (
                post ? 'Actualizar' : 'Publicar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PostManager: React.FC<PostManagerProps> = ({ userId, companyId, userRole }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>();  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Solo owners y admins pueden crear posts
  const canCreatePosts = userRole === 'OWNER' || userRole === 'ADMIN';
  useEffect(() => {
    fetchPosts();
    fetchCompanies();
  }, []);

  // Agregar shortcuts de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K para enfocar búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Ctrl/Cmd + N para crear nuevo post (solo si puede crear)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && canCreatePosts) {
        e.preventDefault();
        setShowForm(true);
      }
      
      // Escape para cerrar formulario
      if (e.key === 'Escape' && showForm) {
        setShowForm(false);
        setEditingPost(undefined);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canCreatePosts, showForm]);
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts', {
        headers: {
          'userid': userId.toString()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al cargar los posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Error al cargar los posts');
    } finally {
      setLoading(false);
    }
  };  const fetchCompanies = async () => {
    try {      const response = await fetch(`/api/companies/list?userId=${userId}`, {
        headers: {
          'userid': userId.toString()
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrar para incluir solo la empresa actual si companyId está especificado
        const availableCompanies = data.map((c: any) => ({ id: c.id, name: c.name }));
        if (companyId) {
          // Si se especifica una empresa, solo mostrar esa empresa
          const currentCompany = availableCompanies.find((c: any) => c.id === companyId);
          setCompanies(currentCompany ? [currentCompany] : availableCompanies);
        } else {
          setCompanies(availableCompanies);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al cargar las empresas');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const url = editingPost ? `/api/posts/${editingPost.id}` : '/api/posts';
      const method = editingPost ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'userid': userId.toString()
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(editingPost ? 'Post actualizado' : 'Post publicado');
        setShowForm(false);
        setEditingPost(undefined);
        fetchPosts();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'userid': userId.toString()
        }
      });

      if (response.ok) {
        toast.success('Post eliminado');
        fetchPosts();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al eliminar el post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error al eliminar el post');
    }
  };
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'userid': userId.toString()
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        toast.success(isActive ? 'Post activado' : 'Post desactivado');
        fetchPosts();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al actualizar el post');
      }
    } catch (error) {
      console.error('Error toggling post status:', error);
      toast.error('Error al actualizar el post');
    }
  };  const filteredPosts = posts.filter(post => {
    // Filtro por tipo
    const typeMatch = filter === 'all' || post.type === filter;
    
    // Filtro por búsqueda
    const searchMatch = searchQuery.trim() === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return typeMatch && searchMatch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón crear y filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6">        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Posts de Empresa</h2>
            <p className="text-sm text-gray-600">
              Gestiona las publicaciones de tu empresa
              <span className="ml-2 text-xs text-gray-400">
                (Ctrl+K para buscar{canCreatePosts ? ', Ctrl+N para crear' : ''})
              </span>
            </p>
          </div>
          
          {canCreatePosts && (
            <button 
              onClick={() => setShowForm(true)} 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Crear Post
            </button>
          )}
        </div>        {/* Filtros y búsqueda */}
        <div className="mt-6 border-t pt-4 space-y-4">          {/* Barra de búsqueda y ordenamiento */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, contenido o autor..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="title">Por título</option>
            </select>
            
            {(searchQuery || filter !== 'all' || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                  setSortBy('newest');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Restablecer
              </button>
            )}
          </div>
            {/* Estadísticas de resultados */}
          {(searchQuery || filter !== 'all' || sortBy !== 'newest') && (
            <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
              <span>
                Mostrando {filteredPosts.length} de {posts.length} posts
                {searchQuery && ` con "${searchQuery}"`}
                {filter !== 'all' && ` del tipo "${postTypeConfig[filter as keyof typeof postTypeConfig]?.label}"`}
              </span>
              <span className="text-gray-400">•</span>
              <span>
                Ordenado por: {
                  sortBy === 'newest' ? 'más recientes' :
                  sortBy === 'oldest' ? 'más antiguos' : 'título'
                }
              </span>
            </div>
          )}
            {/* Filtros por tipo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
              {(filter !== 'all' || searchQuery) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {filteredPosts.length} resultado{filteredPosts.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                Todos ({posts.length})
              </button>
              
              {Object.entries(postTypeConfig).map(([key, config]) => {
                const count = posts.filter(post => post.type === key).length;
                const IconComponent = config.icon;
                
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter === key
                        ? `${config.color} shadow-md ring-2 ring-offset-1 ring-current`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {config.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Formulario modal */}
      {showForm && (
        <PostForm
          companies={companies}
          currentCompanyId={companyId}
          onSubmit={handleSubmit}          onCancel={() => {
            setShowForm(false);
            setEditingPost(undefined);
          }}
          post={editingPost}
          submitting={submitting}
        />
      )}      {/* Lista de posts */}
      <div className="space-y-4">        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={userId === post.author.id || ['OWNER', 'ADMIN'].includes(userRole)}
              onEdit={(post) => {
                setEditingPost(post);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))
        ) : (          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchQuery && filter !== 'all' 
                ? `No se encontraron posts que contengan "${searchQuery}" del tipo "${postTypeConfig[filter as keyof typeof postTypeConfig]?.label}"`
                : searchQuery 
                ? `No se encontraron posts que contengan "${searchQuery}"`
                : filter !== 'all' 
                ? `No hay posts de tipo "${postTypeConfig[filter as keyof typeof postTypeConfig]?.label}"`
                : 'No hay posts'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filter !== 'all' 
                ? 'Intenta cambiar los filtros de búsqueda.'
                : canCreatePosts 
                ? 'Comienza creando tu primer post.' 
                : 'No hay contenido disponible en este momento.'
              }
            </p>
            {canCreatePosts && !searchQuery && filter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Crear tu primer post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostManager;

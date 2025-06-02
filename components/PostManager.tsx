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
  CalendarIcon
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
}

const PostForm: React.FC<PostFormProps> = ({ post, companies, currentCompanyId, onSubmit, onCancel }) => {
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(postTypeConfig).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
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
              {post ? 'Actualizar' : 'Publicar'}
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
  const [editingPost, setEditingPost] = useState<Post | undefined>();
  const [filter, setFilter] = useState('all');

  // Solo owners y admins pueden crear posts
  const canCreatePosts = userRole === 'OWNER' || userRole === 'ADMIN';

  useEffect(() => {
    fetchPosts();
    fetchCompanies();
  }, []);
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
  };
  const handleSubmit = async (data: any) => {
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
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'active') return post.isActive;
    if (filter === 'inactive') return !post.isActive;
    return post.type === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Posts</h2>
        {canCreatePosts && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Post
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los posts</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="general">General</option>
          <option value="job_offer">Ofertas de empleo</option>
          <option value="news">Noticias</option>
          <option value="event">Eventos</option>
        </select>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay posts
          </h3>
          <p className="text-gray-500">
            Crea tu primer post para comenzar a compartir contenido
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={true} // Esto debería venir de la sesión del usuario
              onEdit={(post) => {
                setEditingPost(post);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}      {showForm && (
        <PostForm
          post={editingPost}
          companies={companies}
          currentCompanyId={companyId}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPost(undefined);
          }}
        />
      )}
    </div>
  );
};

export default PostManager;

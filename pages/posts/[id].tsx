import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { 
  FaArrowLeft, 
  FaBuilding, 
  FaUser, 
  FaCalendar, 
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { 
  DocumentTextIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  linkUrl: string | null;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export default function PostDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }

    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${id}`);
      if (response.ok) {
        const postData = await response.json();
        setPost(postData);
        
        // Verificar si el usuario puede editar este post
        if (user) {
          setCanEdit(postData.author.id === user.id);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Post no encontrado');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Error al cargar el post');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!post || !user) return;

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'userid': user.id.toString()
        },
        body: JSON.stringify({ isActive: !post.isActive }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
        toast.success(updatedPost.isActive ? 'Post activado' : 'Post desactivado');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al actualizar el post');
      }
    } catch (error) {
      console.error('Error toggling post status:', error);
      toast.error('Error al actualizar el post');
    }
  };

  const handleDelete = async () => {
    if (!post || !user) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) return;

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'userid': user.id.toString()
        }
      });

      if (response.ok) {
        toast.success('Post eliminado');
        router.push('/posts');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al eliminar el post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error al eliminar el post');
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

  if (!post) {
    return (
      <>
        <Head>
          <title>Post no encontrado | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Post no encontrado</h1>
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:underline"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const typeConfig = postTypeConfig[post.type as keyof typeof postTypeConfig] || postTypeConfig.general;
  const IconComponent = typeConfig.icon;

  return (
    <>
      <Head>
        <title>{post.title} | Total Awareness</title>
        <meta name="description" content={post.content.substring(0, 160)} />
      </Head>
      
      <NavBar />
      
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Botón de volver */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 mb-4 hover:underline"
            >
              <FaArrowLeft className="mr-2" /> Volver
            </button>
          </div>

          {/* Contenido del post */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header del post */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {post.author.profileImage ? (
                      <img
                        src={post.author.profileImage}
                        alt={post.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-blue-600">
                        {post.author.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FaUser className="mr-2 text-gray-500" />
                      {post.author.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <FaBuilding className="mr-1" />
                        {post.company.name}
                      </div>
                      <div className="flex items-center">
                        <FaCalendar className="mr-1" />
                        {format(new Date(post.createdAt), 'dd MMM yyyy, HH:mm', { locale: es })}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Acciones para el autor */}
                {canEdit && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleToggleActive}
                      className={`p-2 rounded-lg transition-colors ${
                        post.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={post.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {post.isActive ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                    </button>
                    <button
                      onClick={() => router.push(`/posts/${post.id}/edit`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Tipo de post */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeConfig.color}`}>
                  <IconComponent className="w-4 h-4 mr-2" />
                  {typeConfig.label}
                </span>
                {!post.isActive && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactivo
                  </span>
                )}
              </div>

              {/* Título */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
            </div>

            {/* Imagen del post */}
            {post.imageUrl && (
              <div className="w-full">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Contenido */}
            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Enlace externo */}
              {post.linkUrl && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaExternalLinkAlt className="mr-2" />
                    Ver más información
                  </a>
                </div>
              )}

              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
                <div className="flex justify-between items-center">
                  <span>
                    Publicado el {format(new Date(post.createdAt), 'dd MMMM yyyy', { locale: es })}
                  </span>
                  {post.updatedAt !== post.createdAt && (
                    <span>
                      Actualizado el {format(new Date(post.updatedAt), 'dd MMMM yyyy', { locale: es })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/posts')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver todos los posts
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

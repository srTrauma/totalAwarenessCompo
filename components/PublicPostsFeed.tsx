import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  DocumentTextIcon,
  LinkIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface PublicPostsFeedProps {
  userId?: number;
}

const PublicPostsFeed: React.FC<PublicPostsFeedProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPublicPosts();
  }, [userId]);

  const fetchPublicPosts = async () => {
    try {
      const headers: any = {};
      if (userId) {
        headers.userid = userId.toString();
      }

      const response = await fetch('/api/posts', {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.filter((post: Post) => post.isActive));
      } else {
        console.error('Error fetching public posts');
      }
    } catch (error) {
      console.error('Error fetching public posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.type === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Posts Públicos</h2>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los posts</option>
          <option value="general">General</option>
          <option value="job_offer">Ofertas de empleo</option>
          <option value="news">Noticias</option>
          <option value="event">Eventos</option>
        </select>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay posts públicos
          </h3>
          <p className="text-gray-500">
            No se encontraron posts públicos en este momento
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const router = useRouter();
  const typeConfig = postTypeConfig[post.type as keyof typeof postTypeConfig] || postTypeConfig.general;
  const IconComponent = typeConfig.icon;

  const handleViewPost = () => {
    router.push(`/posts/${post.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
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
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <BuildingOfficeIcon className="w-4 h-4" />
            <span>{post.company.name}</span>
            <span>•</span>
            <span>{format(new Date(post.createdAt), 'dd MMM yyyy', { locale: es })}</span>
          </div>
        </div>
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
        <p className="text-gray-700 line-clamp-3">{post.content}</p>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          onClick={handleViewPost}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <EyeIcon className="w-4 h-4 mr-2" />
          <span className="text-sm">Ver post completo</span>
        </button>

        {post.linkUrl && (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            <span className="text-sm">Enlace externo</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default PublicPostsFeed;

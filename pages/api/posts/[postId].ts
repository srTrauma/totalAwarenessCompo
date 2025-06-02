import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId } = req.query;
  const postIdNum = parseInt(postId as string);

  if (isNaN(postIdNum)) {
    return res.status(400).json({ message: 'ID de post inválido' });
  }

  try {
    if (req.method === 'GET') {
      // Obtener post individual
      const post = await prisma.post.findUnique({
        where: { id: postIdNum },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!post) {
        return res.status(404).json({ message: 'Post no encontrado' });
      }

      // Solo mostrar posts activos para usuarios no autenticados o que no son el autor
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!post.isActive && post.authorId !== userId) {
        return res.status(404).json({ message: 'Post no encontrado' });
      }

      res.status(200).json(post);    } else if (req.method === 'PUT') {
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      // Actualizar post
      const { title, content, imageUrl, linkUrl, type } = req.body;

      // Verificar que el usuario sea el autor del post
      const existingPost = await prisma.post.findFirst({
        where: {
          id: postIdNum,
          authorId: userId
        }
      });

      if (!existingPost) {
        return res.status(404).json({ message: 'Post no encontrado o sin permisos' });
      }

      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: 'El título es requerido' });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'El contenido es requerido' });
      }

      const validTypes = ['general', 'job_offer', 'news', 'event'];
      if (type && !validTypes.includes(type)) {
        return res.status(400).json({ message: 'Tipo de post inválido' });
      }

      const updatedPost = await prisma.post.update({
        where: { id: postIdNum },
        data: {
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl?.trim() || null,
          linkUrl: linkUrl?.trim() || null,
          type: type || 'general'
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.status(200).json(updatedPost);

    } else if (req.method === 'DELETE') {
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      
      // Eliminar post
      const existingPost = await prisma.post.findFirst({
        where: {
          id: postIdNum,
          authorId: userId
        }
      });

      if (!existingPost) {
        return res.status(404).json({ message: 'Post no encontrado o sin permisos' });
      }

      await prisma.post.delete({
        where: { id: postIdNum }
      });

      res.status(200).json({ message: 'Post eliminado correctamente' });

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error in post API:', error);
    
    if (error instanceof Error && error.message.includes('Record to')) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

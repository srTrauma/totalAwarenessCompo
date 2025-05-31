import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const postId = parseInt(id as string);

  if (isNaN(postId)) {
    return res.status(400).json({ message: 'ID de post inválido' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method === 'PUT') {
      // Actualizar post completo
      const { title, content, imageUrl, linkUrl, type } = req.body;

      // Verificar permisos
      const existingPost = await prisma.post.findFirst({
        where: {
          id: postId,
          OR: [
            { authorId: userId },
            {
              company: {
                members: {
                  some: {
                    userId: userId,
                    approved: true,
                    role: {
                      name: { in: ['OWNER', 'ADMIN'] }
                    }
                  }
                }
              }
            }
          ]
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
        where: { id: postId },
        data: {
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl || null,
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

    } else if (req.method === 'PATCH') {
      // Actualización parcial (principalmente para activar/desactivar)
      const updateData: any = {};
      
      // Verificar permisos
      const existingPost = await prisma.post.findFirst({
        where: {
          id: postId,
          OR: [
            { authorId: userId },
            {
              company: {
                members: {
                  some: {
                    userId: userId,
                    approved: true,
                    role: {
                      name: { in: ['OWNER', 'ADMIN'] }
                    }
                  }
                }
              }
            }
          ]
        }
      });

      if (!existingPost) {
        return res.status(404).json({ message: 'Post no encontrado o sin permisos' });
      }

      const { title, content, imageUrl, linkUrl, type, isActive } = req.body;

      if (title !== undefined) {
        if (!title || title.trim().length === 0) {
          return res.status(400).json({ message: 'El título no puede estar vacío' });
        }
        updateData.title = title.trim();
      }

      if (content !== undefined) {
        if (!content || content.trim().length === 0) {
          return res.status(400).json({ message: 'El contenido no puede estar vacío' });
        }
        updateData.content = content.trim();
      }

      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl;
      }

      if (linkUrl !== undefined) {
        updateData.linkUrl = linkUrl?.trim() || null;
      }

      if (type !== undefined) {
        const validTypes = ['general', 'job_offer', 'news', 'event'];
        if (!validTypes.includes(type)) {
          return res.status(400).json({ message: 'Tipo de post inválido' });
        }
        updateData.type = type;
      }

      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Se debe proporcionar al menos un campo para actualizar' });
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: updateData,
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
      // Eliminar post
      const existingPost = await prisma.post.findFirst({
        where: {
          id: postId,
          OR: [
            { authorId: userId },
            {
              company: {
                members: {
                  some: {
                    userId: userId,
                    approved: true,
                    role: {
                      name: { in: ['OWNER', 'ADMIN'] }
                    }
                  }
                }
              }
            }
          ]
        }
      });

      if (!existingPost) {
        return res.status(404).json({ message: 'Post no encontrado o sin permisos' });
      }

      await prisma.post.delete({
        where: { id: postId }
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

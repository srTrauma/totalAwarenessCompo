import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { workspaceId } = req.query;
  const workspaceIdNum = parseInt(workspaceId as string);

  if (isNaN(workspaceIdNum)) {
    return res.status(400).json({ message: 'ID de workspace inválido' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method === 'GET') {
      // Obtener posts del workspace
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceIdNum,
          members: {
            some: {
              userId: userId
            }
          }
        }
      });

      if (!workspace) {
        return res.status(404).json({ message: 'Workspace no encontrado' });
      }

      // Obtener posts de la empresa del workspace
      const posts = await prisma.post.findMany({
        where: {
          companyId: workspace.companyId,
          isActive: true
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json(posts);

    } else if (req.method === 'POST') {
      // Crear nuevo post en el workspace
      const { title, content, imageUrl, linkUrl, type = 'general' } = req.body;

      // Verificar que el usuario es miembro del workspace
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceIdNum,
          members: {
            some: {
              userId: userId
            }
          }
        }
      });

      if (!workspace) {
        return res.status(404).json({ message: 'Workspace no encontrado o sin permisos' });
      }

      // Verificar que el usuario es miembro de la empresa
      const userCompany = await prisma.userCompany.findFirst({
        where: {
          userId: userId,
          companyId: workspace.companyId,
          approved: true
        }
      });

      if (!userCompany) {
        return res.status(403).json({ message: 'Sin permisos para crear posts en esta empresa' });
      }

      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: 'El título es requerido' });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'El contenido es requerido' });
      }

      const validTypes = ['general', 'job_offer', 'news', 'event'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Tipo de post inválido' });
      }

      const newPost = await prisma.post.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl?.trim() || null,
          linkUrl: linkUrl?.trim() || null,
          type: type,
          authorId: userId,
          companyId: workspace.companyId,
          isActive: true
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

      res.status(201).json(newPost);

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error in workspace posts API:', error);
    
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

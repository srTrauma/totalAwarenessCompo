import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Obtener posts públicos o del usuario
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      const { companyId, type, isActive } = req.query;

      let whereClause: any = {};

      // Si hay usuario, mostrar posts de sus empresas
      if (userId) {
        whereClause = {
          OR: [
            // Posts de empresas públicas
            { company: { public: true } },
            // Posts de empresas donde el usuario es miembro
            {
              company: {
                members: {
                  some: {
                    userId: userId,
                    approved: true
                  }
                }
              }
            }
          ]
        };
      } else {
        // Solo posts públicos para usuarios no autenticados
        whereClause.company = { public: true };
      }

      // Filtros adicionales
      if (companyId) {
        whereClause.companyId = parseInt(companyId as string);
      }

      if (type) {
        whereClause.type = type;
      }

      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const posts = await prisma.post.findMany({
        where: whereClause,
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
      // Crear nuevo post
      const { title, content, imageUrl, linkUrl, type, companyId } = req.body;
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: 'El título es requerido' });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'El contenido es requerido' });
      }

      if (!companyId) {
        return res.status(400).json({ message: 'La empresa es requerida' });
      }

      // Verificar que el usuario tiene permisos en la empresa
      const membership = await prisma.userCompany.findFirst({
        where: {
          userId: userId,
          companyId: companyId,
          approved: true
        },
        include: {
          role: true
        }
      });

      if (!membership) {
        return res.status(403).json({ message: 'No tienes permisos para publicar en esta empresa' });
      }

      // Solo OWNER y ADMIN pueden crear posts
      if (!['OWNER', 'ADMIN'].includes(membership.role.name)) {
        return res.status(403).json({ message: 'No tienes permisos para crear posts' });
      }

      const validTypes = ['general', 'job_offer', 'news', 'event'];
      if (type && !validTypes.includes(type)) {
        return res.status(400).json({ message: 'Tipo de post inválido' });
      }

      const post = await prisma.post.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl || null,
          linkUrl: linkUrl?.trim() || null,
          type: type || 'general',
          authorId: userId,
          companyId: companyId
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

      res.status(201).json(post);

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error in posts API:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

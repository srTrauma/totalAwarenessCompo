import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Obtener todas las salas del usuario
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const workspaces = await prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true
                }
              }
            }
          },
          _count: {
            select: {
              tasks: true,
              members: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      res.status(200).json(workspaces);

    } else if (req.method === 'POST') {
      // Crear nueva sala
      const { name, description, companyId } = req.body;
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'El nombre es requerido' });
      }

      // Crear la sala
      const workspace = await prisma.workspace.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          companyId: companyId || null,
          members: {
            create: {
              userId: userId,
              role: 'owner'
            }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true
                }
              }
            }
          },
          _count: {
            select: {
              tasks: true,
              members: true
            }
          }
        }
      });

      res.status(201).json(workspace);

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error in workspaces API:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

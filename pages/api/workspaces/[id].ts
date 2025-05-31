import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const workspaceId = parseInt(id as string);

  if (isNaN(workspaceId)) {
    return res.status(400).json({ message: 'ID de sala inválido' });
  }

  try {
    if (req.method === 'PUT') {
      // Actualizar sala
      const { name, description } = req.body;
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      // Verificar que el usuario sea owner de la sala
      const membership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: workspaceId,
          userId: userId,
          role: 'owner'
        }
      });

      if (!membership) {
        return res.status(403).json({ message: 'No tienes permisos para editar esta sala' });
      }

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'El nombre es requerido' });
      }

      const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          name: name.trim(),
          description: description?.trim() || null,
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

      res.status(200).json(updatedWorkspace);

    } else if (req.method === 'DELETE') {
      // Eliminar sala
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      // Verificar que el usuario sea owner de la sala
      const membership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: workspaceId,
          userId: userId,
          role: 'owner'
        }
      });

      if (!membership) {
        return res.status(403).json({ message: 'No tienes permisos para eliminar esta sala' });
      }

      // Eliminar la sala (esto eliminará automáticamente los miembros y tareas por cascada)
      await prisma.workspace.delete({
        where: { id: workspaceId }
      });

      res.status(200).json({ message: 'Sala eliminada correctamente' });

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error in workspace API:', error);
    
    if (error instanceof Error && error.message.includes('Record to')) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Obtener todas las tareas del usuario
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const tasks = await prisma.task.findMany({
        where: {
          OR: [
            { assigneeId: userId },
            { creatorId: userId },
            {
              workspace: {
                members: {
                  some: {
                    userId: userId
                  }
                }
              }
            }
          ]
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true
            }
          },
          workspace: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      res.status(200).json(tasks);

    } else if (req.method === 'POST') {
      // Crear nueva tarea
      const { title, description, priority, status, dueDate, workspaceId, assigneeId } = req.body;
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: 'El título es requerido' });
      }

      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({ message: 'Prioridad inválida' });
      }

      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Estado inválido' });
      }

      // Verificar que el workspace existe si se proporciona
      if (workspaceId) {
        const workspace = await prisma.workspace.findFirst({
          where: {
            id: workspaceId,
            members: {
              some: {
                userId: userId
              }
            }
          }
        });

        if (!workspace) {
          return res.status(404).json({ message: 'Sala de trabajo no encontrada o sin acceso' });
        }
      }

      const task = await prisma.task.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          priority: priority || 'medium',
          status: status || 'pending',
          dueDate: dueDate ? new Date(dueDate) : null,
          creatorId: userId,
          assigneeId: assigneeId || userId,
          workspaceId: workspaceId || null
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true
            }
          },
          workspace: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.status(201).json(task);

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error in tasks API:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

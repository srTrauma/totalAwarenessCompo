import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const taskId = parseInt(id as string);

  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'ID de tarea inválido' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method === 'PUT') {
      // Actualizar tarea completa
      const { title, description, priority, status, dueDate, workspaceId, assigneeId } = req.body;

      // Verificar permisos
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          OR: [
            { creatorId: userId },
            { assigneeId: userId },
            {
              workspace: {
                members: {
                  some: {
                    userId: userId,
                    role: { in: ['owner', 'admin'] }
                  }
                }
              }
            }
          ]
        }
      });

      if (!existingTask) {
        return res.status(404).json({ message: 'Tarea no encontrada o sin permisos' });
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

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          priority: priority || 'medium',
          status: status || 'pending',
          dueDate: dueDate ? new Date(dueDate) : null,
          assigneeId: assigneeId || null,
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

      res.status(200).json(updatedTask);

    } else if (req.method === 'PATCH') {
      // Actualización parcial (principalmente para cambio de estado)
      const updateData: any = {};
      
      // Verificar permisos
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          OR: [
            { creatorId: userId },
            { assigneeId: userId },
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
        }
      });

      if (!existingTask) {
        return res.status(404).json({ message: 'Tarea no encontrada o sin permisos' });
      }

      // Construir objeto de actualización dinámicamente
      const { title, description, priority, status, dueDate, assigneeId } = req.body;

      if (title !== undefined) {
        if (!title || title.trim().length === 0) {
          return res.status(400).json({ message: 'El título no puede estar vacío' });
        }
        updateData.title = title.trim();
      }

      if (description !== undefined) {
        updateData.description = description?.trim() || null;
      }

      if (priority !== undefined) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
          return res.status(400).json({ message: 'Prioridad inválida' });
        }
        updateData.priority = priority;
      }

      if (status !== undefined) {
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: 'Estado inválido' });
        }
        updateData.status = status;
      }

      if (dueDate !== undefined) {
        updateData.dueDate = dueDate ? new Date(dueDate) : null;
      }

      if (assigneeId !== undefined) {
        updateData.assigneeId = assigneeId;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Se debe proporcionar al menos un campo para actualizar' });
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
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

      res.status(200).json(updatedTask);

    } else if (req.method === 'DELETE') {
      // Eliminar tarea
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          OR: [
            { creatorId: userId },
            {
              workspace: {
                members: {
                  some: {
                    userId: userId,
                    role: { in: ['owner', 'admin'] }
                  }
                }
              }
            }
          ]
        }
      });

      if (!existingTask) {
        return res.status(404).json({ message: 'Tarea no encontrada o sin permisos' });
      }

      await prisma.task.delete({
        where: { id: taskId }
      });

      res.status(200).json({ message: 'Tarea eliminada correctamente' });

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error in task API:', error);
    
    if (error instanceof Error && error.message.includes('Record to')) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { taskId } = req.query;
  const taskIdNum = parseInt(taskId as string);

  if (isNaN(taskIdNum)) {
    return res.status(400).json({ message: 'ID de tarea inválido' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method === 'PUT') {
      // Actualizar tarea completa
      const { title, description, priority, status, dueDate, groupId, assigneeId } = req.body;

      // Verificar permisos - el usuario debe ser el creador, asignado, o miembro del grupo
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskIdNum,
          OR: [
            { creatorId: userId },
            { assigneeId: userId },
            {
              group: {
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

      // Verificar que el grupo existe si se cambia
      if (groupId && groupId !== existingTask.groupId) {
        const groupMember = await prisma.groupMember.findFirst({
          where: {
            groupId: groupId,
            userId: userId
          }
        });

        if (!groupMember) {
          return res.status(403).json({ message: 'Sin acceso al nuevo grupo' });
        }
      }

      // Verificar que el assignee tiene acceso al grupo si se cambia
      if (assigneeId && assigneeId !== existingTask.assigneeId) {
        const targetGroupId = groupId || existingTask.groupId;
        if (targetGroupId) {
          const assigneeAccess = await prisma.groupMember.findFirst({
            where: {
              groupId: targetGroupId,
              userId: assigneeId
            }
          });

          if (!assigneeAccess) {
            return res.status(400).json({ message: 'El asignado no tiene acceso al grupo' });
          }
        }
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskIdNum },
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          priority: priority || 'medium',
          status: status || 'pending',
          dueDate: dueDate ? new Date(dueDate) : null,
          assigneeId: assigneeId || null,
          groupId: groupId || existingTask.groupId
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
          }
        }
      });

      // Agregar información del grupo
      const group = await prisma.workspaceGroup.findUnique({
        where: { id: updatedTask.groupId || 0 },
        include: {
          workspace: {
            select: { id: true, name: true }
          }
        }
      });

      const taskWithGroup = {
        ...updatedTask,
        group: group ? {
          id: group.id,
          name: group.name,
          workspace: group.workspace
        } : null
      };

      res.status(200).json(taskWithGroup);

    } else if (req.method === 'PATCH') {
      // Actualización parcial (principalmente para cambio de estado)
      const updateData: any = {};

      // Verificar permisos
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskIdNum,
          OR: [
            { creatorId: userId },
            { assigneeId: userId },
            {
              group: {
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
        where: { id: taskIdNum },
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
          }
        }
      });

      // Agregar información del grupo
      const group = updatedTask.groupId ? await prisma.workspaceGroup.findUnique({
        where: { id: updatedTask.groupId },
        include: {
          workspace: {
            select: { id: true, name: true }
          }
        }
      }) : null;

      const taskWithGroup = {
        ...updatedTask,
        group: group ? {
          id: group.id,
          name: group.name,
          workspace: group.workspace
        } : null
      };

      res.status(200).json(taskWithGroup);

    } else if (req.method === 'DELETE') {
      // Eliminar tarea
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskIdNum,
          OR: [
            { creatorId: userId },
            {
              group: {
                members: {
                  some: {
                    userId: userId,
                    role: 'leader'
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
        where: { id: taskIdNum }
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

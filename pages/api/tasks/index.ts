import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Obtener todas las tareas del usuario (basadas en grupos)
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      // Construir condiciones de búsqueda
      let whereCondition: any = {
        OR: [
          { assigneeId: userId },
          { creatorId: userId }
        ]
      };

      // Filtrar por grupo específico si se proporciona
      if (groupId) {
        whereCondition.groupId = groupId;
        // También verificar que el usuario sea miembro del grupo
        const groupMember = await prisma.groupMember.findFirst({
          where: {
            groupId: groupId,
            userId: userId
          }
        });
        
        if (!groupMember) {
          return res.status(403).json({ message: 'Sin acceso a este grupo' });
        }
      } else {
        // Si no se especifica grupo, buscar tareas donde el usuario es miembro del grupo
        const userGroups = await prisma.groupMember.findMany({
          where: { userId: userId },
          select: { groupId: true }
        });
        
        if (userGroups.length > 0) {
          whereCondition.OR.push({
            groupId: {
              in: userGroups.map(gm => gm.groupId)
            }
          });
        }
      }

      const tasks = await prisma.task.findMany({
        where: whereCondition,
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
        },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      });      // Agregar información del grupo manualmente por ahora
      const tasksWithGroupInfo = await Promise.all(
        tasks.map(async (task) => {
          if (task.groupId) {
            const group = await prisma.group.findUnique({
              where: { id: task.groupId },
              include: {
                project: {
                  select: { id: true, name: true }
                }
              }
            });            return {
              ...task,
              group: group ? {
                id: group.id,
                name: group.name,
                project: group.project
              } : null
            };
          }
          return { ...task, group: null };
        })
      );

      res.status(200).json(tasksWithGroupInfo);

    } else if (req.method === 'POST') {
      // Crear nueva tarea
      const { title, description, priority, status, dueDate, groupId, assigneeId } = req.body;
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: 'El título es requerido' });
      }

      if (!groupId) {
        return res.status(400).json({ message: 'El grupo es requerido' });
      }

      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({ message: 'Prioridad inválida' });
      }

      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Estado inválido' });
      }

      // Verificar que el usuario tiene acceso al grupo
      const groupMember = await prisma.groupMember.findFirst({
        where: {
          groupId: groupId,
          userId: userId
        }
      });

      if (!groupMember) {
        return res.status(403).json({ message: 'Sin acceso a este grupo' });
      }

      // Verificar que el assignee (si se especifica) también tenga acceso al grupo
      if (assigneeId && assigneeId !== userId) {
        const assigneeAccess = await prisma.groupMember.findFirst({
          where: {
            groupId: groupId,
            userId: assigneeId
          }
        });

        if (!assigneeAccess) {
          return res.status(400).json({ message: 'El asignado no tiene acceso a este grupo' });
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
          groupId: groupId
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
      });      // Agregar información del grupo
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          project: {
            select: { id: true, name: true }
          }
        }
      });

      const taskWithGroup = {
        ...task,
        group: group ? {
          id: group.id,
          name: group.name,
          project: group.project
        } : null
      };

      res.status(201).json(taskWithGroup);

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

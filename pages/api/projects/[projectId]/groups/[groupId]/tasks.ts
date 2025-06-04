import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, groupId } = req.query;
  const projectIdNum = parseInt(projectId as string);
  const groupIdNum = parseInt(groupId as string);

  if (isNaN(projectIdNum) || isNaN(groupIdNum)) {
    return res.status(400).json({ message: 'IDs inválidos' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method === 'GET') {
      // Verificar que el usuario tiene acceso al grupo
      const groupMember = await prisma.groupMember.findFirst({
        where: {
          groupId: groupIdNum,
          userId: userId
        }
      });
      if (!groupMember) {
        return res.status(403).json({ message: 'Sin acceso a este grupo' });
      }
      // Obtener tareas del grupo
      const tasks = await prisma.task.findMany({
        where: { groupId: groupIdNum },
        include: {
          assignee: { select: { id: true, name: true, profileImage: true } },
          creator: { select: { id: true, name: true } }
        },
        orderBy: [ { dueDate: 'asc' }, { createdAt: 'desc' } ]
      });
      // Agregar información del grupo y proyecto
      const group = await prisma.group.findUnique({
        where: { id: groupIdNum },
        include: {
          project: { select: { id: true, name: true } }
        }
      });
      const tasksWithGroupInfo = tasks.map(task => ({
        ...task,
        group: group ? {
          id: group.id,
          name: group.name,
          project: group.project
        } : null
      }));
      res.status(200).json(tasksWithGroupInfo);
    } else if (req.method === 'POST') {
      // Crear nueva tarea en el grupo
      const { title, description, priority, status, dueDate, assigneeId } = req.body;
      // Verificar que el usuario tiene acceso al grupo
      const groupMember = await prisma.groupMember.findFirst({
        where: { groupId: groupIdNum, userId: userId }
      });
      if (!groupMember) {
        return res.status(403).json({ message: 'Sin acceso a este grupo' });
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
      // Verificar que el assignee (si se especifica) también tenga acceso al grupo
      if (assigneeId && assigneeId !== userId) {
        const assigneeAccess = await prisma.groupMember.findFirst({
          where: { groupId: groupIdNum, userId: assigneeId }
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
          groupId: groupIdNum
        },
        include: {
          assignee: { select: { id: true, name: true, profileImage: true } },
          creator: { select: { id: true, name: true } }
        }
      });
      // Agregar información del grupo
      const group = await prisma.group.findUnique({
        where: { id: groupIdNum },
        include: {
          project: { select: { id: true, name: true } }
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
    console.error('Error in group tasks API:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

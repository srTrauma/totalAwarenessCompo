import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, groupId } = req.query;
  const projectIdNum = parseInt(projectId as string);
  const groupIdNum = parseInt(groupId as string);

  if (isNaN(projectIdNum) || isNaN(groupIdNum)) {
    return res.status(400).json({ message: 'IDs de proyecto y grupo inválidos' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method === 'GET') {
      // Verificar que el usuario tiene acceso al grupo
      const groupAccess = await prisma.groupMember.findFirst({
        where: {
          groupId: groupIdNum,
          userId: userId
        }
      });

      if (!groupAccess) {
        return res.status(403).json({ message: 'Sin acceso a este grupo' });
      }

      // Contar las tareas del grupo
      const taskCount = await prisma.task.count({
        where: {
          groupId: groupIdNum
        }
      });

      res.status(200).json({ taskCount });

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error in task-count API:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

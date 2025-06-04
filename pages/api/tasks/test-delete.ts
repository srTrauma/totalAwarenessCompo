import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

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

    // Buscar la tarea para verificar su existencia y permisos
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskIdNum,
        OR: [
          { creatorId: userId }, // Creador de la tarea
          { assigneeId: userId }, // Asignado a la tarea
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
      },
      include: {
        group: {
          include: {
            members: {
              where: { userId }
            }
          }
        },
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      }
    });

  
    
   

    if (!existingTask) {
      return res.status(404).json({ 
        message: 'Tarea no encontrada o sin permisos para eliminar',
        debug: {
          taskId: taskIdNum,
          userId: userId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Simulación de eliminación - NO eliminar realmente para pruebas
    res.status(200).json({ 
      message: 'Eliminación simulada exitosa',
      debug: {
        taskFound: true,
        taskId: existingTask.id,
        taskTitle: existingTask.title,
        userCanDelete: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('TEST DELETE: Error:', error);
    
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno',
      debug: {
        taskId: taskIdNum,
        userId: req.headers.userid,
        timestamp: new Date().toISOString()
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

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

    if (req.method === 'GET') {
      // Obtener archivos adjuntos de la tarea
      const task = await prisma.task.findFirst({
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

      if (!task) {
        return res.status(404).json({ message: 'Tarea no encontrada o sin acceso' });
      }

      const attachments = await prisma.taskAttachment.findMany({
        where: { taskId: taskIdNum },
        orderBy: { uploadedAt: 'desc' }
      });

      res.status(200).json(attachments);

    } else if (req.method === 'POST') {
      // Crear registro de archivo adjunto (por ahora sin subida física)
      const { fileName, filePath, fileSize, mimeType, type } = req.body;
      
      // Verificar acceso a la tarea
      const task = await prisma.task.findFirst({
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

      if (!task) {
        return res.status(404).json({ message: 'Tarea no encontrada o sin acceso' });
      }

      if (!fileName || !filePath) {
        return res.status(400).json({ message: 'Nombre y ruta del archivo son requeridos' });
      }

      // Crear registro en base de datos
      const attachment = await prisma.taskAttachment.create({
        data: {
          taskId: taskIdNum,
          fileName: fileName,
          filePath: filePath,
          fileSize: fileSize || 0,
          mimeType: mimeType || 'application/octet-stream',
          uploadedBy: userId,
          type: type || 'general'
        }
      });

      res.status(201).json(attachment);

    } else if (req.method === 'DELETE') {
      // Eliminar archivo adjunto específico
      const { attachmentId } = req.query;
      const attachmentIdNum = parseInt(attachmentId as string);

      if (isNaN(attachmentIdNum)) {
        return res.status(400).json({ message: 'ID de archivo adjunto inválido' });
      }      // Verificar que el archivo existe y el usuario tiene permisos
      const attachment = await prisma.taskAttachment.findFirst({
        where: {
          id: attachmentIdNum,
          OR: [
            { uploadedBy: userId },
            {
              task: {
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
            }
          ]
        }
      });

      if (!attachment) {
        return res.status(404).json({ message: 'Archivo adjunto no encontrado o sin permisos' });
      }

      // Eliminar registro de base de datos
      await prisma.taskAttachment.delete({
        where: { id: attachmentIdNum }
      });

      res.status(200).json({ message: 'Archivo adjunto eliminado correctamente' });

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error in task attachments API:', error);
    
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

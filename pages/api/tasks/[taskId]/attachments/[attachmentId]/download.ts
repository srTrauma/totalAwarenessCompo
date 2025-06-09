import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { taskId, attachmentId } = req.query;
  const taskIdNum = parseInt(taskId as string);
  const attachmentIdNum = parseInt(attachmentId as string);

  if (isNaN(taskIdNum) || isNaN(attachmentIdNum)) {
    return res.status(400).json({ message: 'IDs inválidos' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method === 'GET') {
      // Verificar que el archivo existe y el usuario tiene permisos
      const attachment = await prisma.taskAttachment.findFirst({
        where: {
          id: attachmentIdNum,
          taskId: taskIdNum,
          task: {
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
        }
      });

      if (!attachment) {
        return res.status(404).json({ message: 'Archivo no encontrado o sin permisos' });
      }

      // Construir la ruta del archivo
      const filePath = path.join(process.cwd(), 'public', attachment.filePath);
      
      // Verificar que el archivo existe físicamente
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
      }

      // Leer el archivo
      const fileBuffer = fs.readFileSync(filePath);
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.fileName)}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      
      // Enviar el archivo
      res.send(fileBuffer);

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error en descarga de archivo:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

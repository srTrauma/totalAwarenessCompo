import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

export const config = {
  api: {
    bodyParser: false, // Necesario para formidable
  },
};

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

      let attachments = await prisma.taskAttachment.findMany({
        where: { taskId: taskIdNum },
        orderBy: { uploadedAt: 'desc' }
      });

      // Filtrar archivos de tipo 'completion_proof' solo para el creador
      if (task.creatorId !== userId) {
        attachments = attachments.filter(att => att.type !== 'completion_proof');
      }

      res.status(200).json(attachments);    } else if (req.method === 'POST') {
      // Permitir subida física de archivo adjunto (multipart/form-data)
      let files: Array<{
        fileName: string;
        filePath: string;
        fileSize: number;
        mimeType: string;
      }> = [];
      let type = 'general';
      
      if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        // Asegurar carpeta
        const fs = await import('fs');
        const uploadDir = './public/uploads/tasks';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Importar formidable
        const imported = await import('formidable');
        const formidable = imported.default || imported;
        const form = formidable({ multiples: true, keepExtensions: true, uploadDir });
        
        await new Promise((resolve, reject) => {
          form.parse(req, (err, fields, filesObj) => {
            if (err) return reject(err);
            
            // Buscar archivos en diferentes campos posibles
            let fileList = filesObj.attachments || filesObj.attachment || filesObj.file || [];
            if (!Array.isArray(fileList)) fileList = [fileList];
            
            // Procesar cada archivo
            for (const file of fileList) {
              if (file) {
                let originalName = file.originalFilename || file.newFilename;
                originalName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
                
                let finalName = originalName;
                let filePath = `${uploadDir}/${finalName}`;
                let publicPath = `/uploads/tasks/${finalName}`;
                
                let i = 1;
                while (fs.existsSync(filePath)) {
                  const parts = originalName.split('.');
                  if (parts.length > 1) {
                    const ext = parts.pop();
                    finalName = `${parts.join('.')}(${i}).${ext}`;
                  } else {
                    finalName = `${originalName}(${i})`;
                  }
                  filePath = `${uploadDir}/${finalName}`;
                  publicPath = `/uploads/tasks/${finalName}`;
                  i++;
                }
                
                if (file.filepath && file.filepath !== filePath) {
                  fs.renameSync(file.filepath, filePath);
                }
                
                files.push({
                  fileName: originalName,
                  filePath: publicPath,
                  fileSize: file.size,
                  mimeType: file.mimetype || 'application/octet-stream'
                });
              }
            }
            
            // type puede venir como array si es enviado por form-data
            if (fields.type) {
              type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
            } else {
              type = 'completion';
            }
            
            resolve(undefined);
          });
        });
      } else {
        // JSON plano (registro manual) - un solo archivo
        files = [{
          fileName: req.body.fileName,
          filePath: req.body.filePath,
          fileSize: req.body.fileSize || 0,
          mimeType: req.body.mimeType || 'application/octet-stream'
        }];
        type = req.body.type || 'general';
      }
      
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
      
      if (files.length === 0) {
        return res.status(400).json({ message: 'No se encontraron archivos para subir' });
      }
      
      // Crear registros en base de datos para todos los archivos
      const attachments = [];
      for (const file of files) {
        if (file.fileName && file.filePath) {
          const attachment = await prisma.taskAttachment.create({
            data: {
              taskId: taskIdNum,
              fileName: file.fileName,
              filePath: file.filePath,
              fileSize: file.fileSize,
              mimeType: file.mimeType,
              uploadedBy: userId,
              type: type
            }
          });
          attachments.push(attachment);
        }
      }
      
      res.status(201).json({ 
        message: `${attachments.length} archivo(s) subido(s) correctamente`,
        attachments: attachments 
      });

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

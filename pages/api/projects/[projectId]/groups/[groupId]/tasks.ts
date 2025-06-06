import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Necesario para formidable
  },
};

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
          creator: { select: { id: true, name: true } },
          attachments: true // <-- incluir adjuntos
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
        attachments: Array.isArray(task.attachments) ? task.attachments : [],
        group: group ? {
          id: group.id,
          name: group.name,
          project: group.project
        } : null
      }));
      res.status(200).json(tasksWithGroupInfo);
    } else if (req.method === 'POST') {
      // Soportar multipart/form-data para adjuntos
      let title = '', description = '', priority = '', status = '', dueDate = '', assigneeId = null;
      let files: any[] = [];
      if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        // Asegurar que la carpeta de uploads existe antes de usar formidable
        const fs = await import('fs');
        const uploadDir = './public/uploads/tasks';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        // Importar formidable dinámicamente y soportar ambas formas (default y named)
        const imported = await import('formidable');
        const formidable = imported.default || imported;
        // Usar formidable() directamente (no new ...)
        const form = formidable({ multiples: true, keepExtensions: true, uploadDir });
        await new Promise((resolve, reject) => {
          form.parse(req, (err, fields, filesObj) => {
            if (err) return reject(err);
            title = Array.isArray(fields.title) ? fields.title[0] : fields.title || '';
            description = Array.isArray(fields.description) ? fields.description[0] : fields.description || '';
            priority = Array.isArray(fields.priority) ? fields.priority[0] : fields.priority || 'medium';
            status = Array.isArray(fields.status) ? fields.status[0] : fields.status || 'pending';
            dueDate = Array.isArray(fields.dueDate) ? fields.dueDate[0] : fields.dueDate || '';
            assigneeId = Array.isArray(fields.assigneeId) ? fields.assigneeId[0] : fields.assigneeId || null;
            // Archivos
            if (filesObj.attachments) {
              files = Array.isArray(filesObj.attachments) ? filesObj.attachments : [filesObj.attachments];
            }
            resolve(undefined);
          });
        });      } else {
        // JSON plano - parsear manualmente ya que bodyParser está deshabilitado
        let body = '';
        req.setEncoding('utf8');
        
        await new Promise((resolve, reject) => {
          req.on('data', (chunk) => {
            body += chunk;
          });
          
          req.on('end', () => {
            try {
              const parsedBody = JSON.parse(body || '{}');
              console.log('Request body:', parsedBody);
              console.log('Content-Type:', req.headers['content-type']);
              
              title = parsedBody.title;
              description = parsedBody.description;
              priority = parsedBody.priority;
              status = parsedBody.status;
              dueDate = parsedBody.dueDate;
              assigneeId = parsedBody.assigneeId;
              
              resolve(undefined);
            } catch (error) {
              reject(new Error('Invalid JSON'));
            }
          });
          
          req.on('error', reject);
        });
      }
      
      // Log de debug para ver qué valores tenemos
      console.log('Parsed values:', { title, description, priority, status, dueDate, assigneeId });
      // Verificar que el usuario tiene acceso al grupo
      const groupMember = await prisma.groupMember.findFirst({
        where: { groupId: groupIdNum, userId: userId }
      });
      if (!groupMember) {
        return res.status(403).json({ message: 'Sin acceso a este grupo' });
      }      // Validar y limpiar los datos
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
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
      
      // No permitir crear tareas con estado 'cancelled'
      if (status === 'cancelled') {
        status = 'pending';
      }
      
      if (assigneeId && assigneeId != userId) {
        const assigneeAccess = await prisma.groupMember.findFirst({
          where: { groupId: groupIdNum, userId: Number(assigneeId) }
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
          assigneeId: assigneeId ? Number(assigneeId) : userId,
          groupId: groupIdNum
        },
        include: {
          assignee: { select: { id: true, name: true, profileImage: true } },
          creator: { select: { id: true, name: true } }
        }
      });
      // Guardar archivos adjuntos si hay
      let attachments = [];
      if (files && files.length > 0) {
        for (const file of files) {
          let originalName = file.originalFilename || file.name || file.newFilename;
          // Sanitizar el nombre (quitar caracteres peligrosos)
          originalName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
          const uploadDir = './public/uploads/tasks';
          let finalName = originalName;
          let filePath = `${uploadDir}/${finalName}`;
          let publicPath = `/uploads/tasks/${finalName}`;
          const fs = await import('fs');
          let i = 1;
          // Si ya existe, añade sufijo
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
          // Mover el archivo al nombre final si es necesario
          if (file.filepath && file.filepath !== filePath) {
            fs.renameSync(file.filepath, filePath);
          }
          const fileSize = file.size;
          const mimeType = file.mimetype || file.type;
          const attachment = await prisma.taskAttachment.create({
            data: {
              taskId: task.id,
              fileName: originalName, // nombre original visible
              filePath: publicPath,   // ruta pública
              fileSize,
              mimeType,
              uploadedBy: userId,
              type: 'general'
            }
          });
          attachments.push(attachment);
        }
      }
      // Si se está usando multipart/form-data, los adjuntos ya se procesan arriba
      // Si es JSON plano, attachments no se procesan aquí (solo en uploads separados)
      // ---
      // Si no hay archivos subidos, attachmentsArr debe ser array vacío
      // Si el método es JSON plano, files será [] y attachmentsArr también
      // ---
      // Si por alguna razón task no se creó, devolver error explícito
      if (!task || !task.id) {
        return res.status(500).json({ message: 'No se pudo crear la tarea' });
      }
      // Siempre devolver attachments como array
      let attachmentsArr: any[] = [];
      attachmentsArr = await prisma.taskAttachment.findMany({
        where: { taskId: task.id },
        orderBy: { uploadedAt: 'desc' }
      });
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
        } : null,
        attachments: attachmentsArr
      };
      // --- DEPURACIÓN ---
      // (Eliminados todos los logs de depuración para producción)
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

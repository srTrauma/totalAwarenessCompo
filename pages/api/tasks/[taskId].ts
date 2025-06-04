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
      // Definir variables fuera del callback para que estén accesibles
      const currentUserId = userId;
      const currentTaskIdNum = taskIdNum;
      const currentPrisma = prisma;
      if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        const fs = await import('fs');
        const uploadDir = './public/uploads/tasks';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const imported = await import('formidable');
        const formidable = imported.default || imported;
        const form = formidable({ multiples: true, keepExtensions: true, uploadDir });
        form.parse(req, async (err, fields, filesObj) => {
          let responded = false;
          try {
            if (err) {
              res.status(400).json({ message: 'Error procesando archivos', error: err.message });
              responded = true;
              return;
            }
            // Parseo y validación de campos
            let title = Array.isArray(fields.title) ? fields.title[0] : fields.title || '';
            let description = Array.isArray(fields.description) ? fields.description[0] : fields.description || '';
            let priority = Array.isArray(fields.priority) ? fields.priority[0] : fields.priority || 'medium';
            let status = Array.isArray(fields.status) ? fields.status[0] : fields.status || 'pending';
            let dueDate = Array.isArray(fields.dueDate) ? fields.dueDate[0] : fields.dueDate || '';
            let groupId = Array.isArray(fields.groupId) ? fields.groupId[0] : fields.groupId || null;
            let assigneeId = Array.isArray(fields.assigneeId) ? fields.assigneeId[0] : fields.assigneeId || null;
            const groupIdNum = groupId ? parseInt(groupId) : null;
            const assigneeIdNum = assigneeId ? parseInt(assigneeId) : null;
            let files: any[] = [];
            if (filesObj.attachments) {
              files = Array.isArray(filesObj.attachments) ? filesObj.attachments : [filesObj.attachments];
            }
            // Permisos y validaciones
            const existingTask = await currentPrisma.task.findFirst({
              where: {
                id: currentTaskIdNum,
                OR: [
                  { creatorId: currentUserId },
                  { assigneeId: currentUserId },
                  {
                    group: {
                      members: {
                        some: { userId: currentUserId }
                      }
                    }
                  }
                ]
              }
            });
            if (!existingTask) {
              res.status(404).json({ message: 'Tarea no encontrada o sin permisos' });
              return;
            }
            if (!title || title.trim().length === 0) {
              res.status(400).json({ message: 'El título es requerido' });
              return;
            }
            const validPriorities = ['low', 'medium', 'high', 'urgent'];
            const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
            if (priority && !validPriorities.includes(priority)) {
              res.status(400).json({ message: 'Prioridad inválida' });
              return;
            }
            if (status && !validStatuses.includes(status)) {
              res.status(400).json({ message: 'Estado inválido' });
              return;
            }
            if (status === 'cancelled') {
              res.status(400).json({ message: "No se puede actualizar la tarea a 'cancelled' desde aquí" });
              return;
            }
            if (groupIdNum && groupIdNum !== existingTask.groupId) {
              const groupMember = await currentPrisma.groupMember.findFirst({
                where: { groupId: groupIdNum, userId: currentUserId }
              });
              if (!groupMember) {
                res.status(403).json({ message: 'Sin acceso al nuevo grupo' });
                return;
              }
            }
            if (assigneeIdNum && assigneeIdNum !== existingTask.assigneeId) {
              const targetGroupId = groupIdNum || existingTask.groupId;
              if (targetGroupId) {
                const assigneeAccess = await currentPrisma.groupMember.findFirst({
                  where: { groupId: targetGroupId, userId: assigneeIdNum }
                });
                if (!assigneeAccess) {
                  res.status(400).json({ message: 'El asignado no tiene acceso al grupo' });
                  return;
                }
              }
            }
            const updatedTask = await currentPrisma.task.update({
              where: { id: currentTaskIdNum },
              data: {
                title: title.trim(),
                description: description?.trim() || null,
                priority: priority || 'medium',
                status: status || 'pending',
                dueDate: dueDate ? new Date(dueDate) : null,
                assigneeId: assigneeIdNum || null,
                groupId: groupIdNum || existingTask.groupId
              },
              include: {
                assignee: { select: { id: true, name: true, profileImage: true } },
                creator: { select: { id: true, name: true } }
              }
            });
            // --- NUEVO: Eliminar adjunto anterior si existe y hay archivos nuevos ---
            if (files && files.length > 0) {
              const prevAttachments = await currentPrisma.taskAttachment.findMany({
                where: { taskId: updatedTask.id }
              });
              for (const prev of prevAttachments) {
                // Eliminar archivo físico si existe
                if (prev.filePath) {
                  const prevPath = `./public${prev.filePath}`;
                  try {
                    if (fs.existsSync(prevPath)) {
                      fs.unlinkSync(prevPath);
                    }
                  } catch (e) {
                    console.error('Error eliminando archivo anterior:', prevPath, e);
                  }
                }
                try {
                  await currentPrisma.taskAttachment.delete({ where: { id: prev.id } });
                } catch (e) {
                  console.error('Error eliminando adjunto de BD:', prev.id, e);
                }
              }
            }
            // Guardar archivos adjuntos si hay
            let attachments = [];
            if (typeof files !== 'undefined' && files && files.length > 0) {
              for (const file of files) {
                let originalName = file.originalFilename || file.name || file.newFilename;
                originalName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
                const uploadDir = './public/uploads/tasks';
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
                const fileSize = file.size;
                const mimeType = file.mimetype || file.type;
                const attachment = await currentPrisma.taskAttachment.create({
                  data: {
                    taskId: updatedTask.id,
                    fileName: originalName,
                    filePath: publicPath,
                    fileSize,
                    mimeType,
                    uploadedBy: currentUserId,
                    type: 'general'
                  }
                });
                attachments.push(attachment);
              }
            }
            // Incluir adjuntos en la respuesta (siempre como array)
            const attachmentsArr = await currentPrisma.taskAttachment.findMany({
              where: { taskId: updatedTask.id },
              orderBy: { uploadedAt: 'desc' }
            });
            // Agregar información del grupo
            const group = await currentPrisma.group.findUnique({
              where: { id: updatedTask.groupId || 0 },
              include: { project: { select: { id: true, name: true } } }
            });
            const taskWithGroup = {
              ...updatedTask,
              group: group ? {
                id: group.id,
                name: group.name,
                project: group.project
              } : null,
              attachments: Array.isArray(attachmentsArr) ? attachmentsArr : []
            };
            res.status(200).json(taskWithGroup);
            responded = true;
            return;
          } catch (e: any) {
            if (!responded) {
              res.status(500).json({ message: 'Error interno al actualizar la tarea', error: e?.message || e });
              responded = true;
              return;
            }
          } finally {
            // Si por alguna razón no se respondió, responder con error genérico
            if (!responded) {
              res.status(500).json({ message: 'Error desconocido: la API no envió respuesta.' });
            }
          }
        });
        return; // IMPORTANTE: no continuar el handler, la respuesta ya se envió en el callback
      }
      // --- JSON PLANO (sin archivos) ---
      // Si el body contiene cualquier campo relacionado con archivos, rechazar
      if (
        req.body.attachments !== undefined ||
        req.body.files !== undefined ||
        (Array.isArray(req.body) && req.body.some(f => f && (f.attachments || f.files)))
      ) {
        console.error('Intento de adjuntar archivos en JSON');
        return res.status(400).json({ message: 'No se permite adjuntar archivos en este tipo de petición. Usa multipart/form-data.' });
      }
      let title = '', description = '', priority = '', status = '', dueDate = '', groupId = null, assigneeId = null;
      title = req.body.title;
      description = req.body.description;
      priority = req.body.priority;
      status = req.body.status;
      dueDate = req.body.dueDate;
      groupId = req.body.groupId;
      assigneeId = req.body.assigneeId;
      if (groupId) groupId = parseInt(groupId);
      if (assigneeId) assigneeId = parseInt(assigneeId);
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
      // No permitir actualizar a 'cancelled' desde el PUT (solo desde acción específica de cancelación)
      if (status === 'cancelled') {
        return res.status(400).json({ message: "No se puede actualizar la tarea a 'cancelled' desde aquí" });
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
      // Incluir adjuntos en la respuesta (siempre como array)
      const attachmentsArr = await prisma.taskAttachment.findMany({
        where: { taskId: updatedTask.id },
        orderBy: { uploadedAt: 'desc' }
      });
      // Agregar información del grupo
      const group = await prisma.group.findUnique({
        where: { id: updatedTask.groupId || 0 },
        include: {
          project: {
            select: { id: true, name: true }
          }
        }
      });
      const taskWithGroup = {
        ...updatedTask,
        group: group ? {
          id: group.id,
          name: group.name,
          project: group.project
        } : null,
        attachments: Array.isArray(attachmentsArr) ? attachmentsArr : []
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
      const group = updatedTask.groupId ? await prisma.group.findUnique({
        where: { id: updatedTask.groupId },
        include: {
          project: {
            select: { id: true, name: true }
          }
        }
      }) : null;

      // Incluir adjuntos en la respuesta (siempre como array)
      const attachments = await prisma.taskAttachment.findMany({
        where: { taskId: updatedTask.id },
        orderBy: { uploadedAt: 'desc' }
      });

      const taskWithGroup = {
        ...updatedTask,
        group: group ? {
          id: group.id,
          name: group.name,
          project: group.project
        } : null,
        attachments: Array.isArray(attachments) ? attachments : []
      };

      res.status(200).json(taskWithGroup);    } else if (req.method === 'DELETE') {
      
      // Eliminar tarea - Verificar permisos más amplios
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
                    // Eliminar restricción de role: 'leader' para permitir más flexibilidad
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
        
        return res.status(404).json({ message: 'Tarea no encontrada o sin permisos para eliminar' });
      }

      
      // Eliminar archivos adjuntos primero
      const attachments = await prisma.taskAttachment.findMany({
        where: { taskId: taskIdNum }
      });

      

      // Eliminar archivos físicos
      const fs = await import('fs');
      for (const attachment of attachments) {
        if (attachment.filePath) {
          const fullPath = `./public${attachment.filePath}`;
          try {
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
             
            }
          } catch (e) {
            console.error('DELETE: Error eliminando archivo físico:', fullPath, e);
          }
        }
      }

      // Eliminar registros de adjuntos de la base de datos
    
      await prisma.taskAttachment.deleteMany({
        where: { taskId: taskIdNum }
      });

      // Eliminar la tarea
     
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

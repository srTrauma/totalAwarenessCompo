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

      
      // Manejo de JSON plano (sin archivos)
      if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
      
        // Validación de datos básicos
        const title = req.body.title;
        if (!title || title.trim().length === 0) {
          return res.status(400).json({ message: 'El título es requerido' });
        }
        
        // Verificar permisos sobre la tarea
        const existingTask = await prisma.task.findFirst({
          where: {
            id: taskIdNum,
            OR: [
              { creatorId: userId },
              { assigneeId: userId },
              { group: { members: { some: { userId } } } }
            ]
          }
        });
        
       
        if (!existingTask) {
          return res.status(404).json({ message: 'Tarea no encontrada o sin permisos' });
        }
        
        // Actualizar la tarea
        const updatedTask = await prisma.task.update({
          where: { id: taskIdNum },
          data: {
            title: title.trim(),
            description: req.body.description?.trim() || null,
            priority: req.body.priority || 'medium',
            status: req.body.status || 'pending',
            dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
            assigneeId: req.body.assigneeId ? parseInt(req.body.assigneeId) : null,
            groupId: req.body.groupId ? parseInt(req.body.groupId) : null
          },
          include: {
            creator: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true, profileImage: true } }
          }
        });
        
     
        // Obtener attachments existentes
        const attachments = await prisma.taskAttachment.findMany({
          where: { taskId: updatedTask.id },
          orderBy: { uploadedAt: 'desc' }
        });
        
     
        // Obtener información del grupo si existe
        let group = null;
        if (updatedTask.groupId) {
          group = await prisma.group.findUnique({
            where: { id: updatedTask.groupId },
            include: { project: { select: { id: true, name: true } } }
          });
        }
        
      
        // Preparar respuesta final
        const finalTask = {
          ...updatedTask,
          group: group ? {
            id: group.id,
            name: group.name,
            project: group.project
          } : null,
          attachments: Array.isArray(attachments) ? attachments : []
        };
        
       
        return res.status(200).json(finalTask);
      }
      
      // Si llega aquí es multipart/form-data - por ahora no implementado en el test
      return res.status(400).json({ message: 'Multipart no implementado en endpoint de test' });
    }
    
    return res.status(405).json({ message: 'Método no permitido' });
    
  } catch (error: any) {
    console.error('DEBUG: Error en test-put:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: error?.message || error 
    });
  }
}

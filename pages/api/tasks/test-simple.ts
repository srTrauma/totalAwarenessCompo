import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.status(405).json({ message: 'Método no permitido' });
    return;
  }

  const { taskId } = req.query;
  const taskIdNum = parseInt(taskId as string);
  
  if (isNaN(taskIdNum)) {
    res.status(400).json({ message: 'ID de tarea inválido' });
    return;
  }

  const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
  if (!userId) {
    res.status(401).json({ message: 'No autorizado' });
    return;
  }

  try {
    // Respuesta simulada con estructura completa
    const simulatedTask = {
      id: taskIdNum,
      title: req.body.title || "Tarea simulada",
      description: req.body.description || "Descripción simulada",
      priority: req.body.priority || "medium",
      status: req.body.status || "pending",
      dueDate: req.body.dueDate ? new Date(req.body.dueDate).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creatorId: userId,
      assigneeId: req.body.assigneeId || null,
      groupId: req.body.groupId || null,
      creator: { 
        id: userId, 
        name: "Usuario Test" 
      },
      assignee: req.body.assigneeId ? { 
        id: req.body.assigneeId, 
        name: "Asignado Test",
        profileImage: null
      } : null,
      group: null,
      attachments: [] // Array vacío - esto es lo que estaba causando el problema
    };
    
   
    res.status(200).json({ 
      ...simulatedTask, 
      alert: '¡Tarea actualizada correctamente (simulada)!' 
    });
    
  } catch (error: any) {
    console.error('Error en test-simple:', error);
    const msg = error?.message || String(error);
    res.status(500).json({ message: 'Error interno', error: msg });
  }
}

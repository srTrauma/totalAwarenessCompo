import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers.userid as string;

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  if (req.method === 'GET') {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: Number(userId) },
        orderBy: { createdAt: 'desc' },
        take: 10 // Últimas 10 notificaciones
      });

      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else if (req.method === 'PUT') {
    // Marcar notificación como leída
    try {
      const { notificationId } = req.body;

      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      });

      res.status(200).json({ message: 'Notificación marcada como leída' });
    } catch (error) {
      console.error('Error al marcar notificación:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    // Marcar todas las notificaciones como leídas
    try {
      await prisma.notification.updateMany({
        where: { 
          userId: Number(userId),
          read: false 
        },
        data: { read: true }
      });

      res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      console.error('Error al marcar notificaciones:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
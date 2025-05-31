import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const workspaceId = parseInt(id as string);

  if (isNaN(workspaceId)) {
    return res.status(400).json({ message: 'ID de sala inválido' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Verificar que la sala existe
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    // Verificar que el usuario no sea ya miembro
    const existingMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId
        }
      }
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'Ya eres miembro de esta sala' });
    }

    // Agregar al usuario como miembro
    await prisma.workspaceMember.create({
      data: {
        userId: userId,
        workspaceId: workspaceId,
        role: 'member'
      }
    });

    res.status(200).json({ message: 'Te has unido a la sala correctamente' });

  } catch (error) {
    console.error('Error joining workspace:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

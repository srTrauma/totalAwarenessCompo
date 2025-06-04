import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { projectId } = req.query;
  const userId = req.body.userId || req.headers.userid;

  if (!projectId || !userId) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos' });
  }

  try {
    const projectIdNum = parseInt(projectId as string);
    const userIdNum = parseInt(userId as string);

    // Verifica si ya es miembro
    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: userIdNum, projectId: projectIdNum } }
    });
    if (existing) {
      return res.status(200).json({ message: 'Ya eres miembro de este proyecto' });
    }

    // Añade como miembro normal
    const member = await prisma.projectMember.create({
      data: {
        userId: userIdNum,
        projectId: projectIdNum,
        role: 'member'
      }
    });
    res.status(201).json({ message: 'Unido correctamente', member });
  } catch (error) {
    console.error('Error al unirse al proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}

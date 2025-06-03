import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// Evita múltiples instancias de PrismaClient en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { companyId } = req.query;
  if (!companyId || isNaN(Number(companyId))) {
    return res.status(400).json({ message: 'companyId inválido' });
  }

  try {
    const workspaces = await prisma.workspace.findMany({
      where: { companyId: Number(companyId) },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: {
            groups: true,
            members: true,
          },
        },
      },
    });
    return res.status(200).json(workspaces);
  } catch (error) {
    console.error('Error al obtener workspaces:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    // Cierra la conexión solo en producción
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { companyId } = req.query;
    if (!companyId || isNaN(Number(companyId))) {
      return res.status(400).json({ message: 'companyId inválido' });
    }
    try {
      const projects = await prisma.project.findMany({
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
      return res.status(200).json(projects);
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    // Crear nuevo proyecto
    const { name, description, companyId, userId } = req.body;
    if (!name || !companyId || !userId) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }
    try {
      const project = await prisma.project.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          companyId: Number(companyId),
          isActive: true,
          members: {
            create: {
              userId: Number(userId),
              role: 'owner',
            },
          },
        },
        include: {
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
      return res.status(201).json(project);
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}

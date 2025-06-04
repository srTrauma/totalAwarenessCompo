import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const projectId = parseInt(req.query.projectId as string);
    const userId = parseInt(req.query.userId as string);

    if (isNaN(projectId) || isNaN(userId)) {
      return res.status(400).json({ message: 'ID de proyecto o usuario inválido' });
    }

    // Verificar si el usuario tiene acceso a este proyecto
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
    }

    // Obtener el proyecto con datos relacionados
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'desc',
          },
        },
        groups: {
          select: {
            id: true,
            name: true,
            description: true,
            _count: {
              select: {
                tasks: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Determinar si el usuario puede gestionar el proyecto (si es admin)
    const canManage = membership.role === 'ADMIN';

    // Procesar los datos para el formato esperado en el frontend
    const formattedProject = {
      ...project,
      groups: project.groups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        taskCount: group._count.tasks,
      })),
      canManage,
    };

    return res.status(200).json(formattedProject);
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}

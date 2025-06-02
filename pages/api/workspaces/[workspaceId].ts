import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const workspaceId = parseInt(req.query.workspaceId as string);
    const userId = parseInt(req.query.userId as string);

    if (isNaN(workspaceId) || isNaN(userId)) {
      return res.status(400).json({ message: 'ID de workspace o usuario inválido' });
    }

    // Verificar si el usuario tiene acceso a este workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'No tienes acceso a esta sala de trabajo' });
    }

    // Obtener el workspace con datos relacionados
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
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

    if (!workspace) {
      return res.status(404).json({ message: 'Sala de trabajo no encontrada' });
    }

    // Determinar si el usuario puede gestionar el workspace (si es admin)
    const canManage = membership.role === 'ADMIN';

    // Procesar los datos para el formato esperado en el frontend
    const formattedWorkspace = {
      ...workspace,
      groups: workspace.groups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        taskCount: group._count.tasks,
      })),
      canManage,
    };

    return res.status(200).json(formattedWorkspace);
  } catch (error) {
    console.error('Error al obtener detalles del workspace:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: (error instanceof Error) ? error.message : String(error) 
    });
  }
}

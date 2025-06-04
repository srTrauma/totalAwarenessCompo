import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { workspaceId, membershipId } = req.query;
    const userId = req.headers.userid;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const parsedWorkspaceId = parseInt(workspaceId as string);
    const parsedMembershipId = parseInt(membershipId as string);
    const parsedUserId = parseInt(userId as string);

    if (isNaN(parsedWorkspaceId) || isNaN(parsedMembershipId) || isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    // Verificar que el workspace exista
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: parsedWorkspaceId,
      },
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace no encontrado' });
    }

    // Verificar que el usuario que hace la solicitud es administrador del workspace
    const requesterMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: parsedWorkspaceId,
        userId: parsedUserId,
        role: 'ADMIN',
      },
    });

    if (!requesterMembership) {
      return res.status(403).json({
        message: 'No tienes permisos para eliminar miembros de este workspace'
      });
    }

    // Verificar que la membresía existe
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        id: parsedMembershipId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!membership) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }

    // Verificar que no se está intentando eliminar al propio usuario solicitante
    if (membership.userId === parsedUserId) {
      return res.status(400).json({
        message: 'No puedes eliminarte a ti mismo del workspace. Contacta a otro administrador.'
      });
    }

    // Verificar que no se está intentando eliminar al último administrador
    if (membership.role === 'ADMIN') {
      const adminCount = await prisma.workspaceMember.count({
        where: {
          workspaceId: parsedWorkspaceId,
          role: 'ADMIN',
        },
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'No puedes eliminar al último administrador del workspace.'
        });
      }
    }

    // Eliminar la membresía
    await prisma.workspaceMember.delete({
      where: {
        id: parsedMembershipId,
      },
    });

    // Verificar si el usuario tiene otras membresías en esta compañía
    // Si no tiene, también eliminar la membresía de la compañía
    const otherWorkspaceMemberships = await prisma.workspaceMember.findFirst({
      where: {
        userId: membership.userId,
        workspace: {
          companyId: workspace.companyId,
        },
        NOT: {
          id: parsedMembershipId,
        },
      },
    });

    return res.status(200).json({
      message: `${membership.user.name} ha sido eliminado de la sala de trabajo`
    });
  } catch (error) {
    console.error('Error al eliminar miembro:', error);
    return res.status(500).json({
      message: 'Error al eliminar miembro',
      error: (error instanceof Error) ? error.message : String(error)
    });
  }
}

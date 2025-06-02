import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { workspaceId } = req.query;
  const workspaceIdNum = parseInt(workspaceId as string);

  if (isNaN(workspaceIdNum)) {
    return res.status(400).json({ message: 'ID de sala inválido' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Verificar que la sala existe y está activa
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceIdNum,
        isActive: true
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            public: true
          }
        }
      }
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Sala no encontrada o inactiva' });
    }

    // Verificar que el usuario es miembro de la empresa
    const companyMembership = await prisma.userCompany.findFirst({
      where: {
        userId: userId,
        companyId: workspace.companyId,
        approved: true
      }
    });

    if (!companyMembership) {
      return res.status(403).json({ message: 'Debes ser miembro de la empresa para unirte a esta sala' });
    }

    // Verificar que no sea ya miembro de la sala
    const existingMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
        workspaceId: workspaceIdNum
      }
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'Ya eres miembro de esta sala' });
    }

    // Unirse a la sala
    const newMembership = await prisma.workspaceMember.create({
      data: {
        userId: userId,
        workspaceId: workspaceIdNum,
        role: 'member'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Te has unido a la sala correctamente',
      membership: newMembership
    });

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

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { workspaceId } = req.query;
  const projectIdNum = parseInt(workspaceId as string);

  if (isNaN(projectIdNum)) {
    return res.status(400).json({ message: 'ID de proyecto inválido' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Verificar que el proyecto existe y está activo
    const project = await prisma.project.findFirst({
      where: {
        id: projectIdNum,
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

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado o inactivo' });
    }

    // Verificar que el usuario es miembro de la empresa
    const companyMembership = await prisma.userCompany.findFirst({
      where: {
        userId: userId,
        companyId: project.companyId,
        approved: true
      }
    });

    if (!companyMembership) {
      return res.status(403).json({ message: 'Debes ser miembro de la empresa para unirte a este proyecto' });
    }

    // Verificar que no sea ya miembro del proyecto
    const existingMembership = await prisma.projectMember.findFirst({
      where: {
        userId: userId,
        projectId: projectIdNum
      }
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'Ya eres miembro de este proyecto' });
    }

    // Unirse al proyecto
    const newMembership = await prisma.projectMember.create({
      data: {
        userId: userId,
        projectId: projectIdNum,
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
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Te has unido al proyecto correctamente',
      membership: newMembership
    });

  } catch (error) {
    console.error('Error joining project:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}

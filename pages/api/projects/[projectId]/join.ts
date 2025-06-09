import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }
  const { projectId } = req.query;
  const requestingUserId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
  const targetUserId = req.body.userId || requestingUserId;

  if (!projectId || !targetUserId || !requestingUserId) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos' });
  }

  try {
    const projectIdNum = parseInt(projectId as string);
    const targetUserIdNum = typeof targetUserId === 'string' ? parseInt(targetUserId) : targetUserId;
    const requestingUserIdNum = requestingUserId;

    // Obtener información del proyecto
    const project = await prisma.project.findUnique({
      where: { id: projectIdNum },
      include: { company: true }
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Verificar que el usuario solicitante tiene permisos para agregar miembros
    if (targetUserIdNum !== requestingUserIdNum) {
      // Si está agregando a otra persona, debe ser admin/owner del proyecto o owner de la empresa
      const requestingMembership = await prisma.projectMember.findFirst({
        where: { 
          userId: requestingUserIdNum, 
          projectId: projectIdNum,
          role: { in: ['admin', 'owner'] }
        }
      });

      const isCompanyOwner = project.company.ownerId === requestingUserIdNum;

      if (!requestingMembership && !isCompanyOwner) {
        return res.status(403).json({ message: 'Sin permisos para agregar miembros' });
      }
    }

    // Verificar que el usuario objetivo es miembro de la empresa
    const userCompanyMembership = await prisma.userCompany.findFirst({
      where: { 
        userId: targetUserIdNum, 
        companyId: project.companyId, 
        approved: true 
      }
    });

    if (!userCompanyMembership) {
      return res.status(400).json({ message: 'El usuario debe ser miembro de la empresa' });
    }

    // Verifica si ya es miembro
    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: targetUserIdNum, projectId: projectIdNum } }
    });
    if (existing) {
      return res.status(200).json({ message: 'Ya es miembro de este proyecto' });
    }

    // Añade como miembro normal
    const member = await prisma.projectMember.create({
      data: {
        userId: targetUserIdNum,
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

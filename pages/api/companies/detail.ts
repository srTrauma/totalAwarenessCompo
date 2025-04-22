
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { companyId } = req.query;
    const userId = req.headers.userid as string;

    if (!companyId) {
      return res.status(400).json({ message: 'El ID de la empresa es obligatorio' });
    }

    // Obtener datos de la empresa
    const company = await prisma.company.findUnique({
      where: { id: Number(companyId) },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            members: true,
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    // Si la empresa no es pública, verificar si el usuario tiene acceso
    if (!company.public) {
      const userMembership = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: Number(userId),
            companyId: Number(companyId),
          }
        }
      });

      if (!userMembership) {
        return res.status(403).json({ message: 'No tienes acceso a esta empresa' });
      }
    }

    // Determinar el rol y estado del usuario actual en la empresa
    let userRole = null;
    let membershipStatus = null;
    
    if (userId) {
      const userMembership = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: Number(userId),
            companyId: Number(companyId),
          }
        },
        include: {
          role: true,
        }
      });

      if (userMembership) {
        userRole = userMembership.role;
        membershipStatus = userMembership.approved ? 'approved' : 'pending';
      }
    }
    
    // Devolver información detallada de la empresa
    res.status(200).json({
      id: company.id,
      name: company.name,
      description: company.description,
      public: company.public,
      owner: company.owner,
      memberCount: company._count.members,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      currentUserRole: userRole,
      currentUserStatus: membershipStatus,
      isOwner: company.ownerId === Number(userId),
    });
  } catch (error) {
    console.error('Error al obtener detalles de la empresa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
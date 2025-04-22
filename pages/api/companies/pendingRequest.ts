
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

    // Verificar que el usuario tiene permisos para ver las solicitudes pendientes
    const company = await prisma.company.findUnique({
      where: { id: Number(companyId) },
    });

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    // Verificar si el usuario es propietario o administrador
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

    const isOwner = company.ownerId === Number(userId);
    const isAdmin = userMembership?.role?.level !== undefined && userMembership.role.level <= 2;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'No tienes permisos para ver las solicitudes pendientes' });
    }

    // Obtener solicitudes pendientes
    const pendingRequests = await prisma.userCompany.findMany({
      where: {
        companyId: Number(companyId),
        approved: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        role: true,
      }
    });

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
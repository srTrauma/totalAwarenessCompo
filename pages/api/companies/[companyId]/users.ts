import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/companies/[companyId]/users: lista todos los usuarios aprobados de la empresa
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

    // Verificar que el usuario tiene permisos para ver los usuarios de la empresa
    const userMembership = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: Number(userId),
          companyId: Number(companyId),
        }
      },
      include: { role: true }
    });

    if (!userMembership || !userMembership.approved) {
      return res.status(403).json({ message: 'No tienes permisos para ver los usuarios de esta empresa' });
    }

    // Listar todos los usuarios aprobados de la empresa
    const users = await prisma.userCompany.findMany({
      where: {
        companyId: Number(companyId),
        approved: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    });

    // Solo devolver el objeto user
    res.status(200).json(users.map(u => u.user));
  } catch (error) {
    console.error('Error al listar usuarios de la empresa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}


import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'El ID del usuario es obligatorio' });
    }

    // Obtener todas las empresas donde el usuario es miembro
    const memberships = await prisma.userCompany.findMany({
      where: {
        userId: Number(userId),
      },
      include: {
        company: true,
        role: true,
      }
    });

    const companies = memberships.map(membership => ({
      id: membership.company.id,
      name: membership.company.name,
      description: membership.company.description,
      public: membership.company.public,
      isOwner: membership.company.ownerId === Number(userId),
      role: membership.role.name,
      approved: membership.approved,
      createdAt: membership.company.createdAt,
    }));

    res.status(200).json(companies);
  } catch (error) {
    console.error('Error al listar empresas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}